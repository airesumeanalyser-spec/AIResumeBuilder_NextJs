-- Run in Supabase SQL editor or via CLI. Assumes auth.users exists.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email text,
  subscription_tier text default 'free',
  trial_uses integer default 0,
  max_trial_uses integer default 3,
  trial_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.resumes (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  file_name varchar(500) not null,
  file_path varchar(1000) not null,
  file_size integer,
  mime_type varchar(100),
  storage_url text,
  analysis_data jsonb,
  ats_score integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_resumes_user_id on public.resumes (user_id);
create index if not exists idx_resumes_created on public.resumes (created_at desc);

alter table public.resumes enable row level security;

create policy "resumes_all_own"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.kv_store (
  id bigint generated always as identity primary key,
  key varchar(500) not null,
  value text,
  user_id uuid references public.profiles (id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (key, user_id)
);

create index if not exists idx_kv_key on public.kv_store (key);
create index if not exists idx_kv_user on public.kv_store (user_id);

alter table public.kv_store enable row level security;

create policy "kv_all_own"
  on public.kv_store for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.payments (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  razorpay_order_id varchar(100) unique not null,
  razorpay_payment_id varchar(100),
  razorpay_signature varchar(256),
  amount integer not null,
  currency varchar(10) default 'INR',
  payment_status varchar(50),
  plan_id varchar(100) not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_payments_user on public.payments (user_id);

alter table public.payments enable row level security;

create policy "payments_all_own"
  on public.payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resumes_bucket_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "resumes_bucket_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "resumes_bucket_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "resumes_bucket_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
