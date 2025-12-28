# Outvestments Scoring System Redesign

## Briefing Document for Roundtable Discussion

**Date:** 2025-12-27
**Status:** In Progress - Needs Roundtable Review

---

## 1. Background: The Current System (from PRD)

The existing scoring system has three dimensions at the Shot level:

| Dimension | What It Measures | Scale |
|-----------|------------------|-------|
| **Accuracy** | Did you hit your target? | 0-100+ (% of target achieved) |
| **Performance** | How much did you make vs benchmarks? | 67 = market, 100 = 1.5x market |
| **Difficulty** | How bold was your prediction? | 0.5x - 2.5x multiplier |

**Current Difficulty Ranges:**
- Point Blank: <5% target = 0.5x
- Close Range: 5-15% = 1.0x
- Mid Range: 15-30% = 1.5x
- Long Range: 30-50% = 2.0x
- Extreme Range: >50% = 2.5x

**Current Composite Score:** Accuracy × Difficulty

**Three-Level Hierarchy:**
- **Target Score** = Was your thesis correct?
- **Aim Score** = Did the ticker hit target?
- **Shot Score** = How well-timed was your entry?

---

## 2. The Proposed New System: 8-Part Score

Matt is proposing a more comprehensive 8-part scoring system:

### Visual Layout (Scoreboard)

```
┌─────────────────────────────────────────────────────────────┐
│  DIFFICULTY              TARGET   AIM    SHOT      GRADE   │
│     1.5x                                           SCORE   │
│                                                            │
│     Raw                   90      18      72         A-    │
│     Alpha                5.6x     6x      5x               │
└─────────────────────────────────────────────────────────────┘
```

### The 8 Metrics

| # | Metric | Description |
|---|--------|-------------|
| 1 | **Difficulty** | How bold was your prediction vs S&P baseline? |
| 2 | **Raw TARGET** | Prediction accuracy (did reality match prediction?) |
| 3 | **Raw AIM** | Performance (what % did you actually gain?) |
| 4 | **Raw SHOT** | Optimal capture (how much of max possible did you get?) |
| 5 | **Alpha TARGET** | Prediction boldness vs actual market |
| 6 | **Alpha AIM** | Your performance vs market performance |
| 7 | **Alpha SHOT** | Your optimal vs market's optimal |
| 8 | **Letter Grade** | Final composite grade (F through AAA) |

---

## 3. Detailed Metric Definitions

### 3.1 Difficulty (Metric #1)

**Concept:** How bold was your prediction compared to S&P's long-term average of 10%/year?

**Formula:** `(Annualized Target Return) / 10%`

**Examples:**
- Predict 5% annual return → 0.5x difficulty
- Predict 20% annual return → 2.0x difficulty
- Predict 30% annual return → 3.0x difficulty

---

### 3.2 Raw TARGET - Prediction Accuracy (Metric #2)

**Concept:** Did reality match your prediction? Based on 100 basis points.

**Formula:** `(Actual Return / Predicted Return) × 100`

**Example:**
- Predicted: +20% gain in 2 months
- Actual: +18% gain
- Score: 18/20 × 100 = **90**

---

### 3.3 Raw AIM - Performance (Metric #3)

**Concept:** What gains did your actual position achieve?

**Current thinking:** Raw percentage as score (18% gain = score of 18)

**Open question:** Should this be annualized?
- 18% in 2 months = 108% annualized = score of 108?

**THE PROBLEM:** Annualization breaks for short-term trades.
- A 5% day trade annualizes to 1,825%
- A 35% swing trade over a week becomes astronomical
- This overly rewards quick flips vs sustained performance

**Needs resolution:** How to capture the "annualized concept" without absurd numbers for short holds.

---

### 3.4 Raw SHOT - Optimal Capture (Metric #4)

**Concept:** How much of the maximum possible gain did you capture?

**Method:**
1. Extend the actual holding window by 20% on each end
2. Find the lowest price (best possible entry) in that window
3. Find the highest price (best possible exit) in that window
4. Calculate maximum possible gain from best entry to best exit
5. Score = (Your Actual Gain / Maximum Possible Gain) × 100

