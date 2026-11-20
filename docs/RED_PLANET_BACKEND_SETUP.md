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
- `202611200017_payment_plan_metadata.sql`
- `202611200018_paypal_membership_activation.sql`
- `202611200019_multi_provider_payments.sql`

Verify each migration succeeds. Do not assume the list has been applied just because the files exist in the repository.

## 3. Supabase Edge Functions

Deploy from the repository root after linking the verified project:

```powershell
supabase login
supabase link --project-ref YOUR_VERIFIED_PROJECT_REF
supabase functions deploy generate-music
supabase functions deploy paypal-webhook
supabase functions deploy paypal-create-order
supabase functions deploy paypal-capture-order
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
- `PAYPAL_PLAN_CATALOG` as a server-side JSON object mapping each approved plan code to `amount_minor`, uppercase `currency`, and `period_days`. Example shape only (not approved pricing): `{"member_monthly":{"amount_minor":1000,"currency":"KES","period_days":30}}`.
- `SUPABASE_ANON_KEY` for user-session verification in the order and capture functions.
- `RP_SITE_URL` set to the canonical HTTPS site origin used for PayPal return and cancel URLs.
- `ALLOWED_ORIGIN` set to the exact website origin allowed to call the checkout functions.

The webhook URL registered with PayPal is:
`https://YOUR_VERIFIED_PROJECT_REF.supabase.co/functions/v1/paypal-webhook`

## 4. Payment activation gates

- Confirm the merchant's PayPal business account and approved application.
- Configure sandbox credentials first and register the webhook URL in the PayPal developer dashboard.
- Subscribe to capture completed, denied, refunded and reversed events.
- The create-order function accepts a plan code only; the server-side plan catalog controls the amount, currency and membership duration.
- The capture function checks that the signed-in user owns the order. Browser return URLs never activate a membership.
- The verified webhook checks the captured amount and currency, then calls a service-role-only database function to activate one membership idempotently. Refunds and reversals cancel the linked membership.
- Create and verify a test order flow before accepting customer payments.
- Confirm every PayPal event is signature-verified and duplicate deliveries are idempotent.
- Do not activate memberships from an unverified browser redirect. The current webhook records verified payment outcomes; a trusted order-creation and membership-activation workflow is still required before paid plans can be sold.
- Publish plan codes, amounts, currencies, billing periods, refund rules and cancellation terms only after the business owner approves them.

## 5. Additional payment methods and international coverage

The membership schema now recognizes these payment providers: PayPal, M-Pesa, card, bank transfer, Wise, manual and other. This is provider support in the data model; it does not mean a provider is connected or ready to accept money.

Implementation requirements before enabling each method:

- **M-Pesa (Kenya):** integrate Safaricom Daraja STK Push for customer checkout and a server-side callback endpoint. Configure the Daraja consumer key/secret, shortcode or PayBill/Till details, passkey where required, environment and callback URL as server-side secrets/configuration. Verify callback authenticity and reconcile the checkout request/result before marking a payment complete. Never trust a browser success screen or a customer-entered transaction code by itself.
- **Debit/credit cards:** use a PCI-compliant hosted checkout or tokenized payment provider that is available for the merchant's registered country. Red Planet must never collect or store raw card numbers, CVV values or magnetic-stripe data. Provider webhooks must confirm the exact amount, currency and payment reference.
- **Bank transfers:** show only business-approved beneficiary details, bank name, account name, currency, SWIFT/BIC and any required routing details. Keep these details in protected server-side configuration or an admin-managed secure store, not hard-coded into public HTML. Payments remain pending until a trusted bank statement/API reconciliation or authorized finance review confirms cleared funds.
- **Wise:** use Wise Business payment links or a supported Wise Business integration where the merchant account and country are eligible. A Wise transfer is not automatically verified merely because a customer uploads a receipt. Reconcile it against the actual incoming transfer.
- **Canada and international customers:** design the checkout catalog to support approved currencies such as CAD, USD and KES per plan/provider. Confirm the merchant's settlement country, supported currencies, FX conversion, fees, tax obligations and payout bank eligibility with each provider before publishing prices. Do not assume every provider supports every currency or Kenya/Canada cross-border settlement.

Required business inputs before live activation: registered merchant country/entities, approved plan prices and currencies, business bank beneficiary details, M-Pesa PayBill/Till/shortcode and account reference, and the chosen card processor. Add these through the provider's secure dashboard/secret manager; do not send passwords, full card details, PINs or secret keys in chat or commit them to Git.

Provider-specific endpoints and webhook handlers must be implemented and sandbox-tested individually. The existing PayPal webhook is not a substitute for M-Pesa, card, Wise or bank-transfer verification. Use a shared internal payment state transition only after each provider's own server-side verification has succeeded.

## 6. Trading activation gates

- MT5 connection requests are intake records only; they do not connect a broker account.
- Do not request or store broker passwords in the website.
- A broker bridge must be hosted in a trusted server environment with per-customer credential isolation, encrypted secret storage, access controls, audit logging and explicit customer consent.
- Start with a broker demo account. Test market data, disconnections, order rejection, duplicate requests, risk limits, emergency stop and reconciliation before considering live access.
- The current customer workspace does not execute orders and cannot enable a bot.

## 7. Verification checklist

- Test account signup, email confirmation, login, password reset, profile creation, profile update and sign-out.
- Test each user can read only their own profile, membership, payment records, trading workspace and connection requests.
- Test non-staff cannot open the collaboration, editorial or trading review queues.
- Test moderators cannot publish TV stories or approve an MT5 connection as connected.
- Test artists cannot modify reviewer fields or publish their own submissions.
- Test public music storage cannot expose unpublished audio.
- Test PayPal webhook signature failures, unknown order IDs, duplicate event IDs, retries and refund/reversal events in sandbox.
- For each added provider, test invalid signatures/callbacks, duplicate notifications, wrong amount/currency, pending-to-confirmed reconciliation, refunds/reversals where supported, and payout/settlement reconciliation.
- Test the AI generation path with the provider's documented API contract and confirm audio is ingested and validated before a job is marked complete.

## 8. Live deployment status

The repository is the source of truth for committed code. This checklist does not assert that migrations, Edge Functions, provider secrets, DNS, broker bridges, or payment webhooks have been deployed. Record each successful test and deployment separately before enabling production access.
