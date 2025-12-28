# Outvestments: Investor Panel Briefing

## For Review By: AI Hedge Fund Advisory Panel

**Purpose:** We're building a trading accountability platform and need your collective wisdom to develop scoring metrics that identify genuine skill vs luck, reward good trading behavior, and help retail traders become better investors.

---

## Executive Summary

**Outvestments** is a gamified paper trading platform designed to make retail traders better investors by:

1. Forcing thesis documentation BEFORE trading
2. Scoring performance with time-normalized metrics
3. Comparing every trade to benchmarks (what SPY did in the same period)
4. Tracking patterns over time to answer: "Am I getting better as a trader?"

**Core Philosophy:** We're not just tracking trades - we're building a trading education system disguised as a game.

**The Big Question:** How do we score trading performance in a way that rewards genuine skill, punishes bad habits, and helps traders improve?

---

## The Problem We're Solving

### Retail Trader Reality

- **70-90% of retail traders lose money** (FINRA, academic studies)
- Most losses come from cognitive biases, not lack of information
- No platform currently forces accountability or measures skill development
- Traders remember wins, forget losses, and can't verify their own track records

### Why Existing Solutions Fail

| Platform | What's Missing |
|----------|----------------|
| Robinhood/Fidelity | Shows P/L but not if you beat the market |
| Paper trading apps | No skill measurement, no thesis tracking |
| Copy trading (eToro) | Copies trades, not reasoning - you don't learn WHY |
| Finfluencers | Cherry-picked wins, no verified full track record |

### Our Hypothesis

If we force traders to:
1. Document WHY they're making a trade (thesis)
2. State WHAT they expect (specific price + date)
3. Compare results to WHAT THEY WOULD HAVE MADE doing nothing (opportunity cost)

...they will become better traders because they can finally learn from their mistakes with real data.

---

## The Three-Tier Hierarchy

We structure every trade into three levels:

### 1. Target (Thesis Level)
- The WHY behind your trades
- Example: "AI infrastructure spending will accelerate in 2025"
- Contains: Thesis text, catalysts, risk factors, timeframe
- Scored on: Did your thesis play out? What % of predictions under this thesis hit?

### 2. Aim (Prediction Level)
- The specific WHAT you're betting on
- Example: "NVDA to $200 by March 2025"
- Contains: Ticker, target price, target date, direction (up/down)
- Scored on: Accuracy (how close to target), timing

### 3. Shot (Trade Level)
- The execution of your prediction
- Example: "Buy 10 shares NVDA @ $140"
- Contains: Entry price, quantity, entry date, exit price, exit date
- Scored on: PPD, alpha generated, opportunity cost

---

## Current Scoring Framework

### Performance Per Day (PPD)

Our core time-normalized metric:

```
PPD = (% gain or loss) / (days held)
```

| Scenario | Return | Days | PPD |
|----------|--------|------|-----|
| Quick win | +10% | 5 | 2.0 |
| Slow win | +10% | 50 | 0.2 |
| Quick loss | -5% | 3 | -1.67 |

**Why PPD matters:** A 10% gain in 5 days is vastly better than 10% gain in 50 days. Traditional platforms treat these as equal.

### Accuracy Scoring

How close did you get to your stated target?

```
Accuracy = (Actual Return / Target Return) × 100
```

| Result | Score |
|--------|-------|
| Hit target exactly | 100 |
| Exceeded by 50% | 150 |
| Got 80% of target | 80 |
| Broke even (expected gains) | 0 |
| Wrong direction | Negative |

### NPC Opponents (Benchmark Comparison)

Every trade is compared to "NPC Opponents" - what you would have made doing something else:

| NPC | Benchmark | Question Answered |
|-----|-----------|-------------------|
| The Index | S&P 500 (SPY) | Did you beat the market? |
| The Sector | Sector ETF | Did you beat your sector? |
| The Risk-Free | T-Bills | Did you beat doing nothing? |

**Alpha Calculation:**
```
Alpha = Your Return - SPY Return (same period)
```

**Opportunity Cost (in dollars):**
```
Opportunity Cost = (SPY Return × Your Capital) - Your Actual Gain
```

### Market Condition Tags

Each trade is tagged with market conditions:

