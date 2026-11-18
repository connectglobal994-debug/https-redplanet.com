# Red Planet — Platform Roadmap

## Product decision
Red Planet is a modular digital ecosystem: a public-facing website connected over time to private member tools and specialist services. The public website is the entry point; AI, media, collaboration, automation and trading are separate modules, not one fragile all-in-one application.

## Current foundation
- Public pages: `index.html` (main landing page) and `home.html` (system-access concept).
- Presentation: `style.css` (shared responsive dark/crimson design system).
- Browser interactions: `script.js` (navigation, scrolling, reveal effects, counters and front-end form validation).
- `recovered-style-css-script.js` preserves the JavaScript that was mistakenly stored in the old stylesheet before repair.

## Product modules
1. **Public website** — mission, systems, departments, roles, projects, community and application entry point.
2. **Member workspace** — authenticated profiles, onboarding, assigned tasks, project boards, announcements and file collaboration.
3. **AI teacher and assistant** — configurable knowledge sources, managed training/knowledge updates, learning experiences and a TV-friendly interface. Use approved model APIs and explicit content/data permissions; do not claim the model is trained merely because documents are uploaded.
4. **Automation and identity operations** — approved workflow automation, email/account setup assistance and administrative controls. Gmail account creation must follow Google's supported flows, terms, verification and anti-abuse rules; no mass account creation or bypassing verification.
5. **Music and media** — licensed streaming/catalog integrations, artist pages, playlists, discovery and collaboration. Playback and distribution require appropriate rights and provider agreements.
6. **Collaboration** — team messaging, project spaces, shared files, task assignment and notifications.
7. **Trading and market tools** — educational content, market data, watchlists, portfolio views and risk disclosures first. Live trading, custody or financial advice require specialist compliance, secure integrations and explicit user authorization.

## Delivery sequence
- **Phase 1 — Foundation:** correct file responsibilities, responsive styles, accessible navigation, page consistency and form feedback.
- **Phase 2 — Real applications:** connect the application form to a secure backend/database, add admin review and onboarding.
- **Phase 3 — Member workspace:** authentication, roles, projects, tasks and announcements.
- **Phase 4 — AI and learning:** AI assistant/teacher, knowledge management and TV-compatible interface.
- **Phase 5 — Media and collaboration:** music integrations, licensed playback, messaging and team collaboration.
- **Phase 6 — Trading and advanced automation:** market-data tools and approved workflows after security and compliance review.

## Integration rule
Never present a mockup, local browser interaction or disconnected form as a production service. Every external feature must have a real provider, credentials stored server-side, permissions, error handling, privacy controls and a tested user journey.

## Current known limitation
The application form currently validates entries in the browser and explains that delivery is not connected. A secure server endpoint and database are required before applications can be collected centrally. GitHub Pages can host the static front end but does not provide a private application database or server-side secrets.
