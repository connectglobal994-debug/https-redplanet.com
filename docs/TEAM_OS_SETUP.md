# Red Planet Team OS — Development setup

## What is included
- `team-portal.html`: sign-in, personal task list, daily focus, AI Academy learning path, KPI summary.
- `team-portal.js`: Supabase Auth and browser-side data access using the publishable anon key only.
- `team-portal.css`: responsive Red Planet interface.
- `supabase/migrations/202611200001_team_os.sql`: tasks, KPI assignments, training progress/materials and row-level security.

## Required setup before sign-in works
1. Create a Supabase **development** project.
2. Apply `202611190001_core_schema.sql`, then `202611200001_team_os.sql` in the Supabase SQL Editor.
3. In Supabase Authentication settings, configure the site URL and email redirect URLs for the deployed domain and local development.
4. Copy the Project URL and publishable/anon key from Supabase Project Settings → API into `supabase-config.js` (`url` and `anonKey`).
5. Never put the service-role key, database password, PayPal secret or AI provider keys in this file or any browser code.
6. Create individual team accounts. An administrator role must be granted securely from the Supabase SQL editor or trusted server—not from the signup form. Example after verifying the correct auth user:
   `insert into public.user_roles(user_id, role) values ('AUTH-USER-UUID','administrator');`
7. Test with two ordinary accounts: each must only see their own tasks, KPI targets and training progress. Verify admin access separately before onboarding the whole team.

## Current limits (do not represent as finished)
- The AI Academy currently includes starter learning paths and progress tracking; it does not yet call a live AI model. AI tutor integration requires a server-side Edge Function and provider secret.
- Manager assignment, team-wide task creation, admin member management, hiring pipeline, interview scorecards, software inventory, notifications and daily-update persistence are not yet implemented.
- This static GitHub Pages front end cannot securely store secrets or run privileged operations. Use Supabase Edge Functions for those.
- No database migration is applied merely by committing these files. Apply in development and test RLS before production.


## AI Teacher setup
1. Deploy the authenticated Edge Function: `supabase functions deploy ai-teacher`.
2. Add the model-provider key as a Supabase Function secret, never in `team-portal.html`, `team-portal.js`, or `supabase-config.js`: `supabase secrets set OPENAI_API_KEY=...`.
3. Optional: set `OPENAI_MODEL` to an enabled model for your account. The function defaults to `gpt-4.1-mini`.
4. Apply the Team OS migration and verify the authenticated user can read only published resources allowed by the row-level security policies.
5. Sign in with a normal team account and ask the AI Teacher a question. Verify the answer cites the approved resource titles returned by the function and does not expose another user's private data.
6. The AI Teacher uses approved published resources as context; chat messages do not automatically retrain the underlying model. Do not enter passwords, API keys, private customer data, or sensitive employee information.
7. Before wider rollout, test administrator publishing, ordinary-member access, resource visibility, sign-out, rate limits and provider error handling in the development project.
