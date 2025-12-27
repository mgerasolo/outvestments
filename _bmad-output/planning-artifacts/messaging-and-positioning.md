# Outvestments - Messaging & Positioning Strategy

**Document Status:** Draft
**Last Updated:** 2025-12-27
**Purpose:** Define core messaging, value propositions, and where they appear throughout the app

---

## Brand Positioning

**Tagline Options:**
- "Trade smarter. Track everything. Beat the market."
- "The only trading app with a real scoreboard."
- "Know your edge. Prove your edge."

**Core Identity:**
Outvestments is not just a trading tracker - it's a **trading accountability system** that makes you a better trader by forcing discipline, providing context, and proving (or disproving) your edge with data.

---

## The Six Core Value Propositions

### 1. "Trades You Can Trust"

**The Problem:** Most traders can't verify their own track record. Memory is unreliable. Brokerages show P/L but not whether you beat the market.

**Our Solution:** Immutable, timestamped records of every prediction and trade. You can't edit history. Your track record is sacred.

**Where It Appears:**
| Location | Implementation |
|----------|----------------|
| Onboarding | "Every prediction is timestamped. Every trade is tracked. Your history is permanent." |
| Target Creation | "Once you lock this in, it's part of your record forever." |
| Shot Execution | "This trade will be recorded with today's exact price and time." |
| History View | "Your complete, uneditable track record" |
| Empty State (History) | "No history yet - but once you start, every trade becomes part of your permanent record." |

---

### 2. "Everyone Wins in a Good Market"

**The Problem:** Bull markets make everyone feel like a genius. Traders attribute market-wide gains to their own skill. Then they get crushed when conditions change.

**Our Solution:** Every trade is tagged with market conditions (Bull/Bear/Flat) and compared to what the market did. You always know if you actually beat the benchmark.

**Where It Appears:**
| Location | Implementation |
|----------|----------------|
| Onboarding | "We show you what the market did during your trade. Because making 20% when SPY made 25% isn't winning." |
| Dashboard | Market condition indicator on all performance stats |
| Shot Card | Bull/Bear/Flat icon + "SPY did X% during this period" |
| History | Filter by market condition |
| Win Celebration | "Nice! But SPY only made X% - you actually generated alpha." OR "Solid gain, but SPY did better." |
| Tooltips | "This was during a bull market where average returns were higher than normal." |

---

### 3. "Trading the Right Way"

**The Problem:** Most retail traders lose money because they skip the fundamentals: no thesis, no target, no exit plan. They trade on impulse.

**Our Solution:** The Target → Aim → Shot workflow forces discipline. You can't trade without first documenting WHY you think this is a good idea.

**Where It Appears:**
| Location | Implementation |
|----------|----------------|
| Onboarding | "Before you trade, you predict. Before you predict, you think. That's the Outvestments way." |
| New Shot (no Target) | "Hold up - you need a Target first. What's your thesis?" |
| Target Creation | "Write down your reasoning. When this trade is over, you'll want to remember why you made it." |
| Empty State (Targets) | "Great traders have great ideas. Start by documenting your investment thesis." |
| Settings | "Skip thesis requirement" toggle (hidden by default, discourages use) |

---

### 4. "Have a Plan and Know It"

**The Problem:** Traders know when to get IN but rarely know when to get OUT. They hold winners too long, losers even longer.

**Our Solution:** Advanced Mode lets you document exit conditions, warning signs, and macro risks BEFORE you enter. Then we remind you of your own plan.

**Where It Appears:**
| Location | Implementation |
|----------|----------------|
| Onboarding (Advanced) | "The best traders have an exit plan before they enter. We help you stick to yours." |
| Target Creation (Adv) | "What would make you exit? Write it down now while you're thinking clearly." |
| Aim Detail | Display warning signs from Target |
| Target Hit Notification | "You hit your target! Remember your plan: [user's exit condition]" |
| Shot Detail | "Your exit plan: [displayed]" |
| Settings | "Enable Advanced Mode" with explanation |

---

### 5. "The Only Trading App With a Real Scoreboard"

**The Problem:** Robinhood shows you made money. Fidelity shows your P/L. But none of them score your performance in a meaningful, comparable way.

**Our Solution:** PPD (Performance Per Day), accuracy scores, difficulty multipliers, and NPC opponent comparisons. You can finally compare a 2-day trade to a 2-year trade. You can prove you beat the market.

**Where It Appears:**
| Location | Implementation |
|----------|----------------|
| Onboarding | "We don't just track your trades - we score them. Against yourself. Against the market. Against everyone." |
| Dashboard | Leaderboards with PPD rankings |
| Shot Card | Score prominently displayed |
| History | Career Score, trends over time |
| NPC Comparison | "You: +15% / SPY: +8% / WINNER: YOU" |
| Empty State (Dashboard) | "Your scoreboard is empty. Time to prove yourself." |

---

### 6. "The Only App That Shows Opportunity Cost"

**The Problem:** "I made 20% over 3 years" sounds great until you realize SPY made 30%. Traders don't think in opportunity cost.

**Our Solution:** Every single trade shows the dollar difference vs. benchmark. Not just percentage - actual dollars you left on the table (or beat the market by).

**Where It Appears:**
| Location | Implementation |
|----------|----------------|
| Onboarding | "We don't just show returns - we show what you would have made doing nothing. That's the real test." |
| Shot Detail | "You made $2,000. SPY would have made $3,100 in the same period. Opportunity cost: $1,100" |
| Target Summary | Aggregate opportunity cost for thesis |
| Dashboard | "Total Alpha Generated: +$X" or "Total Opportunity Cost: -$X" |
| History | Filter by "Beat Market" / "Lost to Market" |
| Closed Trade | "You [beat/lost to] the market by $X on this trade" |

