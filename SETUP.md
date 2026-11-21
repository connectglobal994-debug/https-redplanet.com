# Red Planet Portal — Local Setup & Deployment Gate

## 1. Requirements
- Node.js 22 LTS (or a Next.js 16-supported Node release)
- npm
- A Vercel project for the intended deployment
- A Vercel Blob store for persistent uploaded media
- A dedicated Supabase project (use development/staging first)

## 2. Install and configure
```bash
npm ci
cp .env.local.example .env.local
```

Configure the server-side values in local development and the matching Vercel environment:
- `ADMIN_UPLOAD_PASSWORD`: temporary shared password for the legacy upload-only gate; it is not the platform-owner account and must not be reused as a staff login
- `ADMIN_SESSION_SECRET`: random secret of at least 32 bytes for signing the temporary upload session
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token
- `ANTHROPIC_API_KEY` and/or `GEMINI_API_KEY`: AI provider keys
- `RESEND_API_KEY`: transactional email provider key
- `RESEND_FROM_EMAIL`: verified sender address (when configured in the email provider)
- `NEXT_PUBLIC_SITE_URL`: public site origin
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-only Supabase service-role key

Never put real credentials in source files, `public/`, `.env.example`, or `.env.local.example`. Never expose provider secrets through `NEXT_PUBLIC_*`. Rotate any credential that has been shared in chat, committed, or otherwise exposed.

## 3. Database migrations
Apply every SQL migration in `supabase/migrations/` to the intended Supabase project in filename order, beginning with `202611190001_core_schema.sql`. The migration branch now contains the original Red Planet Team OS, music, collaboration, TV editorial, trading-workspace, and multi-provider payment/refund migrations carried forward from `main`. Those 23 original migrations were renumbered to `202611210001` through `202611210023` because `202611200001` is already used by this branch's ecosystem RLS-hardening migration. The resulting order is: core schema; public intake/news; ecosystem expansion (including the extended role catalog); ecosystem RLS hardening; then the 23 `20261121` migrations in numeric order. Do not restore the original `202611200001`–`202611200023` filenames alongside these files: that would create duplicate migration versions. Review the SQL and test it against a disposable development project before applying it to production. Back up the database first. The repository does not confirm that any of these migrations have been applied to the live Supabase project.

The migrations create data structures and row-level security policies; they do not provision the initial platform-owner account, configure OAuth/payment providers, activate M-Pesa/PayPal/card processing, connect social accounts, or deploy media transcoding. Do not grant yourself a role by inserting directly from a browser. Privileged role grants must be performed through a trusted server-side administrative process.

## 4. Authentication status — important
The current `/api/auth` endpoint and signed cookie are a temporary shared-password gate for the media-upload workflow. They are **not** a complete user identity system, not multi-user staff authentication, and not the requested platform-owner account. Do not use this gate for general administration or invite staff through it. The production owner account must be created through Supabase Auth with a private invite/password-reset flow, and its `platform_owner` role must be assigned server-side after verifying the owner identity. The first password must never be committed or placed in chat. MFA, rate limiting, session revocation, and role-audited admin actions are required before opening administration to staff.

## 5. Run locally
```bash
npm run dev
```
Open http://localhost:3000.

## 6. Checks
```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=high
```
All checks, including the separate dependency security audit, must pass before production deployment. CI runs quality checks independently so an audit failure does not hide lint/typecheck/build results; the audit remains a release blocker.

## 7. Deployment status
This branch is an integration handoff, not a production release. The full user/artist/studio authentication system, initial platform-owner provisioning, database application, payment integrations, complete department admin console, production news workflow, and live trading integration are not yet verified. Trading must remain clearly marked as a prototype/disconnected until a separately secured MT5 bridge is implemented and tested.

## 8. Vercel release sequence
1. Connect the reviewed migration branch to a Preview deployment.
2. Configure secrets in the correct Vercel environments.
3. Apply and verify migrations in a dedicated Supabase development project.
4. Provision Vercel Blob and verify uploaded media persists after a fresh deployment.
5. Validate authentication, authorization, uploads, playback, member intake, news, investor intake, email, AI provider connectivity, mobile layouts, and failure states.
6. Complete a security review and verify every CI job.
7. Promote to Production only after the owner signs off.

GitHub Pages is not suitable for this application: API routes, private credentials, secure sessions, and persistent media require a server-capable deployment.
