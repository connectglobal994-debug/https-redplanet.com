# Red Planet implementation plan — requested expansion

This scope is to be implemented inside this existing repository. Database foundations are not the same as live provider integrations.

## Accounts and central administration
- Supabase Auth: member sign-up, email verification, login, recovery and sessions.
- Server-verified roles only; never trust role values sent by a browser.
- Provision the initial platform owner once through a controlled server-side bootstrap using a private deployment secret and verified owner email. No default password is committed to Git.
- Central /admin manages users, role grants, studios, artists, releases, TV channels/programs, jobs, news, payments, moderation, social approvals and audit history.
- Department managers receive scoped permissions; ordinary members never share a generic administrator password.

## Music, artists and studios
- Listener: browse/search, artist and release pages, playback, queue, saves, playlists and history.
- Artist office: profile, releases, uploads, rights declarations, contributors/splits, moderation status and analytics.
- Studio office: studio profile, staff roles, artist roster, projects, file delivery, collaboration, bookings and release pipeline.
- Editorial review: metadata, rights and sample checks, moderation, scheduling, publishing and takedowns.
- Media needs durable object storage, file validation, malware scanning, moderation and signed playback URLs.
- Royalties must use verified plays, actual distributable revenue, rights and agreed splits; never fabricate balances.

## Red Planet TV
- Preserve Red Planet Universe/Mars as a flagship channel.
- Expand into music videos, sports, talent, interviews, documentaries, original shows, events and live broadcasts.
- Internal TV control room: channels, schedules, episodes, posters, video upload, review, preview and publishing.
- Production needs upload, transcoding, HLS/DASH, CDN, playback authorization and captions. Sample MP4s or database records are not live broadcasting.
- Check footage rights, releases/consent, age ratings and music licenses before publication.

## Payments
- Planned provider adapters: M-Pesa Daraja, PayPal Checkout and card processor/acquirer.
- Server-side intents; verify signed callbacks, amounts, currency, merchant identity and idempotency before marking paid or activating membership.
- Never store card numbers, CVV, PINs or provider secrets.
- Business credentials, callbacks and merchant details must be entered through provider dashboards and deployment secrets.

## Trading — separate phase
- Do not merge MT5 execution into this web deployment now.
- Keep Trading labelled non-live/read-only until the separate Python MT5 service is delivered and audited.
- Later: private authenticated API, isolated accounts, demo-first validation, risk limits, approvals, audit trail, monitoring and emergency stop.

## AI jobs and training marketplace
- Employer profiles, job posts, remote/onsite, skill tags, compensation, deadlines, eligibility, employer verification and report controls.
- Worker profiles with skills, languages, timezone, portfolio, CV, availability, assessments and application history.
- Workflow: apply, review, shortlist, assessment, interview, offer, accept/reject and notifications.
- Task marketplace: qualification gates, instructions, quality review, dispute/appeal, work history and payout statements.
- Admin moderation: verify employers, detect scams, approve listings and handle disputes.
- Use common marketplace patterns as inspiration; do not copy proprietary UI, text or branding from Handshake, Outlier, Upwork or others.

## News and social automation
- News desk: sourced submissions, attribution, editorial review, categories, scheduled publishing and corrections.
- Social accounts connect through official OAuth, encrypted token storage, scoped permissions and revocation.
- Automation can draft content and calendars; require human approval before posting or messaging. Respect platform policies.

## Inputs required from the owner (never send secrets in chat or commit them)
1. Supabase project URL and service-role key entered in Vercel environment variables.
2. Admin owner's email address for one-time provisioning.
3. Vercel Blob token or approved media storage.
4. M-Pesa Daraja business credentials and callback domain.
5. PayPal business app credentials.
6. Card processor/acquirer and settlement country.
7. Video hosting/transcoding provider.
8. Social developer apps and OAuth redirect URLs.
9. Later, MT5 demo integration details through a secure process, not Git.

## Boundary of this commit
Migration 003 adds tables and baseline row-level security for studios, media, TV, AI jobs, social publishing and payment intents. It does not activate external providers. API routes, admin screens, OAuth, payment webhooks, video transcoding and background workers remain to be implemented and tested.
