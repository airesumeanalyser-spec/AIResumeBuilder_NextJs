# Architecture & technical context

Companion to the root [**README.md**](../README.md). Use this file when changing auth, APIs, data model, or deployment behavior.

---

## High-level diagram (conceptual)

```text
Browser
  ├── Next.js pages (src/app/**/page.tsx) — mostly "use client" for interactive flows
  ├── Zustand store (src/lib/api.ts) — fetch same-origin /api/*
  └── Supabase JS (login) — OAuth / email; session cookies via @supabase/ssr

middleware.ts
  └── Refreshes Supabase session on matched routes

Route handlers (src/app/api/**)
  ├── createServerSupabase() — cookie-bound user for RLS-safe DB ops
  ├── createAdminClient() — service role ONLY after auth checks (e.g. Storage paths)
  └── Vertex AI (src/lib/ai.ts) — resume analysis, OCR, chat-shaped helpers
```

---

## Authentication

| Mechanism | Detail |
|-----------|--------|
| Provider | Supabase Auth |
| UI | `/login` — Google OAuth + `signInWithPassword` |
| Callback | `GET /auth/callback` — `exchangeCodeForSession` |
| Session | HTTP-only cookies; `middleware.ts` calls `getUser()` refresh pattern |
| Profile row | `public.profiles` keyed by `auth.users.id` (UUID); trigger + `ensureProfile` on status |

Legacy **custom JWT + Google OAuth + Neon** is removed; all user IDs in app code are **UUIDs** aligned with `auth.users.id`.

---

## Database (Supabase Postgres)

Tables (see `supabase/migrations/`):

| Table | Role |
|-------|------|
| `profiles` | `id` = user UUID; trial counters, display name, email mirror |
| `resumes` | Optional durable resume metadata (not all flows write here) |
| `kv_store` | Key-value per user `(key, user_id)` — powers `resume:{id}` blobs |
| `payments` | Razorpay-related records when wired fully |

**RLS** is enabled; server routes use the **user’s** Supabase client for mutations that must respect RLS, or filter explicitly by `user.id` when using patterns that require care.

---

## Storage (Supabase Storage)

| Item | Detail |
|------|--------|
| Bucket | `resumes` (private) |
| Path shape | `{userId}/{fileId}.{ext}` (no `users/` prefix vs very old GCS layout) |
| Server uploads | `src/lib/storage.ts` uses **service role** after request auth |

---

## API routes (Route Handlers)

Base URL is same-origin (`/api/...`).

| Path | Method | Purpose |
|------|--------|---------|
| `/api/auth/status` | GET | `{ isAuthenticated, user, trial, plan_type, ... }` |
| `/api/auth/signout` | POST | Clear Supabase session |
| `/api/auth/upgrade-plan` | POST | Placeholder for post-payment plan updates |
| `/api/files` | GET/POST | Upload (multipart), read (blob), list, write, delete |
| `/api/kv` | GET/POST | get / set / delete / list / flush scoped to user |
| `/api/ai` | GET/POST | AI actions via `?action=` (see below) |
| `/api/payments` | POST | Razorpay create-order, verify-payment |

### `/api/ai?action=` (non-exhaustive)

- `chat`, `feedback`, `img2txt`, `convert-to-markdown`, `rebuild-resume`, `analyze`, `inline-suggestions`, `apply-suggestions`, `extract-jd`, `use-trial`, `check-trial`

Heavy or multipart actions use **Node** runtime (`runtime = "nodejs"`, extended `maxDuration` where set).

---

## Frontend structure

| Area | Location |
|------|----------|
| App shell / fonts | `src/app/layout.tsx`, `globals.css` |
| API store init | `src/components/ApiInit.tsx` |
| Shared UI | `src/components/*` |
| AI prompt text | `src/constants/prompts.ts` |
| Vertex integration | `src/lib/ai.ts` (dynamic imports of prompts) |

---

## Path alias

`@/*` → `src/*` (TypeScript + bundler).

---

## Legacy / removed

- React Router + Vite + `/api` as Vercel Node handlers  
- Neon + custom session cookies  
- Google Cloud Storage direct SDK in app code  

If docs or scripts still mention these, treat them as obsolete.
