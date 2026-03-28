# Documentation policy

This project treats the root [**README.md**](../README.md) as the **master** context document. Use this file for **process**: when and what to update.

---

## Rule: documentation is the last step

When you finish a task (feature, bugfix, refactor, or migration):

1. Ship the code change.  
2. Run build/tests as appropriate.  
3. **Then** update documentation so the next human or AI session is not misled.

Skipping doc updates should be the exception (e.g. single-line typo with no behavioral change).

---

## What to update (checklist)

| Change type | Update |
|-------------|--------|
| New env var | `.env.example` + **README** env table |
| New / removed API route | **README** (if user-facing) + **docs/ARCHITECTURE.md** route table |
| DB or RLS change | `supabase/migrations/` + **docs/ARCHITECTURE.md** |
| Auth or storage flow | **README** short summary + **docs/ARCHITECTURE.md** detail |
| Folder / convention change | **README** repository layout + **ARCHITECTURE** if needed |
| New major dependency | **README** tech stack table |

---

## Files and roles

| File | Role |
|------|------|
| `README.md` | Single entry point: stack, setup, layout, scripts, links |
| `docs/ARCHITECTURE.md` | Deep technical reference (routes, auth, DB, storage) |
| `docs/DOCUMENTATION.md` | This maintenance policy |
| `AGENTS.md` | Pointer for AI tools to read README first |
| `.cursor/rules/*.mdc` | Cursor: always include README context |

---

## New chat / AI context

Contributors and assistants should:

1. Read **README.md** before substantive edits.  
2. Open **docs/ARCHITECTURE.md** when touching API, Supabase, or AI.  

Cursor is configured via `.cursor/rules` to treat the README as mandatory project context (see rule description in-repo).
