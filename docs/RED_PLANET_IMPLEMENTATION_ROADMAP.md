# Red Planet — Implementation Roadmap

**Status:** Approved product direction; implementation plan, not a claim that integrations are live.  
**Primary repository:** `connectglobal994-debug/https-redplanet.com`  
**Primary branch:** `main`

## 1. Confirmed product decisions

- One Red Planet platform for original music, independent artists, AI, TV/news, collaborations, membership and a separately permissioned trading area.
- Display commercial prices in **USD** as the default platform currency; confirm supported settlement currencies, taxes and payment-provider availability before charging customers.
- Use one member identity where appropriate, but gate trading access with a separate trading entitlement, stronger authentication and isolated broker/MT5 credentials. A Red Planet login must never itself grant access to a broker account or funds.
- Red Planet will publish its own original music and accept paid independent-artist submissions/services.
- AI products will use external model providers through a replaceable provider layer; additional providers must be addable without redesigning the product.
- Pricing should combine a free entry tier, paid creator/artist services, optional AI usage and clearly scoped business plans.
- No feature is to be described as live until it is connected and tested.

## 2. Recommended technical foundation

### Public website
Keep the existing HTML/CSS/JavaScript site on GitHub Pages while the public experience is stabilised. GitHub Pages is the static front end, not the application backend.

### Application backend
Use **Supabase** for the first production backend:
- Supabase Auth for registration, login, email verification and account recovery.
- PostgreSQL for profiles, roles, submissions, releases, plans, entitlements and audit records.
- Supabase Storage for private artist uploads, artwork and approved media.
- Row Level Security (RLS) for tenant/user-level access.
- Edge Functions or a separate trusted server for payment webhooks, provider API calls, moderation actions and privileged workflows.

Start with a development project and test data. Move to a paid production project only after the schema, backup, access and spend controls are reviewed. Keep separate development and production environments.

### Media delivery
Do not treat a database bucket alone as a complete streaming platform. Store original masters privately; process approved audio into delivery formats; publish approved renditions through a CDN/media delivery layer. Add upload limits, malware checks where applicable, metadata validation, moderation and takedown handling.

### AI provider layer
Create server-side adapters for each provider. Store provider names, model identifiers, enabled status and usage limits in the database, but store API secrets only in server-side secrets management. Never expose provider keys in browser JavaScript or commit them to Git.

Every AI feature must have a defined purpose, data-access boundary, user-facing disclosure, rate limit, usage log and fallback when a provider is unavailable:
- Music AI: original composition/production workflows, project saving and rights/source declarations.
- AI Teacher: tutoring and explanations with clear limitations.
- Planet Guide: answers grounded in approved Red Planet knowledge and sources.
- Remomi: role and product scope to be confirmed before enabling actions.
- AI Researcher: source-backed research with citations.
- AI Job Finder: user-approved CV/application assistance; no unattended submissions.
- AI Operations: draft and recommend actions; require approval for external, financial or irreversible actions.

### Payments
Use PayPal Checkout/Orders for one-off services first. Add recurring subscriptions only after the PayPal Business account, supported currencies, merchant eligibility and subscription API route are confirmed. A server endpoint must create orders/plans and verify PayPal webhooks before changing an account's paid entitlement. Never trust a browser redirect or client-side success message as proof of payment.

The currently displayed PayPal destination email is not sufficient to activate an API integration. The account owner must create/authorize a PayPal Business REST app and add its credentials to server-side secrets. Do not send credentials in chat.

### Email and integrations
Use a verified Red Planet-owned sending domain and transactional email provider for verification, receipts and account notices. Social channels (YouTube, Instagram, Facebook, X, Reddit and future platforms) must be connected individually through official OAuth/API permissions where available. Keep tokens server-side and allow revocation. Do not promise unrestricted automated posting or messaging.

## 3. Delivery phases and acceptance gates

### Phase 0 — Stabilise the public website
- Confirm the canonical domain and DNS control; preserve existing email-related DNS records.
- Resolve GitHub Pages deployment and HTTPS before promoting the site as production.
- Audit all pages, links, mobile layouts, forms, accessibility, metadata and console errors.
- Make every preview state explicit and remove any misleading success messages.
- Acceptance: latest commit is deployed, all navigation works, HTTPS is enforced, no critical broken links or console errors.

