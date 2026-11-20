# Red Planet backend activation checklist

This document separates code committed to GitHub from services that have actually been configured in Supabase or with external providers. A committed migration or Edge Function is not proof that it is live.

## 1. Confirm the Supabase project before deployment

- Confirm the intended Supabase project in the Supabase dashboard.
- Compare its project reference with `supabase-config.js` before applying migrations or deploying functions. Stop if the reference does not match.
- Use a dedicated development project first. Take a database backup before production migrations.
- Never paste a service-role key, PayPal secret, music-provider secret, broker password, or webhook secret into frontend files, GitHub, chat, or client-side environment variables.

## 2. Database migrations

Apply the repository migrations in filename order, after reviewing them in the Supabase SQL editor or through the Supabase CLI:

- `202611190001_core_schema.sql`
- `202611200001_team_os.sql`
- `202611200002_music_private_storage.sql`
- `202611200003_music_generation_jobs.sql`
- `202611200004_music_public_delivery.sql`
- `202611200005_music_staff_publishing.sql`
- `202611200006_music_publish_rollback.sql`
- `202611200007_music_delivery_delete.sql`
- `202611200008_team_task_assignment.sql`
- `202611200009_collaboration_crm.sql`
- `202611200010_artist_submission_review_guard.sql`
- `202611200011_training_material_permissions.sql`
- `202611200012_tv_editorial_cms.sql`
- `202611200013_tv_editorial_guard.sql`
- `202611200014_trading_workspace.sql`
- `202611200015_trading_review_guard.sql`
- `202611200016_payment_webhook_events.sql`

Verify each migration succeeds. Do not assume the list has been applied just because the files exist in the repository.

## 3. Supabase Edge Functions

Deploy from the repository root after linking the verified project:

```powershell
supabase login
supabase link --project-ref YOUR_VERIFIED_PROJECT_REF
supabase functions deploy generate-music
supabase functions deploy paypal-webhook
```

The project reference above is a placeholder. Replace it only with the confirmed project reference.

### Function secrets

Configure secrets in the Supabase dashboard or CLI secret manager. Do not commit secret values.

For `generate-music`:
- `MUSIC_PROVIDER_URL`
- `MUSIC_PROVIDER_API_KEY`
- `ALLOWED_ORIGIN`
- Supabase supplies the project URL and service role to the Edge Function runtime; verify the expected environment variables exist before testing.

For `paypal-webhook`:
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV` set to `sandbox` for testing or `live` after merchant approval.

The webhook URL registered with PayPal is:
`https://YOUR_VERIFIED_PROJECT_REF.supabase.co/functions/v1/paypal-webhook`

## 4. Payment activation gates

- Confirm the merchant's PayPal business account and approved application.
- Configure sandbox credentials first and register the webhook URL in the PayPal developer dashboard.
- Subscribe to capture completed, denied, refunded and reversed events.
- Create and verify a test order flow before accepting customer payments.
- Confirm every PayPal event is signature-verified and duplicate deliveries are idempotent.
- Do not activate memberships from an unverified browser redirect. The current webhook records verified payment outcomes; a trusted order-creation and membership-activation workflow is still required before paid plans can be sold.
- Publish plan codes, amounts, currencies, billing periods, refund rules and cancellation terms only after the business owner approves them.

## 5. Trading activation gates

- MT5 connection requests are intake records only; they do not connect a broker account.
- Do not request or store broker passwords in the website.
- A broker bridge must be hosted in a trusted server environment with per-customer credential isolation, encrypted secret storage, access controls, audit logging and explicit customer consent.
- Start with a broker demo account. Test market data, disconnections, order rejection, duplicate requests, risk limits, emergency stop and reconciliation before considering live access.
- The current customer workspace does not execute orders and cannot enable a bot.

## 6. Verification checklist

- Test account signup, email confirmation, login, password reset, profile creation, profile update and sign-out.
- Test each user can read only their own profile, membership, payment records, trading workspace and connection requests.
- Test non-staff cannot open the collaboration, editorial or trading review queues.
- Test moderators cannot publish TV stories or approve an MT5 connection as connected.
- Test artists cannot modify reviewer fields or publish their own submissions.
- Test public music storage cannot expose unpublished audio.
- Test PayPal webhook signature failures, unknown order IDs, duplicate event IDs, retries and refund/reversal events in sandbox.
- Test the AI generation path with the provider's documented API contract and confirm audio is ingested and validated before a job is marked complete.

## 7. Live deployment status

The repository is the source of truth for committed code. This checklist does not assert that migrations, Edge Functions, provider secrets, DNS, broker bridges, or payment webhooks have been deployed. Record each successful test and deployment separately before enabling production access.
