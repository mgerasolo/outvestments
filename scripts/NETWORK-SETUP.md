# Network Setup for Outvestments Development

## Quick Setup (Local Development)

Run the DNS setup script:
```bash
sudo ./scripts/setup-dns.sh
```

This adds the necessary hosts entries for local development.

---

## Manual Steps (If Script Fails)

### Step 1: Fix Local DNS Resolution

The development machine needs to resolve `auth.nextlevelfoundry.com` to the Authentik server.

**Option A: Add hosts entries (recommended for dev)**
```bash
sudo tee -a /etc/hosts << 'EOF'
10.0.0.27 auth.nextlevelfoundry.com
EOF
```

**Option B: Set AdGuard as primary DNS**
```bash
sudo resolvectl dns enp6s18 10.0.0.27 10.0.0.60 9.9.9.9
```

### Step 2: Traefik Routing (For Production/HTTPS Access)

Docker Compose labels handle Traefik routing automatically. The app is exposed at:
- `https://dev.outvestments.com` - Development/staging app
- `https://outvestments.com` - Production homepage

---

## Verification

```bash
# Test DNS resolution
dig auth.nextlevelfoundry.com +short
# Should return: 10.0.0.27

# Test Authentik connectivity
curl -s https://auth.nextlevelfoundry.com/application/o/outvestments/.well-known/openid-configuration | head -5

# Test dev server
curl http://10.0.0.31:3155
```

---

## Development URLs

| Service | URL |
|---------|-----|
| Dev Server (direct) | http://10.0.0.31:3155 |
| Dev App | https://dev.outvestments.com |
| Homepage | https://outvestments.com |
| Authentik OIDC | https://auth.nextlevelfoundry.com/application/o/outvestments/ |
| AdGuard Admin | http://10.0.0.27:2720 |
| Traefik Dashboard | http://10.0.0.27:2711 |
