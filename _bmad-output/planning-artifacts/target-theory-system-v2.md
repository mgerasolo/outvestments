# Target / Theory System v2 - Additions

**Document Status:** Locked
**Version:** 2.0
**Last Updated:** 2025-12-30
**Source:** Party Mode session with BA (Mary) + Architect (Winston)

---

## Strategic Philosophy

> **"Separates thinking from betting"**

This system transforms Outvestments from a trade-tracking app into a **capital-allocation thinking system**. Users can develop and validate investment theses without requiring capital commitment, reducing ego-lock and sunk-cost bias.

---

## 1. Theory Confidence Level (User-Declared)

**Purpose:** Distinguish between exploratory ideas and high-conviction calls without affecting scoring fairness.

### Implementation

Add a required-but-optional selector on every Target:

| Level | Label | Description |
|-------|-------|-------------|
| **High** | High Conviction | Would allocate significant capital |
| **Medium** | Medium Conviction | Leaning, considering entry |
| **Low** | Low Conviction / Exploratory | Track-only hypothesis |

### Rules

- Confidence level is **metadata only**
- Does **NOT** affect numeric scoring or leaderboards
- Used for:
  - Filtering views
  - Analytics segmentation
  - Coaching tone adjustment
  - Post-mortem insights

### Schema

```sql
ALTER TABLE targets ADD COLUMN
  conviction_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
  conviction_updated_at TIMESTAMP NULL;
```

---

## 2. Aim Types: Playable vs Monitor

**Purpose:** Allow one theory to track multiple related assets without forcing capital allocation.

### Implementation

Each Target can contain multiple Aims. Every Aim has a type:

| Type | Description | Shots Allowed | Scoring | Leaderboard |
|------|-------------|:-------------:|:-------:|:-----------:|
| **Playable** | Full execution eligible | ✅ Yes | ✅ Full (rolls up) | ✅ Yes |
| **Monitor** | Paper tracking only | ❌ No | ✅ Full (isolated) | ❌ No |

### Monitor Aims Track

- Directional outcome (was thesis correct?)
- Magnitude vs market (how much did it move?)
- Relative performance (vs S&P, vs sector)
- Correlation to main playable aim(s)

### Monitor Aim Scoring Isolation

**Critical Rule:** Monitor Aims are fully scored but their scores are **isolated** from career metrics.

| Score Type | Playable Aims | Monitor Aims |
|------------|:-------------:|:------------:|
| Individual Aim Score | ✅ Yes | ✅ Yes |
| Rolls up to Target Score | ✅ Yes | ❌ No |
| Rolls up to Career Score | ✅ Yes | ❌ No |
| Affects Leaderboard | ✅ Yes | ❌ No |
| Displayed to User | ✅ Yes | ✅ Yes (separate section) |

**Why:** Users need feedback on their monitoring predictions to validate thesis quality, but career/leaderboard scores should only reflect positions where capital was committed. This separates "thinking quality" from "betting quality."

### Key Rules

- Monitor Aims do **NOT** affect leaderboards
- They contribute only to:
  - Learning insights
  - Thesis Validity analysis
  - User's private calibration stats

### Schema

```sql
ALTER TABLE aims ADD COLUMN
  aim_type ENUM('playable', 'monitor') DEFAULT 'playable';

-- Monitor-specific tracking
ALTER TABLE aims ADD COLUMN
  monitor_entry_price DECIMAL(12,2) NULL,
  monitor_entry_date TIMESTAMP NULL,
  monitor_outcome ENUM('pending', 'correct', 'incorrect', 'partial') DEFAULT 'pending',
  monitor_outcome_notes TEXT NULL,
  monitor_vs_market_percent DECIMAL(8,4) NULL,  -- Performance relative to benchmark
  monitor_correlation_to_primary DECIMAL(3,2) NULL;  -- Correlation to main playable aim
```

---

## 3. Theory Expansion Guidance (Premium)

**Purpose:** Improve theory completeness and reasoning without social comparison or advice.

### Premium Features During Target Creation

| Feature | Description |
|---------|-------------|
| **Related assets** | Suggest assets that historically respond to the same catalyst |
| **Counterfactuals** | Suggest assets that historically did NOT respond (control group) |
| **Thesis scope analysis** | Identify if thesis is sector-wide, idiosyncratic, or upstream/downstream |

### Tone Guidelines

- **Observational** — "Historically, X also moved with this catalyst"
- **Educational** — "This thesis type tends to be sector-wide"
- **Never prescriptive** — No "you should trade this"

### Examples

> "When this catalyst occurred in 2021, AMD and MRVL also moved. Consider monitoring them."

> "This appears to be an idiosyncratic thesis. Peer stocks historically showed low correlation."

---

## 4. "Why / Why Not?" Prompts (Premium Plus)

**Purpose:** Improve theory hygiene through reflection, not instruction.

### Prompt Examples

| Scenario | Prompt |
|----------|--------|
| Sector thesis with missing peer | "If this is sector-wide, why exclude [PEER]?" |
| Upstream/downstream catalyst | "This catalyst historically impacts suppliers first. Do you want to monitor them?" |
| Idiosyncratic thesis | "This appears idiosyncratic. Are peers relevant to track?" |
| High confidence, no monitor aims | "You're highly confident but not tracking related assets. Any reason?" |

### Rules

- User may ignore any prompt
- No penalties for ignoring
- No scoring impact
- Prompts are recorded for learning analytics only

---

## 5. How This Affects Scoring

### Confidence Level

| Aspect | Impact |
|--------|--------|
| Numeric scoring | ❌ None |
| Leaderboards | ❌ None |
| Segmentation | ✅ Yes (filter by conviction) |
| Insights | ✅ Yes (calibration by confidence) |
| Coaching tone | ✅ Yes (different feedback for exploratory vs high-conviction) |

