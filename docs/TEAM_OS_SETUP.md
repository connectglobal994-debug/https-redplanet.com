# Red Planet Team OS — Development setup

## What is included
- `public/team-portal.html` (served at `/team-portal.html`): original sign-in, personal task list, daily focus, AI Academy learning path, KPI summary.
- `public/team-portal.js`: original Supabase Auth and browser-side data access using the publishable key only.
- `public/team-portal.css`: original responsive Red Planet interface.
- `public/supabase-config.js`: original public project URL and publishable key only; never add a service-role key here.
- `supabase/functions/ai-teacher/index.ts`: authenticated AI Teacher Edge Function, restored from the original site.
- `supabase/migrations/202611210001_team_os.sql`: tasks, KPI assignments, training progress/materials and row-level security.

## Required setup before sign-in works
1. Create a Supabase **development** project.
2. Apply the migration files in the migration branch in filename order, including `202611190001_core_schema.sql`, `202611190002_public_intake_news.sql`, `202611190003_ecosystem_expansion.sql`, `202611200001_harden_ecosystem_rls.sql`, and then `202611210001_team_os.sql`. The original migration sequence was renumbered to avoid timestamp collisions; use the exact filenames from the branch.
3. In Supabase Authentication settings, configure the site URL and email redirect URLs for the deployed domain and local development.
4. Copy the Project URL and publishable/anon key from Supabase Project Settings → API into `supabase-config.js` (`url` and `anonKey`).
5. Never put the service-role key, database password, PayPal secret or AI provider keys in this file or any browser code.
6. Create individual team accounts. An administrator role must be granted securely from the Supabase SQL editor or trusted server—not from the signup form. Example after verifying the correct auth user:
   `insert into public.user_roles(user_id, role) values ('AUTH-USER-UUID','administrator');`
7. Test with two ordinary accounts: each must only see their own tasks, KPI targets and training progress. Verify admin access separately before onboarding the whole team.

## Current limits (do not represent as finished)
- The original Team OS and AI Teacher source are restored into the migration branch. The `/academy` page links to the original Supabase-backed team portal. The Edge Function is source code only until deployed to the verified development project and supplied with an `OPENAI_API_KEY` secret.
- Manager assignment, team-wide task creation, admin member management, hiring pipeline, interview scorecards, software inventory, notifications and daily-update persistence are not yet implemented.
- This static GitHub Pages front end cannot securely store secrets or run privileged operations. Use Supabase Edge Functions for those.
- The public browser config contains only the original Supabase URL and publishable key. The Supabase project reference must be confirmed with the owner before applying migrations or deploying functions. No database migration or Edge Function is live merely because these files are committed.


## AI Teacher setup
1. Confirm the intended Supabase development project reference matches `public/supabase-config.js`; stop if it does not.
2. From the repository root, deploy the authenticated Edge Function: `supabase functions deploy ai-teacher`.
3. Add the model-provider key as a Supabase Function secret, never in `team-portal.html`, `team-portal.js`, or `supabase-config.js`: `supabase secrets set OPENAI_API_KEY=...`.
4. Optional: set `OPENAI_MODEL` to an enabled model for your account. The function defaults to `gpt-4.1-mini`.
5. Apply the Team OS migration and verify the authenticated user can read only published resources allowed by the row-level security policies.
6. Sign in with a normal team account and ask the AI Teacher a question. Verify the answer cites the approved resource titles returned by the function and does not expose another user's private data.
7. The AI Teacher uses approved published resources as context; chat messages do not automatically retrain the underlying model. Do not enter passwords, API keys, private customer data, or sensitive employee information.
8. Before wider rollout, test administrator publishing, ordinary-member access, resource visibility, sign-out, rate limits and provider error handling in the development project.
