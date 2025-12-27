# outvestments

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
| Reserved Port | 3154 |
| Status | Development |

**When ready to deploy:**
1. Create stack in Portainer
2. Configure Traefik routing
3. Add to inventory.md
4. Register in CoreControl

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
