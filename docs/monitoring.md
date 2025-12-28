# Monitoring & Observability

This document describes the monitoring and observability setup for Outvestments.

## Overview

Outvestments integrates with the NLF platform's observability stack:

| Component | Purpose | URL/Endpoint |
|-----------|---------|--------------|
| **Grafana** | Dashboards & Visualization | https://grafana.lab.nextlevelfoundry.com |
| **Loki** | Log Aggregation | http://10.0.0.28:2827 |
| **Prometheus** | Metrics Collection | TBD (add scrape target) |

## Health Endpoint

**Endpoint:** `/api/health`

Returns comprehensive health status including:

- **Database connectivity** with latency measurement
- **Alpaca API status** via circuit breaker state
- **Memory usage** with heap statistics
- **Uptime** in seconds

### Response Format

```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "checks": {
    "database": {
      "status": "up",
      "latencyMs": 5
    },
    "alpaca": {
      "status": "up",
      "details": {
        "circuits": [...]
      }
    },
    "memory": {
      "status": "up",
      "details": {
        "heapUsedMB": 150,
        "heapTotalMB": 256,
        "heapPercent": 58,
        "rssMB": 300
      }
    }
  }
}
```

### Health Status Codes

| Status | HTTP Code | Meaning |
|--------|-----------|---------|
| `healthy` | 200 | All systems operational |
| `degraded` | 200 | Some non-critical issues |
| `unhealthy` | 503 | Critical service(s) down |

## Metrics Endpoint

**Endpoint:** `/api/metrics`

Returns Prometheus-format metrics for scraping.

### Available Metrics

#### HTTP Metrics
- `outvestments_http_requests_total{method, path, status}` - Total HTTP requests
- `outvestments_http_request_duration_ms{method, path}` - Request latency histogram
- `outvestments_http_errors_total{method, path, status}` - HTTP error count

#### Database Metrics
- `outvestments_db_queries_total` - Total database queries
- `outvestments_db_query_duration_ms` - Query latency histogram
- `outvestments_db_errors_total` - Database error count

#### Alpaca API Metrics
- `outvestments_alpaca_requests_total{operation, success}` - API call count
- `outvestments_alpaca_request_duration_ms{operation}` - API latency histogram
- `outvestments_alpaca_errors_total{operation}` - API error count
- `outvestments_alpaca_circuit_state{circuit}` - Circuit breaker state (0=closed, 1=half-open, 2=open)

#### Business Metrics
- `outvestments_active_users` - Total registered users
- `outvestments_targets_total` - Total targets
- `outvestments_aims_total` - Total aims
- `outvestments_shots_total` - Total shots
- `outvestments_positions_total` - Active positions

#### System Metrics
- `outvestments_memory_heap_used_bytes` - Heap memory used
- `outvestments_memory_heap_total_bytes` - Total heap size
- `outvestments_memory_rss_bytes` - Resident set size
- `outvestments_uptime_seconds` - Process uptime

#### Job Metrics
- `outvestments_jobs_processed_total{job}` - Successful job count
- `outvestments_jobs_failed_total{job}` - Failed job count
- `outvestments_jobs_duration_ms{job}` - Job duration histogram

### Prometheus Configuration

Add to Prometheus scrape config:

```yaml
scrape_configs:
  - job_name: 'outvestments'
    static_configs:
      - targets: ['10.0.0.31:3155']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

## Structured Logging

All logs are output in JSON format for Loki ingestion.

### Log Format

```json
{
  "timestamp": "2024-01-15T12:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "app": "outvestments",
  "environment": "production",
  "version": "0.1.0",
  "userId": "abc123",
  "action": "login"
}
```

### Log Levels

| Level | Usage |
|-------|-------|
| `debug` | Detailed debugging (disabled in production) |
| `info` | Normal operations, user actions |
| `warn` | Warning conditions, degraded service |
| `error` | Errors requiring attention |

### Using the Logger

```typescript
import { logger } from '@/lib/logger';

// Simple logging
logger.info('User logged in', { userId: 'abc123' });
logger.error('Database connection failed', { error: err.message });

// With timing
await logger.withTiming('fetchPortfolio', async () => {
  return await getAlpacaPortfolio();
}, { userId });

// Child logger with preset context
const requestLogger = logger.child({ requestId, userId });
requestLogger.info('Processing request');
```

### Loki Queries

View logs in Grafana > Explore > Loki:

```logql
# All outvestments logs
{app="outvestments"}

# Error logs only
{app="outvestments"} |= "error"

# Specific user actions
{app="outvestments"} | json | userId="abc123"

# Worker logs
{app="outvestments", service="worker"}

# Parse JSON and filter
{app="outvestments"} | json | level="error"
```

## Error Tracking

### React Error Boundaries

The app includes error boundaries at multiple levels:

1. **Global Error Page** (`src/app/global-error.tsx`) - Root layout errors
2. **Route Error Page** (`src/app/error.tsx`) - Route segment errors
3. **Component Error Boundary** (`src/components/error-boundary.tsx`) - Component-level

All errors are logged in structured JSON format for Loki.

### Using Error Boundaries

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

function MyPage() {
  return (
    <ErrorBoundary>
      <RiskyComponent />
    </ErrorBoundary>
  );
}
```

## Docker Logging Configuration

The docker-compose.yml includes logging configuration:

```yaml
labels:
  - "logging=promtail"
  - "logging_jobname=outvestments"
  - "app=outvestments"
  - "service=app"
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
    labels: "app,service,logging_jobname"
```

Promtail on the host should pick up logs from containers with `logging=promtail` label.

## Alerting (Recommended)

### Suggested Alerts

```yaml
# Prometheus alerting rules
groups:
  - name: outvestments
    rules:
      - alert: OutvestmentsDown
        expr: up{job="outvestments"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Outvestments is down"

      - alert: OutvestmentsHighErrorRate
        expr: rate(outvestments_http_errors_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"

      - alert: AlpacaCircuitOpen
        expr: outvestments_alpaca_circuit_state > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Alpaca API circuit breaker is open"

      - alert: HighMemoryUsage
        expr: outvestments_memory_heap_used_bytes / outvestments_memory_heap_total_bytes > 0.9
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage detected"
```

## Grafana Dashboard

A recommended dashboard layout:

1. **Service Health Panel**
   - Health status (green/yellow/red)
   - Uptime counter
   - Current version

2. **Request Metrics**
   - Request rate (req/sec)
   - Error rate (%)
   - Latency percentiles (p50, p95, p99)

3. **Alpaca API**
   - API call rate
   - Circuit breaker status
   - Error rate by operation

4. **Business Metrics**
   - Active users
   - Targets/Aims/Shots counts
   - Open positions

5. **System Resources**
   - Memory usage over time
   - Container resource usage

## Troubleshooting

### No Metrics Appearing

1. Check `/api/metrics` returns data:
   ```bash
   curl http://10.0.0.31:3155/api/metrics
   ```

2. Verify Prometheus scrape target is configured

3. Check Prometheus targets page for errors

### Logs Not in Loki

1. Verify container labels:
   ```bash
   docker inspect outvestments | grep -A 10 Labels
   ```

2. Check Promtail is running and configured:
   ```bash
   docker logs promtail
   ```

3. Verify log format is JSON:
   ```bash
   docker logs outvestments | head -5
   ```

### High Memory Alerts

1. Check for memory leaks in `/api/health`:
   ```bash
   curl http://10.0.0.31:3155/api/health | jq .checks.memory
   ```

2. Monitor heap growth over time in Grafana

3. Consider reducing `--max-old-space-size` if appropriate
