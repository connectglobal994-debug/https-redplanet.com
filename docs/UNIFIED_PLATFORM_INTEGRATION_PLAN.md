# Red Planet — Unified Platform Integration Plan

## Product direction
Upgrade the existing Red Planet website and ecosystem in place. Preserve the original site's identity, content, assets, existing Supabase schema and working workflows. Reconcile original features with the Next.js migration; do not replace the original site with a disconnected product.

## Portal map
- Public website and Growth Studio: marketing, service discovery, contact, client onboarding and transparent service information.
- Client Growth Portal: per-client workspaces, official social-account OAuth, content calendars, post approval, publishing jobs, inbox, lead CRM, analytics and billing.
- Communications: WhatsApp Business Platform, Instagram/Facebook messaging where eligible, web chat, email and Telegram bot. AI drafts responses; confidence/risk rules and human handoff protect customer conversations.
- Marketing automation: scheduled content, reminders, campaign reporting, opt-in follow-ups, retry queues, provider rate limits, audit logs and pause/rollback controls.
- AI Academy / AI Teacher: administrator-curated training materials, ingestion and review, lessons, quizzes, progress and feedback. Training data and instructions must be versioned; the model is not silently trained on private customer messages.
- Research Portal: research requests, source collection, citations, saved projects, review and export. Separate sourced facts from AI inference.
- Jobs Portal: employer and candidate accounts, verified listings, applications, moderation, status updates and anti-fraud checks.
- Music and private media: artist/studio workspaces, private masters and collaboration assets, signed access, release approvals, playback delivery and rights metadata.
- Collaboration CRM: partners, outreach history, agreements, tasks, deliverables and follow-ups.
- Red Planet TV / editorial: story intake, source attribution, editorial review, schedules and media delivery.
- Trading: keep disconnected/read-only until the owner supplies and approves a separately audited MT5 bridge.

## Social platform connection model
Support planned connections for WhatsApp, Instagram, Facebook, TikTok, YouTube, LinkedIn, X and Telegram. Each integration must use the platform's official OAuth/API or approved business messaging product. Store tokens encrypted server-side, request minimum scopes, support revocation, isolate each client's tenant, and record who connected or published. Do not scrape accounts, collect passwords, evade platform enforcement, buy followers, impersonate people or generate fake engagement.

## Automated customer support
1. Capture a visitor's message and channel, consent and tenant.
2. Retrieve only approved public/service knowledge for that tenant.
3. Draft a response with source/intent and confidence metadata.
4. Auto-send only low-risk, approved FAQ responses after opt-in and channel policy checks.
5. Hand pricing disputes, refunds, account access, legal/safety matters, uncertain answers and complaints to a human.
6. Log delivery status, retries, opt-outs and agent actions; provide pause and kill-switch controls.

## Email and business identity
Do not create consumer Gmail accounts or mailboxes by bypassing providers. Build an admin flow for a verified domain and email provider (for example, Google Workspace or another supported provider) to provision authorized mailboxes/aliases through the provider's admin API. Until configured, use the existing contact inbox and verified transactional sender. Never expose SMTP/API credentials in the browser.

## Delivery sequence
1. Reconcile original site pages, assets, routes, Supabase migrations and edge functions with the migration branch.
2. Complete identity, tenant isolation, roles, private storage and audit logging.
3. Activate public contact, WhatsApp deep link, lead intake and client Growth Studio portal.
4. Implement and test provider OAuth one platform at a time, beginning with Meta/WhatsApp Business and then YouTube/Google; add TikTok, LinkedIn, X and Telegram subject to approval.
5. Connect content calendar, approval, scheduled publishing, inbox and analytics jobs.
6. Restore Team OS and AI Teacher, then AI Academy, research and jobs portals with persistent data and role checks.
7. Restore music, TV, collaboration and payments; verify private master storage and signed access.
8. Keep trading disconnected until its separate bridge is audited.
9. Run migration tests, tenant/RLS tests, API tests, end-to-end tests, accessibility checks and production-like provider sandbox tests before release.

## Pricing source review
The proposed USD pilot prices already documented in docs/RED_PLANET_IMPLEMENTATION_ROADMAP.md are carried forward to the Growth Studio page: Community Free; Creator $5/month; Artist Plus $15/month; Label/Studio from $49/month; music submission review $10 one-off; AI usage metered. These remain proposed pilot prices, not active checkout prices. The uploaded RED.pdf is a documentary/reconstructed operations dossier, not a verified service rate card; its deceptive coordinated-account tactics and associated budgets are excluded from customer pricing and marketing workflows.

## Current implementation status
The /growth public service page is a marketing/contact surface, not a claim that social OAuth, publishing, automated inbox, CRM persistence or analytics are live. WhatsApp deep-link uses the existing site's published contact number by default and can be overridden with NEXT_PUBLIC_WHATSAPP_NUMBER. Provider credentials, database workflows and verified deployment are still required.
