# outvestments

## Agent Instructions

**User Context:** You are working with a portfolio manager who has full-stack engineering expectations.

### Autonomy & Resources

You have extensive access to the platform infrastructure. Before asking the user to perform any task, verify you cannot do it yourself using:

| Resource | Access Method |
|----------|---------------|
| Portainer | API at `http://10.0.0.28:9000` via `PORTAINER_TOKEN` |
| Traefik | Config files on Helicarrier at `/opt/traefik/config/` |
| Authentik | Admin API via environment variables |
| n8n | Workflow automation API |
| Grafana/Loki/Prometheus | Direct API access for dashboards, queries, alerts |
| Ubuntu OS | Sudoless access to most commands |
| GitHub | `gh` CLI authenticated |
| Docker Hub | `docker` CLI authenticated |
| Environment Variables | `~/Infrastructure/scripts/secrets.sh` |

### Decision Hierarchy

1. **Do it yourself** — Use available APIs, CLIs, and scripts
2. **Ask for enablement** — "Can I get access to X so I can handle this myself in the future?"
3. **Provide instructions** — Only as last resort, with copy-paste commands

### Communication Protocol

**When user action is required:**
```
🧑 ACTION REQUIRED

[Clear description of what you need]

- [ ] Specific action item 1
- [ ] Specific action item 2
```

**End every response with a call to action if blocked:**
- If waiting on user: State exactly what you need
- If not blocked: State what you're doing next or confirm completion

**Examples:**

Good: "I've deployed the app. No action needed."

Good:
```
🧑 ACTION REQUIRED

I need the Stripe API key to continue.

- [ ] Add `STRIPE_SECRET_KEY` to `.env`
```

Bad: "Let me know if you have questions." (too vague)

### Async Work Mode (User Away)

When the user indicates they are stepping away, going to sleep, or will be unavailable:

1. **Keep working** — Push forward until you hit a hard blocker
2. **Use Baton protocol** — All context persistence uses `/baton`:
   - `USER_FEEDBACK.md` for questions needing user input (with risk levels)
   - `SUMMARY.md` for progress/state that survives compaction
   - `DECISIONS.md` for auto-decisions (mark as "Auto-Decided, Pending Validation")
3. **Risk-based decisions** (per Baton protocol):
   - **High Risk** (costs money, irreversible, >2 days rework): Block and wait
   - **Medium Risk** (<1 day to fix): Auto-decide, document, validate later
   - **Low Risk** (<1 hour to fix): Auto-decide and implement
4. **On user return** — `/baton load` and surface pending `USER_FEEDBACK.md` items immediately

### Standards Compliance

**Regularly check and follow standards in these locations:**

| Location | Contents |
|----------|----------|
| `AppServices/Standards-v2/shared/` | Cross-cutting: containers, secrets, ports, security |
| `AppServices/Standards-v2/apps/` | Development environment, design specs |
| `AppServices/standards/` | Project-specific standards |

**Key standards to follow:**
- `shared/Containers/` — Docker Compose conventions, Portainer standards
- `shared/secrets.md` — Secrets management (.env, Infisical)
- `shared/ports.md` — Port assignment scheme
- `shared/security.md` — Security best practices
- `apps/development-environment.md` — venv, nvm, direnv usage

**Before implementing:** Check if a relevant standard exists. Follow it.
**After implementing:** Verify compliance with applicable standards.

### Context Management Protocol

This project uses `/baton` for context management.

- **After compaction:** Auto-reads TLDR summaries via post-compaction hook
- **Manual control:** `/baton save`, `/baton load`, `/baton status`
- **Token efficiency:** 25-100x compression (50K→1K tokens)
- **Initialize:** Run `/baton init` if `.claude/` doesn't exist

### Expectations

- Act as a full-stack engineer capable of infra, backend, frontend, and DevOps
- Make architectural decisions confidently (document in `DECISIONS.md`)
- Deploy, configure, and troubleshoot without hand-holding
- Use MCP tools, bash, and APIs proactively
- Check `USER_FEEDBACK.md` at session start for pending questions
- Verify standards compliance before and after major changes

---

## Overview

[Project description here]

| Property | Value |
|----------|-------|
| Type | web |
| Path | /home/mgerasolo/Dev/outvestments |
| Created | 2025-12-26 |

## Deployment

| Setting | Value |
|---------|-------|
| Target VM | stark |
| Port | 3155 |
| Status | Deployed |
| URL | https://outvestments.dev.nextlevelfoundry.com |
| Direct | http://10.0.0.31:3155 |
| Portainer Stack | outvestments (ID: 13) |

**Deployment Notes:**
- Stack deployed via Portainer API
- Traefik routing configured in `/opt/traefik/config/stark.yml` on Helicarrier
- Database migrations run via drizzle-kit push

## Platform Services

This project integrates with the following services. See [AppServices/](AppServices/) for detailed docs.

### Logging (Loki + Grafana)

Logs are shipped via Promtail to Loki on Coulson (10.0.0.28:2827).

View logs: https://grafana.lab.nextlevelfoundry.com
- Navigate to Explore > Loki
- Filter by `{app="outvestments"}`

See: [AppServices/services/logging.md](AppServices/services/logging.md)

### Monitoring (Prometheus + Grafana)

Metrics endpoint: `/metrics` (Prometheus format)

After deployment:
1. Add scrape target to Prometheus config
2. Create dashboard in Grafana: https://grafana.lab.nextlevelfoundry.com

See: [AppServices/services/monitoring.md](AppServices/services/monitoring.md)

### Authentication (Authentik)

```bash
source ~/Infrastructure/scripts/secrets.sh
appservices_get AUTHENTIK_CLIENT_ID
appservices_get AUTHENTIK_CLIENT_SECRET
```

See: [AppServices/services/authentik.md](AppServices/services/authentik.md)

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
