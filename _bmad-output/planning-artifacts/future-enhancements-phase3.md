# Outvestments - Phase 3 Future Enhancements

**Document Status:** Planning Backlog
**Target Phase:** Phase 3 (Post-MVP)
**Last Updated:** 2025-12-30
**Version:** 1.1

---

## Overview

These features are earmarked for Phase 3 development after MVP validation with the initial friend group. They focus on engagement mechanics, AI coaching (Premium Plus tier), and social features that would support broader user adoption.

**Scope Clarification:**
- **Phase 1:** Core MVP functionality
- **Phase 2:** Monetization infrastructure (tiers, payments, referrals) - See [pricing-tiers.md](./pricing-tiers.md)
- **Phase 3:** Engagement features + AI coaching (Premium Plus exclusive)

**MVP Scope Reminder:** Phase 1-2 focuses on core functionality for Matt and 2-3 friends. These Phase 3 features are explicitly out of scope until product-market fit is validated.

---

## Engagement Features

### 1. Rookie Season
**Category:** Onboarding / Retention
**Inspiration:** Protected learning period for new traders

- First 90 days of trading marked as "Rookie Season"
- Separate leaderboard for rookies (less intimidating)
- Guided challenges to learn the Target → Aim → Shot workflow
- "Graduation" achievement when rookie season completes
- Historical trades tagged so users can filter out their learning period

**Why:** Reduces new user anxiety, provides safe space to learn, prevents early discouragement from competing against veterans.

---

### 2. Daily Streak
**Category:** Retention / Habit Formation
**Inspiration:** Duolingo's streak mechanic (proven to drive 4x retention)

- Track consecutive days with app engagement
- "Engagement" defined as: logging in, reviewing portfolio, making a prediction, or logging a trade
- Visual streak counter on dashboard
- Streak freeze power-ups (earn through achievements?)
- Milestone rewards at 7, 30, 90, 365 days