**Example:**
- Your actual: Bought at $100, sold at $118 (+18%)
- Extended window shows: Could have bought at $97 (3% lower), could have sold at $122 (+22% from your entry, +25.8% from best entry)
- Max possible: From $97 to $122 = +25.8%, round to 25%
- Score: 18/25 × 100 = **72**

**What this tells you:** "You captured 72% of the best possible outcome for this trade."

---

### 3.5 Alpha TARGET - Prediction vs Market (Metric #5)

**Concept:** How much more ambitious was your prediction than what the market actually did?

**Formula:** `(Your Prediction - Market Return) / Market Return`

**Example:**
- Your prediction: +20%
- Market during same period: +3%
- Difference: 17%
- Score: 17/3 = **5.6x**

**What this tells you:** "Your target was 5.6x more ambitious than the market delivered."

**Open question:** Is this the right framing? This measures prediction *boldness* relative to actual market, whereas Raw TARGET measures prediction *accuracy*.

**Relationship to Difficulty:**
- Difficulty = prediction vs *expected* market (10%/year baseline)
- Alpha TARGET = prediction vs *actual* market during holding period

---

### 3.6 Alpha AIM - Your Return vs Market (Metric #6)

**Concept:** How much did you beat (or lose to) the market?

**Formula:** `Your Return / Market Return`

**Example:**
- Your return: +18%
- Market return: +3%
- Score: 18/3 = **6x**

**What this tells you:** "You made 6x what the market made."

**Display:** Using "x" multiplier format where 1x = matched market.
- 6x = you did 6 times better than market
- 0.5x = you got half what market got

---

### 3.7 Alpha SHOT - Your Optimal vs Market Optimal (Metric #7)

**Concept:** How did your best-case scenario compare to the market's best-case during the same window?

**Formula:** `Your Max Possible / Market Max Possible`

**Example:**
- Your max possible (extended window): +25%
- Market (SPY) max possible during same extended window: +5%
- Score: 25/5 = **5x**

**What this tells you:** "The upside potential of your pick was 5x the market's upside potential."

---

### 3.8 Letter Grade (Metric #8)

**Concept:** A final composite grade that rolls up all metrics into a single, intuitive rating.

**Scale:**
- F, D, C, B, A (with potential +/- variants)
- **AA** for excellent performance
- **AAA** for exceptional/rare performance

**Has numeric equivalent** (e.g., A- = 91, B+ = 87, etc.)

**Formula:** TBD - needs to weight all the other metrics appropriately.

---

## 4. Sample Scenario with All 8 Metrics

**The Trade:**
- **Ticker:** NVDA
- **Prediction:** +20% in 2 months
- **Entry:** Oct 15 @ $100
- **Exit:** Dec 15 @ $118 (+18%)
- **S&P (SPY) same period:** +3%
- **Extended window analysis:**
  - Best entry available: $97 (3% below your entry)
  - Best exit available: $122 (+22% from your entry, +25.8% from best entry)
  - Your max possible: 25%
  - SPY max possible in extended window: 5%
- **Annualized prediction:** 20% in 2 months = 120%/year

**Calculated Scores:**

| # | Metric | Calculation | Score |
|---|--------|-------------|-------|
| 1 | Difficulty | 120% / 10% | **12x** |
| 2 | Raw TARGET | 18% / 20% × 100 | **90** |
| 3 | Raw AIM | 18% gain | **18** (or 108 annualized?) |
| 4 | Raw SHOT | 18% / 25% × 100 | **72** |
| 5 | Alpha TARGET | (20% - 3%) / 3% | **5.6x** |
| 6 | Alpha AIM | 18% / 3% | **6x** |
| 7 | Alpha SHOT | 25% / 5% | **5x** |
| 8 | Letter Grade | Composite TBD | **A-** |

---

## 5. Open Questions & Challenges

### Challenge 1: Annualization Problem (Raw AIM)

**The issue:** Short-term trades produce absurd annualized numbers.
- 5% in 1 day = 1,825% annualized
- 35% in 1 week = 1,820% annualized

**The need:** We want to reward efficient use of time/capital, but not make day trading look 20x better than patient investing.

**Potential solutions to discuss:**
- Cap the annualized number?
- Use a different time normalization (PPD)?
- Tiered approach based on holding period?
- Log scale?

---

