# Enhancement Ideas

## Enhancement #1: Party Mode for Scoring Validation
**Conv:** conv-20251227-223019
**Proposed:** 2025-12-27
**Priority:** High
**Status:** In Progress
**Rationale:** Multiple perspectives needed to validate 8-part scoring system
**Impact:** Core scoring system design
**Effort:** ~30 min roundtable discussion
**Dependencies:** Briefing document created
**Proposed By:** Matt + Sally (UX Designer)
**Notes:** Briefing saved to `_bmad-output/scoring_details/2025-12-27-ScoringMethodPossibilities.md`

## Enhancement #2: Phantom Position Tracking ("What If" Analysis)

**Conv:** conv-20251227-223019
**Proposed:** 2025-12-28
**Priority:** High
**Status:** Proposed
**Proposed By:** User (Matt)

### Problem

Traders often exit positions early (panic sell, take profits too soon) and never learn whether their original thesis was correct. This prevents growth and confidence building.

### Solution

Continue tracking price movement on closed positions until the original thesis expiry date passes.

### Features

1. **Phantom Tracking on Exit**
   - When user closes a Shot/Aim, keep monitoring the symbol
   - Track price at exit vs. price at thesis expiry
   - Calculate "What If I Held" P/L

2. **History Page Enhancement**
   - Add "What If" column showing phantom P/L
   - Compare actual exit P/L vs. holding to target
   - Color code: Green if early exit was smart, Red if you left money on table

3. **Learning Insights**
   - "You exited 5 positions early this month"
   - "3 of them would have hit your target (+$X left on table)"
   - "2 were good exits (avoided -$Y losses)"

4. **Thesis Validation**
   - After expiry date: "Your thesis was CORRECT/INCORRECT"
   - Track thesis accuracy rate over time

### Technical Approach

- Add `phantomTracking` boolean to closed Aims
- Add `phantomEndDate` (thesis expiry or target date)
- Add `phantomFinalPrice` (price at phantom end date)
- Cron job to check and update phantom positions daily
- Calculate `phantomPL` vs `actualPL` for comparison

### Impact

- High user value: teaches discipline and builds confidence
- Differentiator: most trading apps don't do this
- Data for future scoring/analytics

### Effort

~3-5 days implementation

### Dependencies

- Aims must have target prices and expiry dates (Epic 13 ✓)
- Quote fetching infrastructure (exists ✓)
