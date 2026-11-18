# RED PLANET
### A connected ecosystem for music, intelligence, technology and collaboration

Red Planet is being developed as one branded digital platform with a shared identity and connected service areas. The website is the front door; secure backend services will power member accounts, media, AI workflows, collaboration tools and (in a later phase) cloud-hosted trading.

## Vision
Build a professional, creator-led ecosystem where people can discover music, learn with AI, find opportunities, collaborate with artists and organizations, manage projects and access specialist tools through one Red Planet account.

## Platform areas
- **Home** — public introduction to Red Planet and its mission.
- **Music** — artist and release discovery, playlists, and an upload/preview experience. The current upload control previews a selected audio file locally in the browser; persistent uploads, streaming delivery, licensing and royalty accounting require backend services and rights workflows.
- **AI Studio** — product direction for the AI Teacher, AI Job Finder, research assistant and operations assistant.
- **AI Anchors** — Win is the main artist/culture host; Deblaq is the core builder/systems host. These are AI presenter concepts inspired by supplied visual references, not claims that the pictured people have endorsed or personally voiced AI content.
- **Collaborations** — structured pathway for artist, label, organization, brand and technology partnerships.
- **Trading** — preview of the future MT5 customer area. Live trading is not enabled by this static site.
- **Community & recruitment** — member onboarding, opportunities and team operations, to be connected to authenticated services.

## Product principles
1. One Red Planet identity; access is controlled by role and subscription entitlement.
2. Keep customer data and credentials on the server, never in browser code or public repositories.
3. Human approval for consequential actions: job applications, external outreach, publishing, financial activity and account changes.
4. Respect copyright, artist credits, licensing, privacy and platform terms.
5. Build in phases, test each integration, and clearly label preview features until connected.

## Current website implementation
- Static HTML, CSS and JavaScript hosted through GitHub Pages.
- `index.html` — main landing page.
- `music.html` — cinematic music hub and local audio preview.
- `ai.html` — AI product direction and presenter profiles.
- `collaborations.html` — partnership hub and collaboration process.
- `trading.html` — trading interface preview only.
- `style.css` / `script.js` — shared homepage styling and interactions.

## Not yet active
The static website does not currently provide production authentication, subscription billing, persistent music uploads, public streaming, AI model execution, automated job applications, partner CRM, member messaging, or MT5 connectivity. These require backend APIs, database/storage, provider integrations, security controls and operational monitoring.

## Suggested delivery sequence
1. Complete and test the public website experience.
2. Add secure identity, member profiles and subscription entitlements.
3. Add music storage, metadata, rights review, streaming delivery and artist administration.
4. Connect AI services with source-grounded knowledge, user consent, approval flows and audit logs.
5. Add collaboration CRM, verified partner research and approved outreach workflows.
6. Build isolated MT5 cloud workers, demo-test them, then assess regulatory and broker requirements before live trading.

## Repository safety
Never commit `.env` files, API keys, passwords, broker credentials, private customer records, database dumps, runtime logs, private audio masters or unlicensed media. Use secret management and environment-specific configuration for deployments.

## Ownership and roles
Red Planet is the project and platform identity. Win is designated the main artist anchor. Deblaq is designated the core builder anchor. The product owner retains final approval over public releases, partnerships, financial operations and production changes.

---
**Status:** Website foundation in active development. Pages indicate where a feature is a preview and where production integrations are still required.
