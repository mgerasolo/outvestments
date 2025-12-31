#!/bin/bash
# Setup script for Outvestments local development DNS
# Run with: sudo ./scripts/setup-dns.sh

set -e

echo "=== Outvestments DNS Setup ==="

# Add internal DNS entries for development
HOSTS_ENTRY_AUTH="10.0.0.27 auth.nextlevelfoundry.com"

# Check if entries already exist
if grep -q "auth.nextlevelfoundry.com" /etc/hosts; then
    echo "Authentik hosts entry already exists"
else
    echo "$HOSTS_ENTRY_AUTH" >> /etc/hosts
    echo "Added: $HOSTS_ENTRY_AUTH"
fi

# Optionally set AdGuard as primary DNS
read -p "Set AdGuard (10.0.0.27) as primary DNS? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    resolvectl dns enp6s18 10.0.0.27 10.0.0.60 9.9.9.9
    echo "DNS servers reordered - AdGuard is now primary"
fi

echo ""
echo "=== Verifying DNS Resolution ==="
echo "Authentik: $(dig +short auth.nextlevelfoundry.com | head -1)"
echo "Expected: 10.0.0.27"

echo ""
echo "=== Setup Complete ==="
echo "You can now run: npm run dev"
