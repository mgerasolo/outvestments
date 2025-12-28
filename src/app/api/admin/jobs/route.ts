import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/auth/rbac";
import {
  getBoss,
  JOB_NAMES,
  JOB_SCHEDULES,
  enqueueScoreRefresh,
  enqueueEodSnapshot,
  enqueueCacheCleanup,
  enqueuePriceAlert,
  enqueuePhantomTrack,
} from "@/lib/jobs";

/**
 * GET /api/admin/jobs
 * List all registered jobs and their schedules
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  try {
    const jobs = Object.entries(JOB_NAMES).map(([key, name]) => ({
      key,
      name,
      schedule: JOB_SCHEDULES[key as keyof typeof JOB_SCHEDULES] || null,
      description: getJobDescription(name),
    }));

    return NextResponse.json({
      jobs,
      timezone: "America/New_York",
    });
  } catch (error) {
    console.error("[Admin Jobs] Failed to list jobs:", error);
    return NextResponse.json(
      { error: "Failed to list jobs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/jobs
 * Manually trigger a job
 *
 * Body:
 * - jobName: Name of the job to trigger
 * - data: Optional job-specific data
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.role || !isAdmin(session.user.role)) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { jobName, data = {} } = body;

    if (!jobName) {
      return NextResponse.json(
        { error: "jobName is required" },
        { status: 400 }
      );
    }

    // Validate job name
    const validJobNames = Object.values(JOB_NAMES);
    if (!validJobNames.includes(jobName)) {
      return NextResponse.json(
        { error: `Invalid job name. Valid options: ${validJobNames.join(", ")}` },
        { status: 400 }
      );
    }

    // Ensure pg-boss is available
    try {
      getBoss();
    } catch {
      return NextResponse.json(
        {
          error: "Job scheduler not initialized",
          note: "The worker process may not be running. Start it with: npm run worker"
        },
        { status: 503 }
      );
    }

    // Enqueue the job
    let jobId: string | null = null;
    const correlationId = `manual-${Date.now()}`;

    switch (jobName) {
      case JOB_NAMES.SCORE_REFRESH:
        jobId = await enqueueScoreRefresh({ ...data, correlationId });
        break;
      case JOB_NAMES.EOD_SNAPSHOT:
        jobId = await enqueueEodSnapshot({ ...data, correlationId });
        break;
      case JOB_NAMES.CACHE_CLEANUP:
        jobId = await enqueueCacheCleanup({ ...data, correlationId });
        break;
      case JOB_NAMES.PRICE_ALERT:
        jobId = await enqueuePriceAlert({ ...data, correlationId });
        break;
      case JOB_NAMES.PHANTOM_TRACK:
        jobId = await enqueuePhantomTrack({ ...data, correlationId });
        break;
    }

    console.log(`[Admin Jobs] Manually triggered job: ${jobName}`, {
      jobId,
      correlationId,
      triggeredBy: session.user.email,
    });

    return NextResponse.json({
      success: true,
      jobId,
      jobName,
      correlationId,
      message: `Job ${jobName} has been enqueued`,
    });
  } catch (error) {
    console.error("[Admin Jobs] Failed to trigger job:", error);
    return NextResponse.json(
      { error: "Failed to trigger job" },
      { status: 500 }
    );
  }
}

/**
 * Get human-readable description for a job
 */
function getJobDescription(jobName: string): string {
  const descriptions: Record<string, string> = {
    [JOB_NAMES.SCORE_REFRESH]: "Recalculates scores for open positions (hourly)",
    [JOB_NAMES.EOD_SNAPSHOT]: "Captures end-of-day portfolio state (4:30 PM ET weekdays)",
    [JOB_NAMES.CACHE_CLEANUP]: "Prunes expired price cache entries (2:00 AM ET daily)",
    [JOB_NAMES.PRICE_ALERT]: "Checks watchlist price alerts (every 5 min during market hours)",
    [JOB_NAMES.PHANTOM_TRACK]: "Updates phantom position prices (every 15 min during market hours)",
  };
  return descriptions[jobName] || "No description available";
}