### Phase 1 — Identity and member foundation
- Create development and production backend environments.
- Implement member registration, email verification, login, logout, password reset and session management. Do not use a shared upload password; every uploader must have an individual authenticated account.
- Add role-gated administrator review tools. New artist uploads remain private and pending until an authorized reviewer approves them.
- Trading access uses the same identity provider only if the security review approves it, but has a distinct trading entitlement, MFA requirement for privileged actions, customer-isolated MT5 credentials and risk controls.
- Implement profiles, verified email, role assignments and account recovery.
- Roles: member, artist, producer, label, collaborator, editor, moderator, finance operator and administrator.
- Use least-privilege permissions; require MFA for privileged roles.
- Acceptance: user A cannot read or change user B's private profile, files, submissions or payment data.

### Phase 2 — Music marketplace and release operations
- Separate Red Planet-owned catalogue from third-party artist submissions.
- Build a Spotify-style listening experience (not a copy of Spotify): searchable catalogue, artist/release pages, album and playlist views, persistent web audio player, play queue, play/pause/seek/volume, favourites and responsive mobile playback.
- Serve only Red Planet-owned or properly licensed/approved recordings. Keep uploaded masters private; publish processed streaming renditions through a CDN/media delivery layer after rights and administrator approval.
- Artist onboarding, identity/contact details, rights declaration, collaborators, writers, producers, sample disclosures and AI-use disclosure.
- Paid services must state exactly what the fee buys (for example, review, hosting or a defined promotional deliverable); never sell guaranteed streams, playlist placement, signing or commercial success.
- Submission states: draft, submitted, needs changes, rights review, approved, scheduled, published, rejected, withdrawn and takedown requested.
- Keep original masters private; release only approved files.
- Store written licence/artist agreement acceptance and version history.
- Do not promise royalties or revenue shares until a written contract, accounting rules and payout process exist.
- Acceptance: test upload, rights review, admin decision, payment verification, publication and takedown all work in a staging environment.

### Phase 3 — AI services
- Build a shared AI gateway with provider adapters, quotas, per-feature permissions and usage accounting.
- Add separate interfaces and knowledge bases for Music AI, AI Teacher, Planet Guide, Remomi and Researcher.
- Red Planet knowledge answers must be grounded in approved, maintained content; unknown answers must be acknowledged.
- Human approval for external messages, publishing, payments, account changes and any consequential operation.
- Acceptance: provider keys are never exposed to clients; requests are rate-limited and logged; permission tests pass.

### Phase 4 — TV, newsroom and community
- Editorial CMS with draft, fact-check, legal/rights review, scheduled and published states.
- Separate Red Planet announcements from independent reporting, commentary and sponsored content.
- Store source links, author, editor, corrections and publication timestamps.
- Connect video/live services only after the channel owner authorizes each integration.
- Acceptance: no unreviewed AI-generated story can publish automatically; corrections and takedowns are traceable.

### Phase 5 — Commercial plans and finance
- Start with free membership and transparent paid services; introduce recurring subscriptions only when entitlements, cancellations, refunds and support are implemented.
- Record orders, payment provider IDs, currency, amount, status, refunds and webhook verification results.
- Reconcile payments against provider records; separate gross receipts, fees, refunds, taxes and artist payables.
- Restrict finance actions and maintain immutable audit history.
- Acceptance: sandbox checkout, duplicate webhook handling, failed payment, refund and cancellation tests pass.

### Phase 6 — Collaborations and platform integrations
- Partner CRM with lead source, relationship owner, status, meeting notes and next action.
- Written approval before sending outreach or signing commitments.
- Connect email and social accounts via owner-authorized access; allow disconnect and token revocation.
- Add new platforms through a documented connector interface.
- Acceptance: each integration has least-privilege scopes, logs and a tested disconnect process.

### Phase 7 — Trading (separate gated project)
- Keep trading separate from public music/member services.
- Add a Trading sign-in/entry point backed by authenticated Red Planet accounts and a separately granted trading entitlement; do not create broker credentials from a public web form or expose them to browser code.
- Isolate each customer worker, MT5 terminal, credentials, account state and risk settings.
- Demo-only testing first; no live trading until broker, legal/regulatory, risk, security and operational reviews are complete.
- AI must never alter live trading risk settings or execute unapproved financial actions.

## 4. Draft pricing model for validation — not yet live

Use **USD as the default displayed price currency**, as requested. Proposed pilot prices below are starting hypotheses only, not market-validated final prices. Before checkout goes live, confirm PayPal account country/currency support, conversion and settlement, taxes, refunds and provider fees.

