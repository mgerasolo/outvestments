import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateRequiredPace,
  calculateCurrentPace,
  getPaceStatus,
  calculatePaceInfo,
  getPaceStatusDisplay,
  formatPace,
  calculateTrajectory,
} from "./pace-tracking";
import type { Aim } from "./db/schema";

// Mock aim factory
function createMockAim(overrides: Partial<Aim> = {}): Aim {
  return {
    id: "test-aim-id",
    targetId: "test-target-id",
    symbol: "AAPL",
    targetPriceRealistic: "200.00",
    targetPriceReach: null,
    targetDate: new Date("2025-12-31"),
    status: "active",
    rolledFromId: null,
    closedAt: null,
    closedReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe("calculateRequiredPace", () => {
  it("calculates required pace for positive return target", () => {
    // $100 to $120 in 60 days (2 months)
    const result = calculateRequiredPace(100, 120, 60);

    // 20% return over 2 months ≈ 9.5% monthly
    expect(result.monthlyReturn).toBeCloseTo(9.54, 1);
    expect(result.annualizedReturn).toBeGreaterThan(100); // Over 100% annualized
  });

  it("handles short time periods", () => {
    // $100 to $110 in 30 days (1 month)
    const result = calculateRequiredPace(100, 110, 30);

    // 10% return in 1 month = 10% monthly
    expect(result.monthlyReturn).toBeCloseTo(10, 1);
  });

  it("handles zero days remaining", () => {
    const result = calculateRequiredPace(100, 120, 0);
    expect(result.monthlyReturn).toBe(0);
    expect(result.annualizedReturn).toBe(0);
  });

  it("handles negative days (expired)", () => {
    const result = calculateRequiredPace(100, 120, -10);
    expect(result.monthlyReturn).toBe(0);
    expect(result.annualizedReturn).toBe(0);
  });

  it("handles zero current price", () => {
    const result = calculateRequiredPace(0, 120, 60);
    expect(result.monthlyReturn).toBe(0);
    expect(result.annualizedReturn).toBe(0);
  });
});

describe("calculateCurrentPace", () => {
  it("calculates pace for positive return", () => {
    // Went from $100 to $110 in 30 days
    const result = calculateCurrentPace(100, 110, 30);

    expect(result.currentReturn).toBeCloseTo(10, 1); // 10% return
    expect(result.monthlyPace).toBeCloseTo(10, 1); // 10% monthly
  });

  it("calculates pace for negative return", () => {
    // Went from $100 to $90 in 30 days
    const result = calculateCurrentPace(100, 90, 30);

    expect(result.currentReturn).toBeCloseTo(-10, 1); // -10% return
    expect(result.monthlyPace).toBeCloseTo(-10, 1); // -10% monthly
  });

  it("extrapolates pace for short periods", () => {
    // Went from $100 to $101 in 3 days (1% in 3 days)
    const result = calculateCurrentPace(100, 101, 3);

    expect(result.currentReturn).toBeCloseTo(1, 1); // 1% return
    expect(result.monthlyPace).toBeCloseTo(10, 1); // Extrapolated to ~10%/month
  });

  it("handles zero days", () => {
    const result = calculateCurrentPace(100, 110, 0);
    expect(result.currentReturn).toBe(0);
    expect(result.monthlyPace).toBe(0);
  });
});

describe("getPaceStatus", () => {
  it("returns 'ahead' when pace ratio > 1.1", () => {
    expect(getPaceStatus(12, 10)).toBe("ahead"); // 120% of required
  });

  it("returns 'behind' when pace ratio < 0.9", () => {
    expect(getPaceStatus(8, 10)).toBe("behind"); // 80% of required
  });

  it("returns 'on_pace' when ratio between 0.9 and 1.1", () => {
    expect(getPaceStatus(10, 10)).toBe("on_pace"); // Exactly on pace
    expect(getPaceStatus(9.5, 10)).toBe("on_pace"); // 95% of required
    expect(getPaceStatus(10.5, 10)).toBe("on_pace"); // 105% of required
  });

  it("returns 'unknown' when required pace is zero", () => {
    expect(getPaceStatus(10, 0)).toBe("unknown");
  });
});

describe("calculatePaceInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates basic pace info with current price", () => {
    const aim = createMockAim({
      targetPriceRealistic: "200.00",
      targetDate: new Date("2025-12-15"), // 6 months away
    });

    const info = calculatePaceInfo(aim, 150); // Current price $150

    // Days calculation can vary by 1 depending on time of day
    expect(info.daysRemaining).toBeGreaterThanOrEqual(182);
    expect(info.daysRemaining).toBeLessThanOrEqual(183);
    expect(info.monthsRemaining).toBeCloseTo(6.0, 0);
    expect(info.requiredMonthlyReturn).toBeGreaterThan(0);
    expect(info.currentPrice).toBe(150);
  });

  it("calculates complete pace info with entry data", () => {
    const aim = createMockAim({
      targetPriceRealistic: "200.00",
      targetDate: new Date("2025-12-15"),
    });

    const entryDate = new Date("2025-05-15"); // 1 month ago
    const info = calculatePaceInfo(aim, 155, 150, entryDate); // Up from $150 to $155

    expect(info.currentReturn).toBeCloseTo(3.33, 1); // 3.33% return
    expect(info.currentMonthlyPace).toBeGreaterThan(0);
    expect(info.paceStatus).toBeDefined();
    expect(info.percentToTarget).toBeGreaterThan(0);
  });

  it("handles expired aims", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-05-15"), // 1 month ago
    });

    const info = calculatePaceInfo(aim, 150);

    expect(info.daysRemaining).toBe(0);
    expect(info.monthsRemaining).toBe(0);
  });
});

