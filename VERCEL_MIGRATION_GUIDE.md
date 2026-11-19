# Red Planet Portal — Vercel Migration Package

This package contains the supplied Red Planet Portal Next.js source handoff, normalized for GitHub/Vercel import.

## Important deployment status

This is an integration handoff, **not a production-ready release**. The source includes the Next.js application and API routes, but the master handoff and audit identify incomplete production systems: database/persistence, full user and studio RBAC, member/news APIs, artist/studio workspaces, live market/MT5 integration, and automated tests/CI.

Do not present the trading screen as a live broker connection. Do not enable live trading. Deploy a preview only after the dependency install and checks pass.

## Package hygiene

- No real `.env`, `.env.local`, or `public/.env*` files are included.
- `.env.example` and `.env.local.example` contain placeholders only.
- Bundled demo audio and artwork are retained and Git-tracked by the adjusted `.gitignore`.
- `data/uploaded-tracks.json` remains ignored as mutable local upload state.
- Never commit actual API keys, passwords, Blob tokens, or private credentials.

## GitHub import steps

1. Create a new branch in the intended repository, e.g. `nextjs-portal-migration`.
2. Extract this ZIP on your computer.
3. Upload the extracted files and folders to the branch root (not the ZIP file itself).
4. Keep the existing production branch and live site unchanged.
5. Confirm the repository root contains `package.json`, `package-lock.json`, `app/`, `components/`, `lib/`, and `public/`.
6. Open a pull request for review. Do not merge to the production branch yet.

If Vercel is already showing the older static `red-planet-main` repository, do not deploy that revision. Import the branch/repository only after the Next.js files are present at its root.

## Vercel configuration

- Framework preset: Next.js
- Root directory: `./`
- Build command: leave default (`next build`)
- Output directory: leave Next.js default
- Install command: leave automatic (`npm install` / lockfile detection)

## Environment variables

The source setup guide documents these server-side variables:

- `ADMIN_UPLOAD_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `ANTHROPIC_API_KEY` (optional AI provider)
- `GEMINI_API_KEY` (optional AI provider)
- `RESEND_API_KEY` (investor email notification provider)
- `NEXT_PUBLIC_SITE_URL` (public origin; not a secret)

Do not invent values. Generate a unique strong admin password and random session secret, provision a Vercel Blob store for the Blob token, and obtain provider keys only if enabling those integrations. Add them in Vercel Project Settings → Environment Variables, not in Git. Restrict secrets to the environments where they are needed. The public site URL can be set to the Vercel preview URL for preview and the real domain only after production approval.

## Verification gate

The local environment used to prepare this package has Node.js 22.16.0 and npm 10.9.2. A clean `npm ci --ignore-scripts --no-audit --no-fund` attempt timed out in this environment, so no successful install/build/lint/typecheck is claimed.

Before production:
1. `npm ci`
2. `npm run lint`
3. `npx tsc --noEmit`
4. `npm run build`
5. Test all API routes and upload/auth flows.
6. Verify media playback and persistence after redeployment.
7. Verify mobile layouts, error states, and security boundaries.
8. Review the blockers in `AUDIT_REPORT.md` and `RED_PLANET_HANDOFF.md`.
9. Deploy Preview, obtain acceptance sign-off, then separately approve Production.

## Files

See `RED_PLANET_HANDOFF.md` for the unified platform vision and delivery phases, and `AUDIT_REPORT.md` for the supplied code audit and known gaps.