### Challenge 2: Raw vs Alpha Structure

**The issue:** The 2x3 matrix (Raw/Alpha × Target/Aim/Shot) is elegant, but do the Alpha versions of each metric actually make sense?

| Metric | Raw Version Clear? | Alpha Version Clear? |
|--------|-------------------|---------------------|
| TARGET | ✓ Prediction accuracy | ? Prediction boldness vs market? |
| AIM | ✓ Your actual return | ✓ Your return vs market |
| SHOT | ✓ Optimal capture % | ? Your optimal vs market optimal? |

**Questions:**
- Is Alpha TARGET measuring something useful?
- Does Alpha SHOT tell a meaningful story?
- Should we abandon the strict 2×3 matrix for something that fits the concepts better?

---

### Challenge 3: What Story Does Each Metric Tell?

For the scoring to be useful for learning, each metric should answer a clear question:

| Metric | Question It Answers | Clear? |
|--------|---------------------|--------|
| Difficulty | "How bold was my prediction?" | ✓ |
| Raw TARGET | "Did I predict correctly?" | ✓ |
| Raw AIM | "How much did I make?" | ✓ |
| Raw SHOT | "Did I time it well?" | ✓ |
| Alpha TARGET | "Was my prediction bold vs actual market?" | ? |
| Alpha AIM | "Did I beat the market?" | ✓ |
| Alpha SHOT | "Was my stock's potential better than market's?" | ? |
| Letter Grade | "What's my overall score?" | ✓ |

---

### Challenge 4: Difficulty vs Alpha TARGET Overlap

Both metrics compare your prediction to the market, but differently:

- **Difficulty:** Your prediction vs *expected* 10%/year S&P
- **Alpha TARGET:** Your prediction vs *actual* S&P during holding period

**Questions:**
- Is this redundant?
- Do both tell useful, distinct stories?
- Should one be removed?

---

### Challenge 5: The Multiplier Display

We've settled on using "x" format for Alpha row (6x instead of 600%).

**Benefits:**
- Cleaner display
- Consistent with Difficulty (also uses x)
- 1x = market is intuitive baseline

**But:** What about when you underperform?
- You made 2%, market made 4%
- Alpha AIM = 2/4 = 0.5x
- Does "0.5x" read well? Or should losses display differently?

---

### Challenge 6: Grade Calculation

How do we combine 7 metrics into one letter grade?

**Considerations:**
- Which metrics matter most?
- Should some be weighted higher?
- Can you get an A with a bad Alpha AIM?
- What earns AA vs AAA?

---

## 6. Context: Why This Matters

Outvestments is built on the premise that **no other app scores trading performance meaningfully.** The scoring system is core to the value proposition.

**User goals the scoring should serve:**
1. **Prove skill** - Show it wasn't just luck
2. **Learn from mistakes** - Understand what went wrong
3. **Compare fairly** - Normalize across different holding periods
4. **Feel the opportunity cost** - Know what you left on the table

**The scoring should NOT:**
- Reward lucky short-term flips disproportionately
- Be so complex users can't understand it
- Hide losses or make bad trades look good
- Be gameable

---

## 7. Questions for the Roundtable

1. **Does the 8-metric structure make sense?** Or is it overengineered?

2. **How should we handle annualization** for Raw AIM without breaking on short-term trades?

3. **Is Alpha TARGET a meaningful metric?** What exactly should it measure?

4. **Is Alpha SHOT a meaningful metric?** Or is comparing "your optimal vs market optimal" a stretch?

5. **Should we keep the strict 2×3 matrix** (Raw/Alpha × Target/Aim/Shot) or rethink the structure?

6. **How should the Letter Grade be calculated?** What weights?

7. **What edge cases will break this?** (Day trades, losing trades, flat market, etc.)

8. **Is this learnable for users?** Can a new user understand what these numbers mean?

---

## 8. Reference: Mockup Image

![Scoreboard Mockup](../mockups/scoreboard-concept.png)

The visual shows:
- Difficulty (1.5x) in top left
- Grade Score (A-) in top right
- 2×3 matrix in center with Raw and Alpha rows
- Stadium scoreboard aesthetic with yellow on green

---

**Document Status:** Ready for Party Mode Roundtable Discussion
