/**
 * Metrics Collection for Outvestments
 *
 * Provides in-memory metrics collection for Prometheus scraping.
 * This is a lightweight implementation suitable for a Next.js app.
 *
 * For production with multiple instances, consider using:
 * - prom-client with pushgateway
 * - Custom aggregation via Redis
 */

interface Counter {
  value: number;
  labels: Record<string, string>;
}

interface Gauge {
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

interface Histogram {
  count: number;
  sum: number;
  buckets: Map<number, number>;
  labels: Record<string, string>;
}

// In-memory metrics storage
const counters = new Map<string, Counter[]>();
const gauges = new Map<string, Gauge[]>();
const histograms = new Map<string, Histogram[]>();

// Histogram bucket boundaries (in ms for latency)
const DEFAULT_BUCKETS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

/**
 * Increment a counter metric
 */
export function incrementCounter(
  name: string,
  labels: Record<string, string> = {},
  value = 1
): void {
  const key = name;
  const existing = counters.get(key) ?? [];
  const labelKey = JSON.stringify(labels);

  const found = existing.find((c) => JSON.stringify(c.labels) === labelKey);
  if (found) {
    found.value += value;
  } else {
    existing.push({ value, labels });
    counters.set(key, existing);
  }
}

/**
 * Set a gauge metric value
 */
export function setGauge(
  name: string,
  value: number,
  labels: Record<string, string> = {}
): void {
  const key = name;
  const existing = gauges.get(key) ?? [];
  const labelKey = JSON.stringify(labels);

  const found = existing.find((g) => JSON.stringify(g.labels) === labelKey);
  if (found) {
    found.value = value;
    found.timestamp = Date.now();
  } else {
    existing.push({ value, labels, timestamp: Date.now() });
    gauges.set(key, existing);
  }
}

/**
 * Record a histogram observation
 */
export function observeHistogram(
  name: string,
  value: number,
  labels: Record<string, string> = {},
  buckets: number[] = DEFAULT_BUCKETS
): void {
  const key = name;
  const existing = histograms.get(key) ?? [];
  const labelKey = JSON.stringify(labels);

  let histogram = existing.find((h) => JSON.stringify(h.labels) === labelKey);
  if (!histogram) {
    histogram = {
      count: 0,
      sum: 0,
      buckets: new Map(buckets.map((b) => [b, 0])),
      labels,
    };
    existing.push(histogram);
    histograms.set(key, existing);
  }

  histogram.count++;
  histogram.sum += value;

  // Update buckets (cumulative)
  for (const bucket of buckets) {
    if (value <= bucket) {
      histogram.buckets.set(bucket, (histogram.buckets.get(bucket) ?? 0) + 1);
    }
  }
}

/**
 * Format labels for Prometheus output
 */
function formatLabels(labels: Record<string, string>): string {
  const entries = Object.entries(labels);
  if (entries.length === 0) return "";
  return `{${entries.map(([k, v]) => `${k}="${v}"`).join(",")}}`;
}

/**
 * Export all metrics in Prometheus text format
 */
export function exportMetrics(): string {
  const lines: string[] = [];

  // Export counters
  for (const [name, values] of counters) {
    lines.push(`# HELP ${name} Counter metric`);
    lines.push(`# TYPE ${name} counter`);
    for (const counter of values) {
      lines.push(`${name}${formatLabels(counter.labels)} ${counter.value}`);
    }
  }

  // Export gauges
  for (const [name, values] of gauges) {
    lines.push(`# HELP ${name} Gauge metric`);
    lines.push(`# TYPE ${name} gauge`);
    for (const gauge of values) {
      lines.push(`${name}${formatLabels(gauge.labels)} ${gauge.value}`);
    }
  }

  // Export histograms
  for (const [name, values] of histograms) {
    lines.push(`# HELP ${name} Histogram metric`);
    lines.push(`# TYPE ${name} histogram`);
    for (const histogram of values) {
      const labelStr = formatLabels(histogram.labels);
      const sortedBuckets = Array.from(histogram.buckets.entries()).sort(
        ([a], [b]) => a - b
      );

      let cumulative = 0;
      for (const [bucket, count] of sortedBuckets) {
        cumulative += count;
        const bucketLabels = {
          ...histogram.labels,
          le: bucket.toString(),
        };
        lines.push(`${name}_bucket${formatLabels(bucketLabels)} ${cumulative}`);
      }
      lines.push(
        `${name}_bucket${formatLabels({ ...histogram.labels, le: "+Inf" })} ${histogram.count}`
      );
      lines.push(`${name}_sum${labelStr} ${histogram.sum}`);
      lines.push(`${name}_count${labelStr} ${histogram.count}`);
    }
  }

  return lines.join("\n");
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearMetrics(): void {
  counters.clear();
  gauges.clear();
  histograms.clear();
}

// Pre-defined metric names for consistency
export const METRICS = {
  // HTTP metrics
  HTTP_REQUESTS_TOTAL: "outvestments_http_requests_total",
  HTTP_REQUEST_DURATION_MS: "outvestments_http_request_duration_ms",
  HTTP_ERRORS_TOTAL: "outvestments_http_errors_total",

  // Database metrics
  DB_QUERIES_TOTAL: "outvestments_db_queries_total",
  DB_QUERY_DURATION_MS: "outvestments_db_query_duration_ms",
  DB_ERRORS_TOTAL: "outvestments_db_errors_total",

  // Alpaca API metrics
  ALPACA_REQUESTS_TOTAL: "outvestments_alpaca_requests_total",
  ALPACA_REQUEST_DURATION_MS: "outvestments_alpaca_request_duration_ms",
  ALPACA_ERRORS_TOTAL: "outvestments_alpaca_errors_total",
  ALPACA_CIRCUIT_STATE: "outvestments_alpaca_circuit_state",

  // Business metrics
  ACTIVE_USERS: "outvestments_active_users",
  TARGETS_TOTAL: "outvestments_targets_total",
  AIMS_TOTAL: "outvestments_aims_total",
  SHOTS_TOTAL: "outvestments_shots_total",
  POSITIONS_TOTAL: "outvestments_positions_total",

  // System metrics
  MEMORY_HEAP_USED_BYTES: "outvestments_memory_heap_used_bytes",
  MEMORY_HEAP_TOTAL_BYTES: "outvestments_memory_heap_total_bytes",
  MEMORY_RSS_BYTES: "outvestments_memory_rss_bytes",
  UPTIME_SECONDS: "outvestments_uptime_seconds",

  // Job metrics
  JOBS_PROCESSED_TOTAL: "outvestments_jobs_processed_total",
  JOBS_FAILED_TOTAL: "outvestments_jobs_failed_total",
  JOBS_DURATION_MS: "outvestments_jobs_duration_ms",
} as const;

// Track process start for uptime
const processStartTime = Date.now();

/**
 * Update system metrics (call periodically or on scrape)
 */
export function updateSystemMetrics(): void {
  const memUsage = process.memoryUsage();

  setGauge(METRICS.MEMORY_HEAP_USED_BYTES, memUsage.heapUsed);
  setGauge(METRICS.MEMORY_HEAP_TOTAL_BYTES, memUsage.heapTotal);
  setGauge(METRICS.MEMORY_RSS_BYTES, memUsage.rss);
  setGauge(METRICS.UPTIME_SECONDS, Math.floor((Date.now() - processStartTime) / 1000));
}

/**
 * Helper to track request metrics
 */
export function trackRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number
): void {
  const labels = { method, path, status: statusCode.toString() };

  incrementCounter(METRICS.HTTP_REQUESTS_TOTAL, labels);
  observeHistogram(METRICS.HTTP_REQUEST_DURATION_MS, durationMs, { method, path });

  if (statusCode >= 400) {
    incrementCounter(METRICS.HTTP_ERRORS_TOTAL, labels);
  }
}

/**
 * Helper to track Alpaca API metrics
 */
export function trackAlpacaRequest(
  operation: string,
  success: boolean,
  durationMs: number
): void {
  const labels = { operation, success: success.toString() };

  incrementCounter(METRICS.ALPACA_REQUESTS_TOTAL, labels);
  observeHistogram(METRICS.ALPACA_REQUEST_DURATION_MS, durationMs, { operation });

  if (!success) {
    incrementCounter(METRICS.ALPACA_ERRORS_TOTAL, { operation });
  }
}

/**
 * Helper to track job metrics
 */
export function trackJob(
  jobName: string,
  success: boolean,
  durationMs: number
): void {
  const labels = { job: jobName };

  if (success) {
    incrementCounter(METRICS.JOBS_PROCESSED_TOTAL, labels);
  } else {
    incrementCounter(METRICS.JOBS_FAILED_TOTAL, labels);
  }
  observeHistogram(METRICS.JOBS_DURATION_MS, durationMs, labels);
}
