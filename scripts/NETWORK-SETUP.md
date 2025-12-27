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

The development machine needs to resolve `authentik.lab.nextlevelfoundry.com` to `10.0.0.27` instead of Cloudflare.

**Option A: Add hosts entries (recommended for dev)**
```bash
sudo tee -a /etc/hosts << 'EOF'
10.0.0.27 authentik.lab.nextlevelfoundry.com
10.0.0.31 outvestments.lab.nextlevelfoundry.com
EOF
```

**Option B: Set AdGuard as primary DNS**
```bash
sudo resolvectl dns enp6s18 10.0.0.27 10.0.0.60 9.9.9.9
```

### Step 2: AdGuard DNS Rewrite (For Production/External Access)

1. Login to https://adguard.lab.nextlevelfoundry.com (or http://10.0.0.27:2720)
2. Get credentials:
   ```bash
   source /mnt/foundry_project/AppServices/env/infrastructure.env
   echo "Username: $ADGUARD_USERNAME"
   echo "Password: $ADGUARD_PASSWORD"
   ```
3. Navigate to **Filters** → **DNS rewrites**
4. Click **Add DNS rewrite**
5. Add entry:
   | Field  | Value                                  |
   |--------|----------------------------------------|
   | Domain | `outvestments.lab.nextlevelfoundry.com`|
   | Answer | `10.0.0.27`                            |
6. Click **Save**

### Step 3: Traefik Routing (For Production/HTTPS Access)

Since Outvestments is running outside Docker during development, use Traefik's File Provider.

1. SSH to Helicarrier (10.0.0.27):
   ```bash
   ssh -p 3322 mgerasolo@10.0.0.27
   ```

2. Create or edit dynamic config:
   ```bash
   nano /home/docker/traefik/dynamic/outvestments.yaml
   ```

3. Add configuration:
   ```yaml
   http:
     routers:
       outvestments:
         rule: "Host(`outvestments.lab.nextlevelfoundry.com`)"
         entrypoints:
           - websecure
         tls:
           certResolver: cloudflare
         service: outvestments

     services:
       outvestments:
         loadBalancer:
           servers:
             - url: "http://10.0.0.31:3154"
   ```

4. Verify in Traefik dashboard: http://10.0.0.27:2711

---

## Verification

```bash
# Test DNS resolution
dig authentik.lab.nextlevelfoundry.com +short
# Should return: 10.0.0.27

# Test Authentik connectivity
curl -s https://authentik.lab.nextlevelfoundry.com/application/o/outvestments/.well-known/openid-configuration | head -5

# Test dev server
curl http://10.0.0.31:3154
```

---

## Development URLs

| Service | URL |
|---------|-----|
| Dev Server | http://10.0.0.31:3154 |
| Authentik OIDC | https://authentik.lab.nextlevelfoundry.com/application/o/outvestments/ |
| AdGuard Admin | http://10.0.0.27:2720 |
| Traefik Dashboard | http://10.0.0.27:2711 |