**Why:** Creates daily habit, leverages loss aversion (don't want to break streak), drives consistent engagement.

---

### 3. Weekly Challenges
**Category:** Engagement / Skill Building
**Inspiration:** Gaming battle passes, fitness app challenges

- Rotating weekly challenges with specific objectives
- Examples:
  - "Make 3 predictions in the tech sector"
  - "Close a trade with 15%+ PPD"
  - "Beat the S&P NPC this week"
  - "Document thesis for 2 new Targets"
- XP/achievement rewards for completion
- Optional: community-wide challenges with aggregate goals

**Why:** Provides directed engagement, teaches different aspects of the system, creates variety.

---

### 4. Shareable Shot Cards
**Category:** Social / Viral Growth
**Inspiration:** Spotify Wrapped, sports highlight cards

- Auto-generated visual cards for notable trades
- Include: ticker, entry/exit, % gain, PPD score, thesis snippet
- Watermarked with Outvestments branding
- One-tap share to Twitter/Discord/iMessage
- "Replay" animation showing price movement
- Privacy controls (blur actual dollar amounts, show only %)

**Why:** Organic marketing, social proof, celebrates wins in shareable format.

---

### 5. Sector Leagues
**Category:** Competition / Specialization
**Inspiration:** Fantasy sports leagues, skill-based matchmaking

- Separate leaderboards by sector (Tech, Healthcare, Energy, etc.)
- Users can "main" a sector for focused competition
- Sector-specific achievements
- Encourages specialization and expertise development
- Could evolve into draft-style leagues

**Why:** Creates niche communities, allows expertise recognition, more achievable competition tiers.

---

### 6. Duo-Style Notifications
**Category:** Retention / Re-engagement
**Inspiration:** Duolingo's famously effective push notifications

- Playful, personality-driven notifications
- Examples:
  - "Your NVDA Aim expires in 3 days. Still feeling bullish?"
  - "The market's moving. Your thesis predicted this."
  - "You haven't taken a Shot in a while. The S&P is up 2% this week."
  - "Congratulations! Your prediction was right. Time to log the trade?"
- User-configurable frequency and tone
- A/B test different personalities (coach, friend, drill sergeant)

**Why:** Proven retention mechanic, brings users back, adds personality to the app.

---

### 7. Daily Market Quiz
**Category:** Education / Engagement
**Inspiration:** News apps, trivia games

- Quick 3-5 question daily quiz
- Topics: market news, trading concepts, historical events
- XP rewards for participation
- Streak bonus for consecutive days
- Leaderboard for quiz performance
- Questions can reference user's own portfolio ("Your AAPL position is up 12%. What was your original thesis?")

**Why:** Educational value, quick daily touchpoint, reinforces learning.

---

## Psychological Debiasing Features (Research-Backed)

These features emerged from behavioral finance research conducted during BA analysis. They address common cognitive biases that cause retail traders to lose money.

### 8. Reality Check Widget
**Problem:** Selective memory - traders remember wins, forget losses
**Solution:** Dashboard widget showing actual win/loss ratio, average gain vs average loss, comparison to what user "expected"

**STATUS: PROMOTED TO MVP** - See E9-S6: Trader Progress Dashboard. Expanded to include win count/value, loss count/value, trend over time, and the central question "Am I getting better as a trader?"

---

### 9. Post-Win Warning System
**Problem:** Chasing wins - $10k gain leads to $70k loss from overconfidence
**Solution:** After significant wins, show contextual warning about common patterns, require thesis documentation before next trade

**STATUS: NEEDS MORE THOUGHT** - The "just had a big win" trigger isn't right. Whether to warn depends on how related the next trade is to the winning thesis. A big win on NVDA doesn't mean you shouldn't buy GOOGL if it's a different thesis. Need to think about what the right trigger is - maybe pattern-based (rapid succession of large trades?) or confidence-level based.

---

### 10. Opportunity Cost Calculator
**Problem:** "I made 20% over 3 years" without realizing S&P made 30%
**Solution:** Every trade shows dollar amount difference vs. benchmark ("You made $2,000 but SPY would have made $3,100")

---

### 11. Market Condition Tags
**Problem:** Bull market illusion - "anybody does well in a good market"
**Solution:** Tag all trades with market conditions at time of entry, show performance adjusted for market tailwind/headwind

**STATUS: PROMOTED TO MVP** - See E7-S12: Market Condition Tags. Bull/Bear/Flat tagging with visual iconography.

---

### 12. Devil's Advocate Prompts
**Problem:** Confirmation bias - only seeking info that supports position
**Solution:** Before finalizing thesis, show counter-arguments and bear cases, require acknowledgment

---

## Implementation Priority (When Phase 3 Begins)

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P1 | Daily Streak | Low | High |
| P1 | Shareable Shot Cards | Medium | High |
| P2 | Duo-Style Notifications | Low | Medium |
| P2 | Weekly Challenges | Medium | Medium |
| P2 | Reality Check Widget | Low | High |
| P3 | Rookie Season | High | Medium |
| P3 | Sector Leagues | High | Medium |
| P3 | Daily Market Quiz | Medium | Low |
| P3 | Opportunity Cost Calculator | Low | Medium |

---

## Notes

- All features should maintain the core philosophy: **make better traders, not just more engaged users**
- Gamification must never encourage reckless trading
- Social features need privacy controls (blur amounts, opt-out of leaderboards)
- Any notification system must be respectful and user-configurable

---

## Phase 2: AI-Assisted Trading Features

### 13. Target Coach

**Category:** AI Assistance / Risk Management
**Target Phase:** Phase 2
**Added:** 2025-12-29

An AI-powered coaching layer that helps users develop better trading theories and execution discipline.

**Feature Components:**

1. **Theory Analysis (Pre-Trade)**
   When typing up a Target theory, the coach analyzes it and provides:
   - Additional risk factors you may not have considered
   - Risk assessment score
   - Likelihood rating for your projection
   - Counter-arguments / bear case prompts
   - Similar historical patterns and outcomes
   - **Related opportunities** - Other stocks that fit the same thesis pattern
     - Example: "AI chip stocks" thesis on NVDA → suggests AMD, MRVL, TSM, AVGO
     - Helps with diversification within a thesis
     - Could show correlation data between suggested tickers

2. **Active Coaching (During Trade)**
   While Shots are open, the coach provides guidance based on your original theory:
   - "Your thesis mentioned earnings as a catalyst - that's in 3 days"
   - "Price hit your target level but you haven't taken profits"
   - "This pullback is within your thesis bounds" vs "This breaks your thesis"
   - Exit trigger reminders based on your documented plan

3. **Post-Trade Review**
   After closing positions:
   - Was outcome aligned with thesis or luck?
   - What signals did you miss?
   - How could the theory have been better?
   - Pattern recognition across your trades

4. **Post-Exit Guidance**
   After closing a position, if the thesis still has legs:
   - "Your thesis target was $150, you exited at $130 - still 15% upside if thesis holds"
   - "Catalyst you identified (earnings) hasn't happened yet"
   - Re-entry opportunity alerts based on original thesis
   - Help distinguish "took profits appropriately" vs "exited prematurely"
   - Prevents FOMO re-entry without thesis support

**Future Exploration: Target Practice Mode**
- Training exercise / simulation mode
- Name theories about market movements (no real money)
- Track prediction accuracy over time
- Build skill before risking capital
- Leaderboard for prediction accuracy
- "Paper trading" with thesis documentation

**Implementation Considerations:**
- Could use local LLM for privacy (theories contain strategy)
- Integration with market data APIs for context
- Historical pattern matching from financial databases
- Sentiment analysis on thesis text

**Why:** Addresses the core mission of making better traders. Most retail losses come from poor thesis development and emotional execution - this directly targets both.

---

### 14. AI Pattern Analysis (Premium Plus)

**Category:** AI Assistance / Personalized Insights
**Target Phase:** Phase 3
**Tier:** Premium Plus Only
**Added:** 2025-12-30

Deep analysis of user trading patterns to identify strengths, weaknesses, and improvement opportunities.

**Pattern Analysis Types:**

| Analysis Type | Example Insight |
|---------------|-----------------|
| **Strength ID** | "You excel at tech sector momentum plays — 78% accuracy" |
| **Weakness ID** | "Your timing on earnings plays is poor — wait for post-earnings" |
| **Calibration** | "Your 8+ confidence calls underperform your 5-6 calls" |
| **Discipline** | "The 10% you ignore stop losses cost 40% of your losses" |
| **Patterns** | "You exit winners early and hold losers too long" |
| **Sector** | "Avoid healthcare — 35% accuracy there" |
| **Timing** | "Monday entries outperform Friday entries" |

**Additional Premium Plus Features:**

1. **"Why/Why Not?" Prompts**
   - Reflective prompts during thesis creation
   - "If this is sector-wide, why exclude [PEER]?"
   - "This catalyst historically impacts suppliers first. Monitor them?"
   - User may ignore without penalty (recorded for learning analytics)

2. **Risk Gap Detection**
   - AI suggests risks user may have missed
   - Based on historical patterns and thesis analysis
   - "Your thesis doesn't mention [common risk factor]"

3. **Historical Pattern Matching**
   - "Similar theses in 2021 had X% success rate"
   - "This catalyst type historically moves Y% over Z days"

4. **Weekly AI Summary**
   - Email digest of insights and patterns
   - "This week you were 3-1 on tech, 0-2 on healthcare"
   - Actionable recommendations

5. **Thinking Quality Coach**
   - Long-term coaching on decision quality
   - "Your thesis quality improved 15% this quarter"
   - Focus on process, not just outcomes

**Data Requirements:**
- Minimum 20 closed trades for meaningful patterns
- 90+ days of history for trend analysis
- User opt-in for AI analysis of their data

**Privacy Considerations:**
- All analysis runs on anonymized patterns
- No thesis content leaves the platform
- User controls what data AI can access

See: [pricing-tiers.md](./pricing-tiers.md) for full Premium Plus feature list.

---

### 15. Monetization Strategy - Tiered Pricing

**Category:** Business Model
**Target Phase:** Phase 2
**Added:** 2025-12-29

Three-tier freemium model to drive revenue while keeping core functionality accessible.

**Tier Structure:**

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Basic access, 2-3 scoring metrics only |
| **Premium** | TBD | Full 8-metric scoring system, all standard features |
| **Premium Plus** | TBD | Everything in Premium + AI Target Coach |

**Free Tier (Lead Generation)**
- Limited scoring (e.g., Win Rate + Basic PPD only)
- Core Target → Aim → Shot workflow
- Basic dashboard
- **Scoring only after trade closes** - can track positions but no live grades
- **Aggregate metrics only** - portfolio-level totals, no per-shot breakdown
- Goal: Hook users, demonstrate value, drive upgrades

**Premium Tier (Core Revenue)**
- Full 8-part scoring system (all metrics)
- **Real-time grading during open positions** - see how your trade scores as it unfolds
- **Per-shot metrics** - detailed breakdown for each individual trade
- Complete dashboard analytics
- Historical performance tracking
- Market condition tagging
- Benchmark comparisons (vs S&P NPC)

**Premium Plus Tier (High-Value Upsell)**
- Everything in Premium
- AI Target Coach (full lifecycle)
  - Theory analysis with risk scoring
  - Active coaching during trades
  - Post-trade review
  - Post-exit guidance
- Alternative strategy suggestions:
  - "With this thesis, options could have returned X%"
  - "A covered call strategy would have yielded..."
  - "Dollar-cost averaging entry would have..."
- Personalized learning insights
- Priority support

**Example Premium Plus Value:**
> "Your NVDA thesis was solid but you played shares. Next time with this setup at this conviction level, a call option at the $120 strike would have returned 340% vs your 45% on shares."

**Implementation Notes:**
- Stripe integration for subscriptions
- Feature flags per tier
- Usage metering for AI features (cost control)
- Free trial for Premium Plus (7-14 days?)
- Annual discount option

---

## Phase 2: Technical Enhancements

### 14. Hugging Face MCP Integration (Custom Graphics)

**Category:** Tooling / Design
**Target Phase:** Phase 2

When we move beyond MVP and want to create a more immersive "basketball arena" experience with custom graphics:

**Integration Options:**
- [Official Hugging Face MCP Server](https://huggingface.co/docs/hub/en/hf-mcp-server) - Access to 1000s of models
- [mcp-hfspace](https://github.com/evalstate/mcp-hfspace) - Direct FLUX.1-schnell integration

**Use Cases:**
- Generate custom hardwood floor textures
- Create arena/stadium atmosphere backgrounds
- Design unique trophy and achievement icons
- Generate promotional/marketing assets
- Create shareable Shot Card templates with custom art

**Setup (when ready):**
```bash
# Option 1: HF Spaces with FLUX
npx -y @anthropic-ai/mcp-installer install evalstate/mcp-hfspace

# Option 2: Official HF Hub access
# Add to MCP config: https://huggingface.co/mcp
```

**MVP Approach:** Stock textures + CSS + SVG scoreboard (sufficient for friends group)
**Phase 2 Approach:** Custom AI-generated assets for unique brand identity

**Notes:** Consider Figma MCP as complementary tool for design-to-code workflow.

---

## Related Documents

- [pricing-tiers.md](./pricing-tiers.md) - Full tier breakdown with limits and features
- [target-theory-system-v2.md](./target-theory-system-v2.md) - Conviction levels, monitor aims
- [prd-outvestments-2025-12-27.md](./prd-outvestments-2025-12-27.md) - Full requirements
- [product-brief-outvestments-2025-12-26.md](./product-brief-outvestments-2025-12-26.md) - Product overview

---

*Document created during BA research phase. Updated 2025-12-30 with AI coaching details and tier mapping.*
