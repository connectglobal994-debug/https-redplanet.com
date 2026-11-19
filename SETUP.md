# Red Planet Portal — Local Setup & Deployment Gate

## 1. Requirements
- Node.js 22 LTS (or a Next.js 16-supported Node release)
- npm
- A Vercel project for the intended production deployment
- A Vercel Blob store for persistent uploaded media

## 2. Install and configure
```bash
npm ci
cp .env.local.example .env.local
```
Set real values in `.env.local` locally and in Vercel Project Settings → Environment Variables for production:
- `ADMIN_UPLOAD_PASSWORD`: unique admin password
- `ADMIN_SESSION_SECRET`: random secret, at least 32 bytes
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token
- `ANTHROPIC_API_KEY` and/or `GEMINI_API_KEY`: AI provider keys
- `RESEND_API_KEY`: investor email notifications
- `NEXT_PUBLIC_SITE_URL`: public site origin
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key (never use a `NEXT_PUBLIC_` prefix)

Never put real credentials in source files, `public/`, `.env.example`, or `.env.local.example`. Never expose provider secrets through `NEXT_PUBLIC_*`.

Apply the SQL migrations in `supabase/migrations/` to the intended Supabase project in filename order. The second migration creates the membership waitlist and editorial news tables. Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only; never expose it to browser code.

## 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000.

## 4. Checks
```bash
npm run lint
npx tsc --noEmit
npm run build
```
A clean install and all three checks must pass before production deployment. Add automated tests and exercise every API route before launch.

## 5. Deployment status
This archive is an integration handoff, not a production release. The admin upload API now requires a signed HttpOnly session, but the complete user/artist/studio authentication system, database, missing News and Members APIs, and live trading integration are not yet implemented. Do not deploy as a finished product until the blockers in `AUDIT_REPORT.md` are closed.

## 6. Vercel
1. Push the reviewed source to the connected Git repository.
2. Configure the environment variables above in the correct Vercel environments.
3. Provision Vercel Blob and verify uploads persist after a fresh deployment.
4. Deploy a Preview first.
5. Verify auth, media upload/playback, investor intake, AI provider connectivity, mobile layouts, and error states.
6. Promote to Production only after sign-off.

GitHub Pages is not suitable for this application: API routes, private credentials, secure sessions, and persistent media require a server-capable deployment.
