# AGENTS.md

## Cursor Cloud specific instructions

This is a **client-side only SPA** (no backend, no database, no Docker). The only service to run is the Vite dev server.

### Quick reference

| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 3000, `0.0.0.0`) |
| Type-check / lint | `npm run lint` (runs `tsc`) |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

See `CLAUDE.md` for full architecture details, provider system, and development guidelines.

### Non-obvious notes

- There are **no automated tests** in this repo (no test framework configured). Validation is done via `tsc` type-checking and manual browser testing.
- API keys are entered at runtime through the in-app Settings UI (encrypted in `localStorage`). No secrets are needed at build time — the `.env` file only sets `VITE_REQUEST_TIMEOUT_MS`.
- The `npm run lint` command runs `tsc` (TypeScript compiler in `noEmit` mode), not ESLint. There is no ESLint configuration.
- To perform a meaningful translation test, you need a valid AI provider API key configured through the app's settings modal.
