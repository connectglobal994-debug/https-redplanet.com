# RED PLANET — MASTER VISION & IMPLEMENTATION HANDOFF

**Project:** Red Planet unified digital ecosystem  
**Founders / creative leadership named in the current project materials:** Deblaq & Win  
**Purpose of this document:** Give the next engineering system the full product direction and the current source-code facts. Treat this as the authoritative handoff brief for the next implementation pass.

## 1. Product vision

Build one coherent Red Planet ecosystem, not separate disconnected microsites. It should feel cinematic, premium, modern, human-designed, fast, accessible, and mobile-first. Use purposeful motion rather than excessive animation. Keep a consistent design system, navigation, identity, account layer, permissions model, and shared data foundation across all departments.

The experience should communicate a serious creative, technology, media, business, and investment platform. Do not use fabricated metrics, pretend live integrations, or simulated success states as if they were real.

## 2. Main ecosystem areas

1. **Command Center / Homepage** — unified overview, navigation, featured media, projects, announcements, and clear routes into each department.
2. **Music** — streaming catalog, artists, releases, albums, tracks, playlists, search, lyrics where licensed, player, rights/credits, distribution workflow, artist analytics, and upload moderation.
3. **Music Studio Offices** — each approved studio has its own branded office/dashboard, studio profile, team and roles, artists/roster, projects, release pipeline, file delivery, collaboration, booking/contact workflow, analytics, and permissions. Studios must only access their own private workspace and authorized shared resources. Win and Deblaq should each have dedicated leadership/office workspaces with role-appropriate access; do not assume they are ordinary public artist profiles.
4. **Artist Profiles** — public profile plus private artist dashboard, verified identity/status, biography, catalog, releases, collaborators, stats, ownership/credits, and submission/review workflows.
5. **TV / Broadcasting** — live and on-demand video, channels, schedules, program pages, publishing tools, and moderation.
6. **AI Core** — server-side provider integration, grounded Red Planet knowledge, configurable agents, training/knowledge management, chat history, safety, observability, and an AI teacher/training experience.
7. **AI Jobs & Automation** — job listings, applications, workflow automations, task status, human approval gates, audit trails, and notifications.
8. **News & Channels** — real source-backed news feeds, categories, editorial review, publishing, attribution, and syndication. Never invent article content or report simulated feeds as live.
9. **Markets / Trading** — read-only market data first, then isolated demo trading accounts with manual and automatic modes, risk limits, audit logs, and explicit user authorization. Live trading is a separately gated commercial capability requiring verified broker/MT5 integration, secure credentials, account isolation, monitoring, kill switch, and legal/risk review. Never expose live execution controls while disconnected.
10. **Business / Shop / Collaboration** — business services, products, partner intake, collaboration requests, and contact routes.
11. **Investor Portal** — clear investment information, secure submissions, private follow-up workflow, and accurate delivery confirmation.
12. **Membership** — registration, verification, member profile, consent, communications preferences, and member-only content.
13. **Central Administration** — one `/admin` control center with department-specific permissions, content review, user/studio/artist management, analytics, audit history, and platform configuration.

The overall strategy includes AI training/teacher, AI jobs, automation, music, marketing, collaboration, crypto/markets/trading, news/channels, platform reliability/self-healing, and clear contact/collaboration pathways. Preserve named project identities and role definitions from approved profile materials; do not invent biographies, credentials, or permissions.

## 3. Technical direction

Target architecture previously agreed for the unified platform:
- Next.js App Router, React, TypeScript, Tailwind CSS.
- PostgreSQL as the authoritative relational database.
- Secure server-side sessions and role-based access control.
- Vercel Blob (or equivalent object storage) for audio, video, artwork, and documents.
- Server-side AI provider calls; never expose API keys in browser bundles.
- Python/Node workers for scheduled automation and integrations.
- One shared account system, navigation, data model, and admin framework.
- Modular services and API boundaries for Music, Studios, Artists, TV, News, AI, Jobs, Markets, Business, Investors, and Admin.

Recommended role model to implement: platform owner, platform administrator, department manager, studio owner, studio manager, artist, editor/publisher, investor/partner, and member. Enforce access on the server for every read/write; hiding UI controls is not authorization.

