# AI Resume Analyzer

Production-style web app for uploading resumes, extracting text, running **ATS-style analysis**, and storing per-user data. Built as a **Next.js (App Router)** client plus **Route Handlers** for API-style endpoints, with **Supabase** for auth, Postgres, and file storage, and **Google Vertex AI (Gemini)** for LLM work.

---

## Start here (new contributors & AI sessions)

1. Read this **README** end-to-end for stack, env, and folder layout.  
2. For implementation detail, see [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md).  
3. For how and when to update docs, see [**docs/DOCUMENTATION.md**](docs/DOCUMENTATION.md).  

Repository also includes [**AGENTS.md**](AGENTS.md) so automated assistants know to load this README first.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js 15, App Router, React 19, TypeScript |
| UI | Tailwind CSS v4, shared components under `src/components` |
| Auth & DB | Supabase (Auth, Postgres, RLS, Storage) |
| AI | `@google-cloud/vertexai` — prompts in `src/constants/prompts.ts` |
| Client state | Zustand (`src/lib/api.ts` API client + auth/trial/KV/fs/ai helpers) |
| Payments | Razorpay (`/api/payments`) |
| Deploy | Vercel-friendly (`vercel.json`); see [Deployment](#deployment) |

---

## Repository layout

```
src/
  app/                 # App Router: pages, layouts, globals.css
    api/               # Route handlers (ai, auth, files, kv, payments)
    auth/callback/     # Supabase OAuth code exchange
    login/             # Sign-in (Google + email/password)
    upload/              # Main upload & analyze flow
    resume/[id]/       # Results / ATS UI
    ...
  components/          # Presentational & feature UI (client where needed)
  lib/                 # Shared logic: api store, db helpers, ai, storage, utils
  constants/           # Prompts & static sample data
  server/              # Reserved / optional server-only modules
  types/               # Ambient/global types (e.g. Resume, Feedback)
supabase/
  migrations/          # SQL: schema, RLS, storage policies (apply in Supabase)
public/                # Static assets (images, pdf.worker)
docs/                  # Architecture & documentation policy
middleware.ts          # Supabase session refresh
```

Detailed trees and data flows: [**docs/ARCHITECTURE.md**](docs/ARCHITECTURE.md).

---

## Prerequisites

- **Node.js 20+** (LTS recommended)  
- **npm**  
- **Supabase** project (URL, anon key, service role key)  
- **Google/C Vertex AI** project for resume features (`GCP_PROJECT_ID`, credentials)  
- Optional: **Razorpay** keys for live payments  

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in values.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; storage & privileged DB (never expose to client) |
| `NEXT_PUBLIC_APP_URL` | Optional; site origin for edge cases (e.g. OAuth) |
| `GCP_PROJECT_ID`, `VERTEX_AI_*` | Vertex / Gemini |
| `NEXT_PUBLIC_RZP_KEY_ID`, `RZP_KEY_ID`, `RZP_KEY_SECRET` | Razorpay |

Full list and notes: **`.env.example`**.

---

## Database & Supabase setup

1. In the Supabase dashboard, open **SQL Editor**.  
2. Run the migration(s) under **`supabase/migrations/`** (start with the dated `*_initial.sql` file).  
3. Confirm **Auth** providers (Google, Email, etc.) and **redirect URLs** include:  
   - `http://localhost:3000/auth/callback`  
   - your production URL + `/auth/callback`  
4. Ensure Storage bucket **`resumes`** exists and policies match the migration (private bucket, user-scoped paths).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (default `http://localhost:3000`) |
| `npm run build` | Production build |
| `npm run start` | Start production server (after `build`) |
| `npm run lint` | ESLint (if configured) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:db` | Stub reminder — apply migrations in Supabase |
| `npm run test:ai` | Stub reminder — test AI via app + env |

---

## Main user flows

1. **Sign in** → `/login` (OAuth or email/password via Supabase).  
2. **Upload** → `/upload` → files go to Supabase Storage under `{userId}/...`; metadata and resume JSON often in **KV** (`kv_store`) keyed by `resume:{id}`.  
3. **Analyze** → `POST /api/ai?action=...` (chat, analyze, img2txt, extract-jd, trial usage, etc.).  
4. **View results** → `/resume/[id]` reads KV and file paths from stored payload.  

API parity is documented in **`docs/ARCHITECTURE.md`** (route list).

---

## Deployment

- **Vercel**: set all env vars; framework is Next.js (`vercel.json`).  
- **Service role**: only on server; never prefix with `NEXT_PUBLIC_`.  
- **GCP**: provide credentials as Vercel secrets or ADC as per your org’s pattern.  

---

## Conventions for code changes

- Prefer **`@/`** imports (see `tsconfig.json` paths).  
- Client components: mark with **`"use client"`** where hooks or browser APIs are used.  
- New API surface: add under **`src/app/api/.../route.ts`** and document in **README** or **docs/ARCHITECTURE.md**.  
- After features or refactors: update docs **last** per [**docs/DOCUMENTATION.md**](docs/DOCUMENTATION.md).  

---

## License / ownership

Private project (`"private": true` in `package.json`). Add a license file if you open-source.

---

## Related docs

| File | Content |
|------|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Routes, APIs, auth, storage paths, DB tables |
| [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) | When and how to update documentation |
| [.env.example](.env.example) | Environment template |
