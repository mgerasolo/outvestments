import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  cn,
  formatCurrency,
  formatPercentage,
  formatPPD,
  formatDate,
  formatRelativeDate,
  daysBetween,
} from "./utils";

describe("cn (className merger)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "skip", "included")).toBe("base included");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatCurrency", () => {
  it("formats cents to dollars", () => {
    expect(formatCurrency(10000)).toBe("$100.00");
    expect(formatCurrency(150)).toBe("$1.50");
    expect(formatCurrency(99)).toBe("$0.99");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("handles large amounts", () => {
    expect(formatCurrency(100000000)).toBe("$1,000,000.00");
  });

  it("handles negative amounts", () => {
    expect(formatCurrency(-5000)).toBe("-$50.00");
  });
});

describe("formatPercentage", () => {
  it("formats positive percentages with plus sign", () => {
    expect(formatPercentage(15.5)).toBe("+15.50%");
    expect(formatPercentage(0.123)).toBe("+0.12%");
  });

  it("formats negative percentages", () => {
    expect(formatPercentage(-8.75)).toBe("-8.75%");
  });

  it("handles zero", () => {
    expect(formatPercentage(0)).toBe("+0.00%");
  });

  it("respects decimal places parameter", () => {
    expect(formatPercentage(15.5678, 4)).toBe("+15.5678%");
    expect(formatPercentage(15.5, 0)).toBe("+16%");
  });
});

describe("formatPPD", () => {
  it("formats positive PPD with plus sign", () => {
    expect(formatPPD(0.0523)).toBe("+0.0523%/day");
  });

  it("formats negative PPD", () => {
    expect(formatPPD(-0.0123)).toBe("-0.0123%/day");
  });

  it("handles zero", () => {
    expect(formatPPD(0)).toBe("+0.0000%/day");
  });
});

describe("formatDate", () => {
  it("formats Date object", () => {
    const date = new Date("2025-03-15T12:00:00Z");
    const result = formatDate(date);
    // Check it contains the expected parts (exact format may vary by locale)
    expect(result).toContain("Mar");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });

  it("formats date string", () => {
    // Use ISO format with time to avoid timezone ambiguity
    const result = formatDate("2024-12-25T12:00:00Z");
    expect(result).toContain("Dec");
    expect(result).toContain("25");
    expect(result).toContain("2024");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'today' for current date", () => {
    expect(formatRelativeDate(new Date("2025-06-15T10:00:00Z"))).toBe("today");
  });

  it("handles days in the past", () => {
    const result = formatRelativeDate(new Date("2025-06-12T12:00:00Z"));
    expect(result).toBe("3 days ago");
  });

  it("handles days in the future", () => {
    const result = formatRelativeDate(new Date("2025-06-18T12:00:00Z"));
    expect(result).toBe("in 3 days");
  });

  it("handles weeks", () => {
    const result = formatRelativeDate(new Date("2025-06-01T12:00:00Z"));
    expect(result).toBe("2 weeks ago");
  });

  it("handles months", () => {
    const result = formatRelativeDate(new Date("2025-04-15T12:00:00Z"));
    expect(result).toBe("2 months ago");
  });
});

describe("daysBetween", () => {
  it("calculates days between dates", () => {
    expect(
      daysBetween(new Date("2025-01-01"), new Date("2025-01-10"))
    ).toBe(9);
  });

  it("handles string dates", () => {
    expect(daysBetween("2025-01-01", "2025-01-15")).toBe(14);
  });

  it("returns 0 for same date", () => {
    expect(
      daysBetween(new Date("2025-03-15"), new Date("2025-03-15"))
    ).toBe(0);
  });

  it("returns negative for end before start", () => {
    expect(
      daysBetween(new Date("2025-01-10"), new Date("2025-01-01"))
    ).toBe(-9);
  });
});