## 4. Required delivery sequence

### Phase A — Stabilize and secure the existing application
- Fix authentication and authorization at API boundaries.
- Remove all credentials from source/public assets.
- Correct configuration and environment documentation.
- Fix missing route references and establish typed API contracts.
- Add lint, typecheck, unit/integration tests, and CI.
- Remove false live/connected/verified claims from simulated components.

### Phase B — Data and identity foundation
- Design PostgreSQL schema and migrations.
- Implement registration, login, verification, password reset, secure sessions, RBAC, audit log, and tenant isolation.
- Create studio, artist, member, staff, and admin profiles.
- Implement private office/workspace authorization and ownership boundaries.

### Phase C — Music and studio operations
- Connect music catalog and media storage to the database.
- Implement studio office dashboards and artist roster management.
- Implement releases, upload/review, metadata, rights/credits, distribution status, analytics, and collaboration.
- Preserve existing player and catalog UI where sound; replace local-only persistence with production services.

### Phase D — Media, AI, news, jobs
- Build TV publishing and channel management.
- Implement source-backed news ingestion and editorial review.
- Build AI knowledge management and provider routing with logging, rate limits, and cost controls.
- Implement AI teacher/training and AI job/application workflows.
- Add marketing and syndication workflows with approvals.

### Phase E — Markets and trading
- Start with read-only data and clearly timestamped sources.
- Build isolated demo trading accounts and manual/automatic modes.
- Add risk controls, permissions, execution logs, and emergency stop.
- Only then consider live broker/MT5 execution after independent security and compliance review.

### Phase F — Launch readiness
- Responsive/accessibility/performance QA.
- Security review, dependency audit, secrets scan, backup/restore test.
- Preview deployment and acceptance testing.
- Production monitoring, alerting, incident procedures, rollback plan.

## 5. Current code facts — do not assume these are already implemented

The supplied ZIP currently contains these working areas at source level:
- Homepage, About, Music, TV, AI chat UI, Trading UI, Investor UI, Members UI, and an Admin Upload UI.
- Shared navigation, footer, 3D hero, music player, player context, seed track catalog, and a file/Blob storage abstraction.
- API routes for auth, chat, investor intake, tracks, and uploads.
- Two Python scripts for market aggregation and news fetching.
- Four standalone HTML prototype/reference files and local audio/cover assets.

The following are not present as complete production features in this ZIP:
- PostgreSQL schema, migrations, database client, or persistence layer for users/studios/jobs/news.
- Complete account/session/RBAC system or central `/admin` department console.
- Dedicated studio office dashboards or studio tenant isolation.
- Complete artist profile and artist self-service management.
- `/api/members` and `/api/news` despite UI calls to those endpoints.
- Real live market data route or a verified MT5/Flask execution bridge.
- Real job marketplace, AI teacher/training management, marketing workflow, or self-healing operations system.
- Automated tests and CI pipeline.

## 6. Non-negotiable engineering rules

- Never hardcode passwords, tokens, private URLs, or API keys.
- Never store private credentials under `public/` or use `NEXT_PUBLIC_` for secrets.
- Never claim a broker, AI, news, streaming, or distribution integration is live unless a real authenticated service confirms it.
- Validate all inputs server-side; enforce authorization server-side.
- Isolate each studio's records and assets by tenant and role.
- Keep investor, member, artist, and studio data private.
- Use audit trails for administrative actions, financial actions, publishing, and file changes.
- Use real source timestamps and citations/attribution for news and market data.
- Preserve the visual direction, but prioritize reliability, clarity, performance, and usability over decorative animation.

## 7. Required output from the next system

1. Inspect every file before changing it.
2. Produce an implementation map showing which existing files are retained, refactored, replaced, or newly added.
3. Implement in small, testable phases; do not overwrite working features blindly.
4. Deliver a migration/schema plan, API contracts, permission matrix, and studio/artist user journeys.
5. Run lint, typecheck, tests, and production build; report exact results.
6. Produce a deployment checklist and a list of remaining blockers.
7. Return a new normalized ZIP and a concise change log. Do not call it production-ready until every launch gate passes.
