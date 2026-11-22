# Red Planet Jobs and Careers deployment

## Migration order

Apply to the **development** Supabase project using SQL Editor, in this order:

1. `supabase/migrations/202611190001_core_schema.sql` (only if not already applied)
2. `supabase/migrations/202611220001_jobs_platform.sql`
3. `supabase/migrations/202611220002_candidate_careers.sql`

Do not re-run the core schema blindly on production. Confirm the migration history first. The Jobs and Careers migrations use `public.has_redplanet_role(text[])` from the core schema.

## Vercel environment variables

Set these for the Preview/Development environment first:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase publishable/anon key (server environment variable; safe to use only as public project key)
- `SUPABASE_SERVICE_ROLE_KEY`: service-role secret; server-only, never use in browser code
- `CRON_SECRET`: long random secret used by Vercel Cron

Existing administrator upload authentication may also require `ADMIN_UPLOAD_PASSWORD` and `ADMIN_SESSION_SECRET`.

Redeploy Preview after setting environment variables. Do not commit any secret values.

## Supabase Auth

In Supabase Authentication settings:

- Confirm email/password sign-in is enabled.
- Set the correct Site URL for the Preview deployment.
- Configure allowed redirect URLs for the Preview and production domains.
- Decide whether email confirmation is required. If enabled, a new account must confirm its email before signing in.

## Verification checklist

1. Confirm all three migrations are present in Supabase migration history.
2. Create a test account at `/account`, verify email if required, then sign in.
3. Create and save a CV at `/career/profile`; refresh the page and confirm the saved information reloads.
4. Verify the CV profile and resume rows belong to the authenticated user.
5. Attempt to access another user's profile using a different test account; access must be denied.
6. Apply for a published test job. Confirm the application stores a CV snapshot and a second application is rejected.
7. Confirm an anonymous application request returns HTTP 401.
8. Confirm ordinary users cannot publish jobs (HTTP 403 from the admin-only publishing endpoint).
9. Confirm the Jobicy importer rejects requests without the correct cron secret.
10. Confirm Vercel Cron invokes `/api/jobs/ingest` and ingestion history is recorded.
11. Run `npm ci`, `npm run lint`, `npm run typecheck`, and `npm run build` in CI before merging.

## Important scope notes

- The Jobicy importer currently covers remote listings only. Physical/local listings are added by administrators until additional lawful, licensed/local employer feeds are integrated.
- Candidate APIs validate the Supabase access token against Supabase Auth before using the server service role.
- The candidate profile is private by default. Do not expose CV files or personal data publicly without an explicit user-sharing feature and consent.
- Do not move to production until CI, RLS tests, account verification, cron verification, and preview acceptance all pass.