| Condition | Definition |
|-----------|------------|
| Bull | S&P up >10% annualized during holding period |
| Bear | S&P down >10% annualized |
| Flat | Between -10% and +10% |

**Why this matters:** Making 20% in a bull market where SPY made 25% is actually underperformance.

---

## Cognitive Biases We're Fighting

These are the psychological patterns that cause retail traders to lose money. We need scoring and features that counteract each one:

### 1. Selective Memory
**Pattern:** Traders remember wins, forget losses
**Current Solution:** Show win count + win VALUE, loss count + loss VALUE
**Question for Panel:** How should we weight value vs count in a composite score?

### 2. Bull Market Illusion
**Pattern:** "I'm a genius!" during rising markets
**Current Solution:** Market condition tags, benchmark comparison
**Question for Panel:** Should we discount returns during bull markets? How much?

### 3. Opportunity Cost Blindness
**Pattern:** "I made 20%" without realizing SPY made 30%
**Current Solution:** Show dollar difference vs benchmark on every trade
**Question for Panel:** How should opportunity cost factor into the overall score?

### 4. Chasing Wins
**Pattern:** Big win → overconfidence → bigger bet → bigger loss
**Current Solution:** TBD - we haven't figured out the right trigger
**Question for Panel:** How do we detect and score this pattern?

### 5. No Exit Plan
**Pattern:** Traders know when to get in but not when to get out
**Current Solution:** Advanced mode requires exit conditions before entry
**Question for Panel:** Should we reward traders who define exit conditions upfront?

### 6. Hindsight Bias
**Pattern:** "I knew it all along"
**Current Solution:** Locked, timestamped predictions that can't be edited
**Question for Panel:** Should thesis quality be scored? How?

### 7. Confirmation Bias
**Pattern:** Only seeking information that supports your position
**Current Solution:** Devil's advocate prompts (future feature)
**Question for Panel:** Can scoring incentivize considering the bear case?

### 8. Position Sizing Errors
**Pattern:** Betting too much on low-conviction ideas, too little on high-conviction
**Current Solution:** Track conviction level at entry, compare to position size
**Question for Panel:** How should conviction-to-sizing correlation be scored?

---

## Scoring Dimensions We Need Help Defining

### 1. Thesis Quality Score

How do we score the quality of someone's reasoning BEFORE we know the outcome?

Possible factors:
- Specificity (vague vs specific predictions)
- Catalyst identification (did they name what would move the stock?)
- Risk acknowledgment (did they identify what could go wrong?)
- Timeframe appropriateness (is the timeframe realistic for the thesis?)

**Question:** What makes a good thesis from your investment philosophies?

### 2. Difficulty Multiplier

Currently we have:

| Target Return | Difficulty |
|---------------|------------|
| <5% | 0.5x |
| 5-15% | 1.0x |
| 15-30% | 1.5x |
| 30-50% | 2.0x |
| >50% | 2.5x |

**Questions:**
- Is this the right scale?
- Should difficulty also factor in timeframe? (5% in 1 week vs 5% in 1 year)
- Should difficulty factor in volatility of the underlying?
- Should shorting get extra difficulty credit?

### 3. Consistency Score

How do we reward consistent performance vs one lucky home run?

Possible approaches:
- Standard deviation of returns
- Win rate over rolling periods
- Drawdown metrics
- Sharpe-like ratio for paper trading

**Question:** How would each of you evaluate consistency in a track record?

### 4. Risk-Adjusted Returns

For paper trading where there's no real capital at risk, how do we simulate risk-adjusted returns?

Possible approaches:
- Position size as % of paper portfolio
- Implied volatility at entry
- Beta-adjusted returns
- Sector concentration penalty

**Question:** What risk metrics matter most for evaluating trader skill?

### 5. Learning Velocity Score

How do we measure if someone is GETTING BETTER over time?

Possible metrics:
- Improving win rate over rolling periods
- Increasing alpha generation
- Better accuracy on predictions
- Fewer position sizing errors
- Better timing (hitting targets closer to predicted dates)

**Question:** What would indicate a trader is developing genuine skill vs getting lucky?

### 6. Thesis Validation Score

When a thesis plays out, how do we score it?

Scenarios:
- Thesis was right AND you made money
- Thesis was right BUT you exited too early
- Thesis was wrong BUT you made money anyway (luck)
- Thesis was wrong AND you lost money

