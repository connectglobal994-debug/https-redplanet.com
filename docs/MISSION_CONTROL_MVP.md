# RED PLANET / Mission Control — MVP

## Implemented in this branch
- `mission-control.html`: mobile-friendly cyber-brutalist interface matching the RED PLANET design direction.
- Secure sign-in via existing Supabase Auth client, using only the publishable browser key.
- Read-only real KPI metrics, mission totals, personal/authorized team tasks, daily updates.
- Status changes on authorized tasks, enforced by existing Supabase row-level security.
- Links to existing team portal, music, partnership and payment pages.
- Clear placeholder for agents and WhatsApp automation that are **not yet connected**.

## Important setup / testing
1. Review existing `docs/TEAM_OS_SETUP.md` and initialize a **development** Supabase instance.
2. Verify that existing migrations through `202611200008_team_task_assignment.sql` are applied. **A Git commit does not apply a database migration**.
3. Preview `mission-control.html` in the development site and log in with a non-admin test account.
4. Verify a user sees only their permitted missions and can update only authorized tasks. Test administrator separately.
5. Validate the three counters and KPI progress against actual database records. Empty metrics should stay empty.
6. Keep main/production unchanged until code review and tests pass.

## WhatsApp integration: realistic scope
Use the official WhatsApp Business Platform / Cloud API only where the business account and destination support it. The existing personal WhatsApp group should **not** be assumed API-addressable.

### Safe initial implementation
- On a permitted `rp_tasks` event (assignment, status, deadline): enqueue a structured notification in a server-side outbox.
- Use n8n or a Supabase Edge Function to format event-specific messages, with deduplication and retry limits.
- Deliver to **opted-in individual WhatsApp Business contacts**, using approved templates outside applicable customer-service windows. No group-posting workaround.
- Keep the dashboard as the source of truth and publish only non-sensitive status updates over messaging.
- Never store WhatsApp API tokens, third-party secrets or private payroll data in this public repository.
- Do not automatically send outreach, publish music, move funds or send payment details without an authorized approval step.

### Acceptance tests
- Mission assignment produces exactly one valid outbox event.
- Duplicate event delivery does not create duplicate WhatsApp messages.
- Revoked consent blocks further sends.
- Failed sends are visible to operations without leaking secrets.
- Unauthorized users cannot see other teams' tasks, payment details or private notes.
- If WhatsApp API credentials or destination permissions are unavailable, show **not configured**, not success.

## Next implementation milestones
1. Server-side task event outbox and n8n workflow integration.
2. Confirm opted-in WhatsApp Business notification channel.
3. Authorized publisher queue, campaign approvals and official social APIs.
4. AI knowledge retrieval from **approved** PDF-derived material, excluding private or unverified claims.
5. Optional opt-in WIN music feedback and analysis; no silent listener profiling.
6. Crypto payment **sandbox** via a compliant third-party provider before any live checkout.

This is a functional **front-end prototype using the existing backend contract**; it is **not** an assertion that Supabase migrations, third-party integrations, WhatsApp bot, live AI agents or payment processors are deployed.
