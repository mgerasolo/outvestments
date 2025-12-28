# Decisions Log

## Decision #1: Alpha Display Format
**Conv:** conv-20251227-223019
**Date:** 2025-12-27
**Status:** Accepted
**Decision:** Use "x" multiplier format for Alpha row (6x instead of 600%)
**Rationale:** Cleaner display, consistent with Difficulty format, 1x = market is intuitive baseline
**Alternatives:** Percentage (600%), basis points
**Impact:** All UI scorecard displays

## Decision #2: Difficulty Calculation
**Conv:** conv-20251227-223019
**Date:** 2025-12-27
**Status:** Accepted
**Decision:** Difficulty = Annualized Target Return / 10% (S&P baseline)
**Rationale:** S&P does ~10%/year long-term, so 20% annual target = 2.0x difficulty
**Alternatives:** Range-based buckets (original PRD approach)
**Impact:** Scoring calculations, UI display

## Decision #3: Alpha TARGET Formula
**Conv:** conv-20251227-223019
**Date:** 2025-12-27
**Status:** Proposed (Pending Roundtable)
**Decision:** Alpha TARGET = (Prediction - Market Return) / Market Return
**Rationale:** Measures how much bolder prediction was than actual market performance
**Example:** 20% prediction, 3% market = 17/3 = 5.6x
**Alternatives:** Your Return / Market Return (but this duplicates Alpha AIM)
**Impact:** Scoring calculations
**Notes:** Need roundtable validation that this metric tells a useful story
