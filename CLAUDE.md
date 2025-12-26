# outvestments

## Overview

[Project description here]

| Property | Value |
|----------|-------|
| Type | web |
| Path | /tmp/tmp.Cdv6PAp0gf |
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

See [AppServices/](AppServices/) for available integrations:
- Logging: Loki + Grafana (Coulson)
- Monitoring: Prometheus + Grafana (Coulson)
- Auth: Authentik (Helicarrier)
- Secrets: Infisical (with .env fallback)

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