| Offer | Draft price | Includes |
|---|---:|---|
| Community Member | Free | Account, public catalogue, community updates |
| Creator | USD 5/month | Creator profile, limited project tools and submission tracking |
| Artist Plus | USD 15/month | Expanded artist workspace, release planning and defined support allowance |
| Label / Studio | From USD 49/month | Multi-member workspace and catalogue administration; scope by agreement |
| Music submission review | USD 10 one-off pilot | One defined review and written feedback; no guarantee of acceptance or promotion |
| AI usage | Included small allowance, then disclosed top-ups | Metered by provider/model cost and usage limits |

Before charging, test willingness to pay with a small pilot group, calculate payment/provider costs, storage/egress, AI inference, support, taxes and refunds. Clearly disclose renewal date, cancellation, what is included and what is excluded. Do not charge for an undefined service.

## 5. Music rights and compliance

- Collect accurate ownership/authority declarations and all contributor credits.
- Obtain documented permissions for samples, interpolations, artwork, performances and voice/likeness use.
- Disclose AI-generated or AI-assisted material where relevant.
- Provide a rights complaint and takedown process.
- Obtain legal advice on distribution, licensing, consumer protection, privacy, tax and music-rights obligations in every country served.
- In Kenya, review the Kenya Copyright Board's National Rights Registry and applicable collective-management arrangements before making royalty or rights-management claims.

## 6. Credentials and launch prerequisites

The following require owner action or secure account authorization; do not request passwords in chat:
- Supabase organisation/project and billing owner.
- PayPal Business account and REST application credentials.
- Transactional email sender/domain verification.
- AI provider accounts, API keys and spending limits.
- Social/video account owner OAuth authorization.
- DNS provider/dashboard access for redplanet.com.

Secrets must be stored in backend environment secrets, never in repository files, browser code, issue comments or chat.

## 7. Current known status from repository review

- Existing public pages include Home, Music, AI Studio, TV, Collaborations, Trading and Plans/Billing.
- README describes the current site as a static HTML/CSS/JavaScript foundation.
- Music upload currently previews a selected file locally; persistent upload, streaming, licensing and royalty accounting are not yet connected.
- AI pages describe intended products; provider execution and knowledge-base connections remain pending.
- Trading is explicitly a preview, not a live MT5 service.
- Payments page says checkout and subscription entitlements are not connected.
- Therefore, the next implementation step is the backend foundation in a development environment, not enabling public payments or collecting artist masters yet.

## 8. Definition of done

Red Planet is ready for commercial launch only when:
1. The public domain deploys reliably over HTTPS.
2. Authentication, roles and RLS tests pass.
3. Artist uploads, rights review, moderation and takedown work.
4. Payment webhooks are verified and refunds/cancellations are tested.
5. AI provider secrets, permissions, quotas and audit logs are secure.
6. Editorial review and corrections work.
7. Privacy, terms, artist agreements and refund policies are published and legally reviewed.
8. Monitoring, backups, incident response and support ownership are in place.

**This document is an implementation plan. It does not mean any external account, backend, payment provider, AI provider or DNS setting has been connected.**


## 9. People, hiring and performance management — newly approved direction

Management has identified the need to restructure hiring for AI and performance-related roles as Red Planet invests in additional software. Management will lead the interview process.

### Operating framework to implement
- Define the business need, approved budget, role scope, responsibilities, reporting line and required skills before advertising.
- Use consistent candidate screening, structured interviews and role-relevant practical assessments.
- Record interview criteria and decisions fairly and consistently.
- Give every approved role a written onboarding plan, least-privilege system access and named manager.
- Set role-specific KPIs before work begins. Example dimensions: delivery against milestones, quality and reliability, security/compliance, collaboration and measurable business impact.
- Review performance on an agreed cadence; KPIs must be relevant to the role and must not encourage unsafe shortcuts or quantity over quality.
- Track software investments with an owner, purpose, cost, expected benefit, adoption plan and review date.
- Keep candidate, employee and performance information private and accessible only to authorized HR/management roles. Publish policies and obtain appropriate consent/notice before processing personal data.

### Proposed administration features
- Role and vacancy management.
- Candidate pipeline and interview scheduling/scorecards.
- Hiring approval and onboarding checklist.
- Staff directory and role-based access.
- KPI definitions, review periods and evidence notes.
- Software inventory, subscriptions, spend owner and renewal/review dates.
- Audit history for administrative decisions.

**Current implementation status:** The public people page is an explanatory framework only. Candidate management, staff records, private interview notes, KPI dashboards and software spend tracking are not yet connected to an authenticated backend. Do not enter private employee or candidate information into the public page.
