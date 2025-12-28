# Outvestments - Phase 3 Future Enhancements

**Document Status:** Planning Backlog
**Target Phase:** Phase 3 (Post-MVP)
**Last Updated:** 2025-12-27

---

## Overview

These features are earmarked for Phase 3 development after MVP validation with the initial friend group. They focus on engagement mechanics and social features that would support broader user adoption.

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

## Phase 2: Technical Enhancements

### 13. Hugging Face MCP Integration (Custom Graphics)

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

*Document created during BA research phase. To be revisited after MVP validation.*