describe("getPaceStatusDisplay", () => {
  it("returns correct display for ahead", () => {
    const display = getPaceStatusDisplay("ahead");
    expect(display.label).toBe("Ahead of Pace");
    expect(display.color).toBe("green");
    expect(display.icon).toBe("↑");
  });

  it("returns correct display for on_pace", () => {
    const display = getPaceStatusDisplay("on_pace");
    expect(display.label).toBe("On Pace");
    expect(display.color).toBe("blue");
  });

  it("returns correct display for behind", () => {
    const display = getPaceStatusDisplay("behind");
    expect(display.label).toBe("Behind Pace");
    expect(display.color).toBe("red");
    expect(display.icon).toBe("↓");
  });

  it("returns correct display for unknown", () => {
    const display = getPaceStatusDisplay("unknown");
    expect(display.label).toBe("Unknown");
    expect(display.color).toBe("gray");
  });
});

describe("formatPace", () => {
  it("formats positive pace with plus sign", () => {
    expect(formatPace(5.5)).toBe("+5.50%/mo");
  });

  it("formats negative pace without plus sign", () => {
    expect(formatPace(-3.25)).toBe("-3.25%/mo");
  });

  it("formats zero pace with plus sign", () => {
    expect(formatPace(0)).toBe("+0.00%/mo");
  });
});

describe("calculateTrajectory", () => {
  it("projects future price based on current pace", () => {
    // Started at $100, now $110 after 30 days, 60 days remaining
    const result = calculateTrajectory(100, 110, 30, 60);

    // Current rate: 10% in 30 days
    // Projected: continue for 60 more days (90 total)
    expect(result.projectedPrice).toBeGreaterThan(110);
    expect(result.projectedReturn).toBeGreaterThan(10);
  });

  it("handles flat performance", () => {
    // No change in 30 days
    const result = calculateTrajectory(100, 100, 30, 60);

    expect(result.projectedPrice).toBeCloseTo(100, 1);
    expect(result.projectedReturn).toBeCloseTo(0, 1);
  });

  it("handles declining performance", () => {
    // Dropped 10% in 30 days
    const result = calculateTrajectory(100, 90, 30, 60);

    expect(result.projectedPrice).toBeLessThan(90);
    expect(result.projectedReturn).toBeLessThan(0);
  });

  it("handles zero days since entry", () => {
    const result = calculateTrajectory(100, 100, 0, 60);

    expect(result.projectedPrice).toBe(100);
    expect(result.projectedReturn).toBe(0);
  });
});