---

## Educational Touchpoints

These are moments where we teach, not just inform:

### First-Time User Experiences

| Moment | Educational Content |
|--------|---------------------|
| First Target | "A Target is your thesis - the WHY behind your trade. Most traders skip this step. Don't." |
| First Aim | "An Aim is your specific prediction. Ticker + Price + Date. Now you're accountable." |
| First Shot | "A Shot is the trade itself. But because you have a Target and Aim, you'll actually know if you were right." |
| First Close | "Every closed trade gets scored. PPD = Performance Per Day. This lets you compare any trade to any other trade." |
| First NPC Battle | "The S&P is your opponent. Did you beat the market, or did the market beat you?" |

### Contextual Tooltips

| Element | Tooltip |
|---------|---------|
| PPD Score | "Performance Per Day normalizes returns across different holding periods. A 10% gain in 10 days (1% PPD) beats a 10% gain in 100 days (0.1% PPD)." |
| Accuracy | "How close did you get to your target? 100% means you hit it exactly." |
| Alpha | "Your return minus what SPY did. Positive = you beat the market. Negative = the market beat you." |
| Market Condition | "Bull = SPY up >10% annualized. Bear = SPY down >10%. Flat = in between. Context matters." |
| Difficulty | "Bigger predictions = higher difficulty = bigger rewards (or penalties). We reward ambition." |

### Win/Loss Learning Moments

| Scenario | Message |
|----------|---------|
| Big Win | "Great trade! Let's see how you did vs the market: [comparison]" |
| Big Loss | "Tough one. Your biggest lesson: [show original thesis]. What changed?" |
| Beat Market | "You generated alpha. This is what good trading looks like." |
| Lost to Market | "You made money, but SPY did better. Was the active trade worth the effort?" |
| Hit Target Early | "You hit your target! Was your thesis about TIME or PRICE? Maybe time to exit." |
| Missed Target | "You didn't hit your target, but [show what you did achieve]. Review your thesis." |

---

## Avoiding Common Mistakes (Nudges)

These are gentle interventions based on behavioral finance research:

### Selective Memory Prevention
- **What:** Win/loss counts AND values on dashboard
- **Message:** "Your memory lies. Your record doesn't. 12 wins, 4 losses - but are you actually profitable?"

### Chasing Wins Prevention
- **What:** Pattern detection for rapid trading after wins (DEFERRED - needs more thought on trigger)
- **Status:** Phase 3 - trigger mechanism TBD

### Bull Market Illusion Prevention
- **What:** Market condition tags + benchmark comparison
- **Message:** "You made 25% this year. So did everyone - it was a bull market. Let's see your alpha."

### Opportunity Cost Blindness Prevention
- **What:** Dollar amounts, not just percentages
- **Message:** "You made $2,000. That's real money. But SPY would have made $2,800."

### "Why Did I Buy This?" Prevention
- **What:** Thesis required before trading
- **Message:** "6 months from now, you'll want to remember why you bought this. Write it down."

### Holding Past Target Prevention
- **What:** Target hit notifications
- **Message:** "You hit your target 3 months early. Was your thesis about TIME or PRICE?"

---

## Voice & Tone Guidelines

### Personality
- **Confident but not arrogant** - We know this works, but we're not condescending
- **Playful but not frivolous** - Game elements, but real money stakes
- **Direct but not harsh** - We tell the truth, but we're not mean about it
- **Educational but not preachy** - We teach, but we don't lecture

### Sample Copy Styles

**Good:**
- "You beat the market by $340. Nice work."
- "SPY did better this time. It happens."
- "Your thesis was right, but your timing was off."

**Bad:**
- "Congratulations!!! You're amazing!!!" (too sycophantic)
- "You failed to beat the benchmark." (too harsh)
- "As we always say, proper thesis documentation is key to..." (too preachy)

### Terminology Consistency

| Use | Don't Use |
|-----|-----------|
| Target | Theory, Thesis, Idea |
| Aim | Prediction, Bet, Position |
| Shot | Trade, Order, Position |
| Pull the Trigger | Execute, Submit, Buy |
| NPC | Benchmark, Index, Bot |
| PPD | Daily Return, Normalized Return |

---

## Integration Points Summary

| App Area | Value Props Featured |
|----------|---------------------|
| Onboarding | All 6 - introduce the philosophy |
| Target Creation | #3, #4 |
| Aim Creation | #1, #3 |
| Shot Execution | #1, #5 |
| Dashboard | #2, #5, #6 |
| Shot Detail | #1, #2, #5, #6 |
| History | #1, #5, #6 |
| NPC Comparison | #2, #6 |
| Notifications | #4, learning moments |
| Empty States | #3, #5 |
| Settings | #4 (Advanced Mode) |

---

## Future: Party-Mode Discussion Topics

When we reconvene to discuss app-wide integration:

1. **Onboarding Flow** - How do we introduce all 6 value props without overwhelming?
2. **Progressive Disclosure** - Which concepts need to be learned first?
3. **Achievement Tie-ins** - How do achievements reinforce these messages?
4. **Notification Strategy** - When do we nudge vs celebrate vs educate?
5. **Advanced Mode Toggle** - What's the right default? How do we encourage it?
6. **Social/Sharing** - How do these messages appear in shareable content?
7. **NPC Personalities** - Should NPCs have names/personalities?
8. **Sound Design** - Audio cues for wins vs losses vs learning moments?

---

**Document Status:** Draft - Ready for PRD Integration
**Next Steps:** Add core messaging section to PRD, schedule party-mode discussion