### Monitor Aims

| Aspect | Impact |
|--------|--------|
| Aim scoring | ✅ Yes (full scoring, displayed separately) |
| Shot scoring | ❌ None (no shots allowed) |
| Rolls up to Target Score | ❌ No (isolated) |
| Rolls up to Career Score | ❌ No (isolated) |
| Leaderboards | ❌ None |
| Thesis Validity | ✅ Yes (contributes to analysis) |
| User learning | ✅ Yes (private calibration) |
| "What if" tracking | ✅ Yes (theoretical P&L) |

### Playable Aims

| Aspect | Impact |
|--------|--------|
| Full Target scoring | ✅ Yes |
| Shot scoring | ✅ Yes |
| Leaderboards | ✅ Yes |
| All metrics | ✅ Yes |

---

## 5.1 Monitor Aims → Thesis Validity (Mathematical Definition)

**Purpose:** Define how Monitor Aim outcomes contribute to understanding thesis quality without affecting career metrics.

### Thesis Validity Score

The Thesis Validity Score answers: "Was this theory correct, regardless of whether I bet on it?"

```
Thesis Validity Score = Weighted average of all Aims under a Target
                        (Playable + Monitor, weighted by relative position size or equal weight)
```

### Monitor Aim Scoring Components

Each Monitor Aim is scored on three dimensions:

| Component | Formula | Weight |
|-----------|---------|--------|
| **Directional Accuracy** | `1` if direction correct, `0` if wrong, `0.5` if flat | 40% |
| **Magnitude Score** | `min(actual_move / predicted_move, 2.0)` | 35% |
| **Relative Performance** | `aim_return - benchmark_return` (normalized) | 25% |

**Monitor Aim Score:**
```
Monitor_Aim_Score = (0.40 × Directional) + (0.35 × Magnitude) + (0.25 × Relative)
```

### Thesis Validity Aggregation

For a Target with N Playable Aims and M Monitor Aims:

```
Thesis_Validity = (Σ Playable_Aim_Scores + Σ Monitor_Aim_Scores) / (N + M)
```

**Important distinctions:**
- **Target Score** (for leaderboards) = Average of Playable Aims only
- **Thesis Validity** (for learning) = Average of ALL Aims (Playable + Monitor)

### Example Calculation

**Target:** "AI chip sector will outperform in Q1 2025"

| Aim | Type | Directional | Magnitude | Relative | Score |
|-----|------|:-----------:|:---------:|:--------:|:-----:|
| NVDA → $180 | Playable | 1.0 | 0.8 | +0.12 | 0.83 |
| AMD → $160 | Monitor | 1.0 | 0.6 | +0.08 | 0.73 |
| MRVL → $95 | Monitor | 0.0 | 0.2 | -0.05 | 0.06 |

- **Target Score** (leaderboard): 0.83 (NVDA only)
- **Thesis Validity** (learning): (0.83 + 0.73 + 0.06) / 3 = **0.54**

The low Thesis Validity reveals the thesis was partially correct (NVDA, AMD worked) but not universally true (MRVL failed). User learns: "AI chips" was too broad—the thesis should have been narrower.

### Dashboard Display

**Playable Aims Section:**
- Individual scores per aim
- Aggregated Target Score (affects leaderboard)

**Monitor Aims Section (separate):**
- Individual scores per monitor aim
- Thesis Validity indicator
- "What would have happened" P&L simulation
- Learning insights: "Your thesis was X% validated by related assets"

---

## 6. Tier Mapping

### Free (Base)

| Feature | Included |
|---------|:--------:|
| Confidence flag | ✅ |
| Monitor Aims (manual creation) | ✅ |
| Basic thesis documentation | ✅ |
| Basic win/loss tracking | ✅ |

### Premium

| Feature | Included |
|---------|:--------:|
| Everything in Free | ✅ |
| Suggested Monitor Aims | ✅ |
| Cross-asset reasoning | ✅ |
| Confidence-aware feedback tone | ✅ |
| Monitor Aim "what if" P&L | ✅ |
| Thesis scope analysis | ✅ |
| Aim aggressiveness check | ✅ |

### Premium Plus

| Feature | Included |
|---------|:--------:|
| Everything in Premium | ✅ |
| "Why / Why Not?" prompts | ✅ |
| Deeper causal analysis | ✅ |
| Pattern insights (exploratory vs conviction) | ✅ |
| Long-term thinking-quality coaching | ✅ |
| AI risk gap detection | ✅ |
| Historical pattern matching | ✅ |
| Personalized strength/weakness analysis | ✅ |

---

## 7. Strategic Outcomes

This system design achieves:

| Outcome | How |
|---------|-----|
| **Separates thinking from betting** | Monitor Aims let users validate thesis without capital |
| **Encourages hypothesis testing** | Low-conviction exploratory mode reduces fear of being wrong |
| **Reduces ego-lock** | Confidence is metadata, not commitment |
| **Reduces sunk-cost bias** | Clear abort triggers + monitor tracking |
| **Value without trading** | Platform useful even for paper thesis validation |
| **Thinking system, not signal app** | Focus on decision quality, not trade volume |

---

## 8. Related Documents

- [pricing-tiers.md](./pricing-tiers.md) — Full tier breakdown with limits
- [future-enhancements-phase3.md](./future-enhancements-phase3.md) — AI coaching details
- [scoring-system.md](./scoring-system.md) — Scoring methodology (to be updated)

---

## Next Steps

1. [ ] Update PRD with these additions
2. [ ] Define Monitor Aims → Thesis Validity mathematical relationship
3. [ ] Create implementation epics for backend schema changes
4. [ ] Update UI wireframes for confidence selector + aim type toggle

---

*Document locked following Party Mode session 2025-12-30*