**Question:** Should "right for the wrong reasons" be penalized?

---

## The "Am I Getting Better?" Dashboard

Central to our platform is answering this question. We currently track:

| Metric | Description |
|--------|-------------|
| Win Count | Number of profitable trades |
| Win Value | Total $ gained on wins |
| Loss Count | Number of losing trades |
| Loss Value | Total $ lost on losses |
| Alpha Trend | Are you generating more alpha over time? |
| Accuracy Trend | Are predictions getting more accurate? |
| PPD Trend | Is efficiency improving? |

**Question:** What other metrics would you want to see to evaluate if a trader is improving?

---

## Black Swan / Unicorn Events

We tag major market events that override all theses:
- COVID crash (March 2020)
- Trump tariffs (December 2024)
- Flash crashes

**Question:** How should performance during black swan events be handled in scoring?

Options:
1. Exclude entirely from scoring
2. Score separately (crisis alpha)
3. Tag but include normally
4. Bonus points for limiting losses during crashes

---

## Behavioral Rewards We're Considering

Should we give scoring bonuses for good behavior?

| Behavior | Possible Bonus |
|----------|----------------|
| Documenting exit conditions | +X% to score |
| Acknowledging risks in thesis | +X% |
| Hitting target and exiting (not holding past target) | +X% |
| Cutting losses at stated stop-loss | +X% |
| Diversification across sectors | +X% |
| Not trading during high-volatility events | +X% |

**Question:** Which behaviors are most predictive of long-term success?

---

## Questions for the Panel

### For Value Investors (Buffett, Munger, Graham types):
1. How do you evaluate the quality of an investment thesis?
2. What distinguishes genuine insight from lucky timing?
3. How should patience be rewarded in scoring?

### For Growth Investors (Cathie Woods, Peter Lynch types):
1. How should we score conviction on high-growth plays?
2. When is it right to hold through volatility vs cut losses?
3. How do you evaluate thesis quality on emerging technologies?

### For Quantitative Investors:
1. What statistical measures best identify skill vs luck?
2. How many trades are needed for statistical significance?
3. What risk-adjusted metrics work for paper trading?

### For Macro Investors:
1. How should macro thesis (Fed policy, geopolitics) be scored differently?
2. Should trades aligned with macro trends get difficulty bonuses?
3. How do you evaluate timing on macro plays?

### For Technical Traders:
1. Should technical thesis (support/resistance, patterns) be scored differently?
2. How should we handle shorter timeframes?
3. What metrics matter most for trading skill vs investing skill?

---

## What We Need From You

1. **Scoring Function Recommendations**
   - How should we weight PPD vs Accuracy vs Alpha?
   - What's the right formula for a composite score?

2. **Behavioral Scoring**
   - Which trader behaviors should be rewarded/penalized?
   - How do we incentivize good habits without gaming?

3. **Skill Identification**
   - What metrics reliably separate skill from luck?
   - How many data points are needed?

4. **Thesis Quality**
   - Can thesis quality be scored objectively?
   - What makes a thesis good from your philosophy?

5. **Risk Metrics**
   - What risk measures matter for evaluating trader development?
   - How do we simulate risk-adjusted returns in paper trading?

6. **Edge Cases**
   - How do we handle black swan events?
   - How do we handle "right for wrong reasons" scenarios?
   - How do we handle different investment styles fairly?

---

## Our Constraints

1. **Paper trading only** - No real money at risk
2. **Retail traders** - Not institutional, not professional
3. **Educational focus** - Primary goal is making better traders
4. **Gamified** - Needs to be engaging, not just analytical
5. **MVP scope** - Need to start simple and iterate

---

## Summary

We're building a platform that:
- Forces thesis documentation before trading
- Scores with time-normalized metrics (PPD)
- Compares every trade to benchmarks (opportunity cost)
- Tracks patterns to show if you're improving
- Uses game mechanics to make accountability fun

We need your collective wisdom to:
- Define scoring functions that identify real skill
- Create behavioral incentives that build good habits
- Design metrics that answer "Am I getting better?"

**The goal:** Make retail traders better, not just more engaged.

---

*Document prepared for AI Hedge Fund Advisory Panel review*
*Outvestments | December 2025*
