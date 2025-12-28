import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateDaysUntilExpiry,
  isAimExpiring,
  isAimExpired,
  getComputedAimStatus,
  enrichAimWithExpiryInfo,
  getAimStatusDisplay,
} from "./aim-lifecycle";
import type { Aim } from "./db/schema";

// Mock aim factory
function createMockAim(overrides: Partial<Aim> = {}): Aim {
  return {
    id: "test-aim-id",
    targetId: "test-target-id",
    symbol: "AAPL",
    targetPriceRealistic: "200.00",
    targetPriceReach: null,
    targetDate: new Date(),
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

describe("calculateDaysUntilExpiry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns positive days for future dates", () => {
    const future = new Date("2025-06-25T12:00:00Z");
    expect(calculateDaysUntilExpiry(future)).toBe(10);
  });

  it("returns negative days for past dates", () => {
    const past = new Date("2025-06-10T12:00:00Z");
    expect(calculateDaysUntilExpiry(past)).toBe(-5);
  });

  it("returns 0 for today", () => {
    const today = new Date("2025-06-15T23:59:00Z");
    expect(calculateDaysUntilExpiry(today)).toBe(0);
  });
});

describe("isAimExpiring", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for dates within 7 days", () => {
    expect(isAimExpiring(new Date("2025-06-20T12:00:00Z"))).toBe(true); // 5 days
    expect(isAimExpiring(new Date("2025-06-22T12:00:00Z"))).toBe(true); // 7 days
    expect(isAimExpiring(new Date("2025-06-15T12:00:00Z"))).toBe(true); // today
  });

  it("returns false for dates more than 7 days away", () => {
    expect(isAimExpiring(new Date("2025-06-30T12:00:00Z"))).toBe(false); // 15 days
  });

  it("returns false for past dates", () => {
    expect(isAimExpiring(new Date("2025-06-10T12:00:00Z"))).toBe(false); // -5 days
  });
});

describe("isAimExpired", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns true for past dates", () => {
    expect(isAimExpired(new Date("2025-06-10T12:00:00Z"))).toBe(true);
    expect(isAimExpired(new Date("2025-06-14T12:00:00Z"))).toBe(true);
  });

  it("returns false for today", () => {
    expect(isAimExpired(new Date("2025-06-15T12:00:00Z"))).toBe(false);
  });

  it("returns false for future dates", () => {
    expect(isAimExpired(new Date("2025-06-20T12:00:00Z"))).toBe(false);
  });
});

describe("getComputedAimStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'active' for aims with target date > 7 days away", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-30T12:00:00Z"),
      status: "active",
    });
    expect(getComputedAimStatus(aim)).toBe("active");
  });

  it("returns 'expiring' for aims within 7 days of target", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-20T12:00:00Z"),
      status: "active",
    });
    expect(getComputedAimStatus(aim)).toBe("expiring");
  });

  it("returns 'expired' for aims past target date", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-10T12:00:00Z"),
      status: "active",
    });
    expect(getComputedAimStatus(aim)).toBe("expired");
  });

  it("preserves terminal statuses", () => {
    const closedAim = createMockAim({
      targetDate: new Date("2025-06-10T12:00:00Z"), // past date
      status: "closed",
    });
    expect(getComputedAimStatus(closedAim)).toBe("closed");

    const hitAim = createMockAim({
      targetDate: new Date("2025-06-10T12:00:00Z"),
      status: "hit",
    });
    expect(getComputedAimStatus(hitAim)).toBe("hit");

    const rolledAim = createMockAim({
      targetDate: new Date("2025-06-10T12:00:00Z"),
      status: "rolled_over",
    });
    expect(getComputedAimStatus(rolledAim)).toBe("rolled_over");
  });
});

describe("enrichAimWithExpiryInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enriches aim with days until expiry", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-25T12:00:00Z"),
    });
    const enriched = enrichAimWithExpiryInfo(aim);

    expect(enriched.daysUntilExpiry).toBe(10);
    expect(enriched.isExpiring).toBe(false);
    expect(enriched.isExpired).toBe(false);
  });

  it("marks aims as expiring when within threshold", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-20T12:00:00Z"),
    });
    const enriched = enrichAimWithExpiryInfo(aim);

    expect(enriched.daysUntilExpiry).toBe(5);
    expect(enriched.isExpiring).toBe(true);
    expect(enriched.isExpired).toBe(false);
  });

  it("marks aims as expired when past target date", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-10T12:00:00Z"),
    });
    const enriched = enrichAimWithExpiryInfo(aim);

    expect(enriched.daysUntilExpiry).toBe(-5);
    expect(enriched.isExpiring).toBe(false);
    expect(enriched.isExpired).toBe(true);
  });

  it("includes hasActiveShots flag", () => {
    const aim = createMockAim();
    const withShots = enrichAimWithExpiryInfo(aim, true);
    const withoutShots = enrichAimWithExpiryInfo(aim, false);

    expect(withShots.hasActiveShots).toBe(true);
    expect(withoutShots.hasActiveShots).toBe(false);
  });
});

describe("getAimStatusDisplay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns active status with days remaining", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-30T12:00:00Z"),
      status: "active",
    });
    const display = getAimStatusDisplay(aim);

    expect(display.label).toBe("Active");
    expect(display.color).toBe("green");
    expect(display.description).toContain("15 days");
  });

  it("returns expiring status with urgency", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-18T12:00:00Z"),
      status: "active",
    });
    const display = getAimStatusDisplay(aim);

    expect(display.label).toBe("Expiring Soon");
    expect(display.color).toBe("yellow");
    expect(display.description).toContain("3 days left");
  });

  it("returns 'Expires today' for same-day expiry", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-15T18:00:00Z"),
      status: "active",
    });
    const display = getAimStatusDisplay(aim);

    expect(display.label).toBe("Expiring Soon");
    expect(display.description).toBe("Expires today");
  });

  it("returns expired status with days ago", () => {
    const aim = createMockAim({
      targetDate: new Date("2025-06-10T12:00:00Z"),
      status: "active",
    });
    const display = getAimStatusDisplay(aim);

    expect(display.label).toBe("Expired");
    expect(display.color).toBe("red");
    expect(display.description).toContain("5 days ago");
  });

  it("returns hit status for successful aims", () => {
    const aim = createMockAim({
      status: "hit",
    });
    const display = getAimStatusDisplay(aim);

    expect(display.label).toBe("Target Hit");
    expect(display.color).toBe("green");
  });

  it("returns rolled over status", () => {
    const aim = createMockAim({
      status: "rolled_over",
    });
    const display = getAimStatusDisplay(aim);

    expect(display.label).toBe("Rolled Over");
    expect(display.color).toBe("blue");
  });
});
