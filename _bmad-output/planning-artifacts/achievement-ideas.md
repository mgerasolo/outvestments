# Outvestments Achievement System

> 100 achievements across 10 categories for the gamified paper trading platform

## Achievement Categories Overview

| Category | Count | Focus |
|----------|-------|-------|
| First Actions | 12 | Initial user actions and onboarding milestones |
| Milestones | 12 | Volume and longevity achievements |
| Performance | 12 | Alpha generation and NPC opponent victories |
| Streaks | 10 | Consecutive wins and activity patterns |
| Accuracy | 10 | Prediction precision and target hitting |
| Difficulty | 10 | Bold predictions and long-range plays |
| Diversity | 10 | Portfolio breadth and exploration |
| Recovery | 8 | Comebacks and learning from losses |
| Timing | 10 | Entry/exit optimization and trigger mastery |
| Meta/Fun | 6 | Easter eggs and quirky accomplishments |

---

## 1. First Actions (12)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| First Actions | First Blood | Create your first Target (thesis). | `theory.created` where `user.theory_count == 1` |
| First Actions | Take Your Shot | Execute your first Shot. | `shot.created` where `user.shot_count == 1` |
| First Actions | Bullseye Set | Set your first price target on a Theory. | `theory.target_price_set` where `user.target_count == 1` |
| First Actions | Pull the Trigger | Execute your first market order. | `shot.executed` where `order_type == 'market'` AND `user.market_order_count == 1` |
| First Actions | Set Your Trigger | Place your first limit order. | `shot.created` where `order_type == 'limit'` AND `user.limit_order_count == 1` |
| First Actions | Locked and Loaded | Close your first position. | `shot.closed` where `user.closed_shot_count == 1` |
| First Actions | Thesis Defended | Complete a Theory (target date reached). | `theory.expired` where `user.completed_theory_count == 1` |
| First Actions | Bear Mode | Take your first short position. | `shot.created` where `direction == 'sell'` AND `user.short_count == 1` |
| First Actions | Options Unlocked | Execute your first options trade. | `shot.created` where `shot_type == 'option'` AND `user.option_count == 1` |
| First Actions | Call the Bluff | Buy your first call option. | `shot.created` where `option_type == 'call'` AND `user.call_count == 1` |
| First Actions | Put it Down | Buy your first put option. | `shot.created` where `option_type == 'put'` AND `user.put_count == 1` |
| First Actions | Tag Team | Add your first custom tag to a Theory. | `tag.applied` where `user.tag_count == 1` |

---

## 2. Milestones (12)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Milestones | Ten Shooter | Execute 10 Shots. | `shot.created` where `user.shot_count == 10` |
| Milestones | Half Century | Execute 50 Shots. | `shot.created` where `user.shot_count == 50` |
| Milestones | Century Club | Execute 100 Shots. | `shot.created` where `user.shot_count == 100` |
| Milestones | Thesis Master | Create 25 Theories. | `theory.created` where `user.theory_count == 25` |
| Milestones | Portfolio Architect | Have 10+ active Shots simultaneously. | `shot.created` where `user.active_shot_count >= 10` |
| Milestones | Month One | Stay active for 30 days. | `user.login` where `days_since_signup >= 30` |
| Milestones | Quarterly Report | Stay active for 90 days. | `user.login` where `days_since_signup >= 90` |
| Milestones | Annual Review | Stay active for 365 days. | `user.login` where `days_since_signup >= 365` |
| Milestones | Closure Expert | Close 50 positions. | `shot.closed` where `user.closed_shot_count == 50` |
| Milestones | Theory Veteran | Complete 10 Theories (reach target date). | `theory.expired` where `user.completed_theory_count == 10` |
| Milestones | Grand Slam | Close positions totaling $100,000 in paper value. | `shot.closed` where `user.total_closed_value >= 100000` |
| Milestones | Million Dollar Trader | Close positions totaling $1,000,000 in paper value. | `shot.closed` where `user.total_closed_value >= 1000000` |

---

## 3. Performance (12)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Performance | Market Beater | Beat the S&P 500 NPC opponent on a closed Shot. | `shot.closed` where `alpha_vs_spy > 0` |
| Performance | Tech Dominator | Beat the NASDAQ NPC opponent on a closed Shot. | `shot.closed` where `alpha_vs_qqq > 0` |
| Performance | Outvest the Rest | Beat all NPC opponents on a single Shot. | `shot.closed` where `alpha_vs_all_npcs > 0` |
| Performance | Alpha Hunter | Generate 10%+ alpha vs S&P 500 NPC on a single Shot. | `shot.closed` where `alpha_vs_spy >= 10` |
| Performance | Alpha Predator | Generate 25%+ alpha vs S&P 500 NPC on a single Shot. | `shot.closed` where `alpha_vs_spy >= 25` |
| Performance | Double Trouble | Achieve 100%+ return on a single Shot. | `shot.closed` where `return_percent >= 100` |
| Performance | Ten Bagger | Achieve 1000%+ return on a single Shot. | `shot.closed` where `return_percent >= 1000` |
| Performance | Consistent Winner | Beat S&P 500 NPC on 10 consecutive closed Shots. | `shot.closed` where `consecutive_spy_beats == 10` |
| Performance | PPD Master | Achieve PPD score of 1%+ on a closed Shot. | `shot.closed` where `ppd >= 1.0` |
| Performance | Speed Demon | Achieve PPD score of 5%+ on a closed Shot (minimum 5 days held). | `shot.closed` where `ppd >= 5.0` AND `days_held >= 5` |
| Performance | Grade A Student | Achieve A grade (100+ performance score) on 5 closed Shots. | `shot.closed` where `user.grade_a_count == 5` |
| Performance | Perfect Score | Achieve composite score of 200+ on a closed Shot. | `shot.closed` where `composite_score >= 200` |

---

## 4. Streaks (10)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Streaks | Hot Streak | Win 3 Shots in a row vs any NPC opponent. | `shot.closed` where `user.current_win_streak == 3` |
| Streaks | On Fire | Win 5 Shots in a row vs any NPC opponent. | `shot.closed` where `user.current_win_streak == 5` |
| Streaks | Untouchable | Win 10 Shots in a row vs any NPC opponent. | `shot.closed` where `user.current_win_streak == 10` |
| Streaks | Legendary Streak | Win 20 Shots in a row vs any NPC opponent. | `shot.closed` where `user.current_win_streak == 20` |
| Streaks | Green Week | 5 consecutive profitable trading days. | `daily_snapshot.created` where `user.consecutive_green_days == 5` |
| Streaks | Green Month | 20 consecutive profitable trading days. | `daily_snapshot.created` where `user.consecutive_green_days == 20` |
| Streaks | Daily Devotion | Log in 7 days in a row. | `user.login` where `user.consecutive_login_days == 7` |
| Streaks | Monthly Regular | Log in 30 days in a row. | `user.login` where `user.consecutive_login_days == 30` |
| Streaks | Theory Streak | Complete 3 Theories in a row that hit their target. | `theory.expired` where `user.consecutive_theory_hits == 3` |
| Streaks | Sector Streak | Win 5 consecutive Shots in the same sector. | `shot.closed` where `user.sector_win_streak[sector] == 5` |

---

## 5. Accuracy (10)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Accuracy | Bullseye | Hit your target price within 1%. | `shot.closed` where `abs(actual_price - target_price) / target_price <= 0.01` |
| Accuracy | Dead Center | Hit your target price within 0.1%. | `shot.closed` where `abs(actual_price - target_price) / target_price <= 0.001` |
| Accuracy | Sniper | Hit your target price exactly (to the cent). | `shot.closed` where `actual_price == target_price` |
| Accuracy | Sharp Shooter | Achieve 90%+ accuracy score on 5 Shots. | `shot.closed` where `user.high_accuracy_count == 5` |
| Accuracy | Prediction Pro | Achieve 100+ accuracy score (hit or exceed target). | `shot.closed` where `accuracy_score >= 100` |
| Accuracy | Beyond Target | Exceed your target by 50%+. | `shot.closed` where `accuracy_score >= 150` |
| Accuracy | Double Vision | Exceed your target by 100%+ (doubled your prediction). | `shot.closed` where `accuracy_score >= 200` |
| Accuracy | Reach Goal Reached | Hit your reach target (not just realistic). | `shot.closed` where `actual_price >= theory.target_price_reach` |
| Accuracy | Date Perfect | Close within 1 day of your predicted target date. | `shot.closed` where `abs(close_date - target_date) <= 1` |
| Accuracy | Catalyst Confirmed | Theory's catalyst event happens and price moves as predicted. | `theory.catalyst_confirmed` where `price_moved_correctly == true` |

---

## 6. Difficulty (10)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Difficulty | Long Range | Successfully hit a 30-50% target (2.0x difficulty). | `shot.closed` where `target_return >= 30` AND `target_return < 50` AND `accuracy_score >= 100` |
| Difficulty | Extreme Range | Successfully hit a 50%+ target (2.5x difficulty). | `shot.closed` where `target_return >= 50` AND `accuracy_score >= 100` |
| Difficulty | Moonshot | Successfully hit a 100%+ target. | `shot.closed` where `target_return >= 100` AND `accuracy_score >= 100` |
| Difficulty | Year Long Play | Hold a winning position for 365+ days. | `shot.closed` where `days_held >= 365` AND `return_percent > 0` |
| Difficulty | Marathon Runner | Hold a winning position for 180+ days. | `shot.closed` where `days_held >= 180` AND `return_percent > 0` |
| Difficulty | Bold Thesis | Create a Theory with 40%+ target move. | `theory.created` where `target_move_percent >= 40` |
| Difficulty | Contrarian | Profit on a short position in a bull market month. | `shot.closed` where `direction == 'sell'` AND `return_percent > 0` AND `market_trend == 'bull'` |
| Difficulty | Options Expert | Win with an out-of-the-money option. | `shot.closed` where `shot_type == 'option'` AND `was_otm_at_entry == true` AND `return_percent > 0` |
| Difficulty | Leap of Faith | Successfully hit target on a LEAPS option (1+ year expiry). | `shot.closed` where `option_expiry_days >= 365` AND `return_percent > 0` |
| Difficulty | Double or Nothing | Win on a Shot with 2.5x difficulty multiplier. | `shot.closed` where `difficulty_multiplier >= 2.5` AND `accuracy_score >= 100` |

---

## 7. Diversity (10)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Diversity | Sector Explorer | Trade in 5 different sectors. | `shot.created` where `count(distinct user.sectors_traded) == 5` |
| Diversity | Sector Master | Trade in 10 different sectors. | `shot.created` where `count(distinct user.sectors_traded) == 10` |
| Diversity | Portfolio Rainbow | Hold active Shots in 5+ different tickers. | `shot.created` where `count(distinct user.active_tickers) >= 5` |
| Diversity | Ticker Collector | Trade 25 different tickers. | `shot.created` where `count(distinct user.all_tickers) == 25` |
| Diversity | Ticker Veteran | Trade 50 different tickers. | `shot.created` where `count(distinct user.all_tickers) == 50` |
| Diversity | Multi-Catalyst | Create Theories in 5+ different catalyst categories. | `theory.created` where `count(distinct user.catalyst_categories) >= 5` |
| Diversity | Tag Master | Use 10+ unique tags across your Theories. | `tag.applied` where `count(distinct user.tags) >= 10` |
| Diversity | Long and Short | Have both long and short positions active simultaneously. | `shot.created` where `user.has_active_long` AND `user.has_active_short` |
| Diversity | Full Spectrum | Trade stocks, calls, and puts in the same month. | `monthly_summary` where `has_stock` AND `has_call` AND `has_put` |
| Diversity | Exchange Hopper | Trade on 3+ different exchanges (NYSE, NASDAQ, etc.). | `shot.created` where `count(distinct user.exchanges) >= 3` |

---

## 8. Recovery (8)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Recovery | Bounce Back | Win a Shot immediately after a losing Shot. | `shot.closed` where `user.previous_shot_lost` AND `return_percent > 0` |
| Recovery | From the Ashes | Win 3 Shots in a row after a 3+ loss streak. | `shot.closed` where `user.previous_loss_streak >= 3` AND `user.current_win_streak == 3` |
| Recovery | Turnaround | A Shot that was -20% recovers to profitability. | `shot.closed` where `shot.historical_low <= -20` AND `return_percent > 0` |
| Recovery | Deep Recovery | A Shot that was -50% recovers to profitability. | `shot.closed` where `shot.historical_low <= -50` AND `return_percent > 0` |
| Recovery | Theory Redemption | Hit target on a Theory after missing on the first Shot. | `theory.expired` where `first_shot_lost` AND `hit_target == true` |
| Recovery | Monthly Rebound | Finish a month positive after starting it -10% or worse. | `monthly_summary` where `month_low <= -10` AND `month_return > 0` |
| Recovery | Learning Curve | After 5 losing Shots, win the next 5 in a row. | `shot.closed` where `user.previous_losses >= 5` AND `user.current_win_streak == 5` |
| Recovery | Underdog Victory | Beat S&P 500 NPC on a Shot that was -30% at one point. | `shot.closed` where `shot.historical_low <= -30` AND `alpha_vs_spy > 0` |

---

## 9. Timing (10)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Timing | Perfect Entry | Enter within 5% of the position's eventual low. | `shot.closed` where `(entry_price - position_low) / position_low <= 0.05` |
| Timing | Perfect Exit | Close within 5% of the position's eventual high. | `shot.closed` where `(position_high - exit_price) / position_high <= 0.05` |
| Timing | Full Runway | Capture 95%+ of available runway on a Theory. | `shot.closed` where `runway_captured >= 95` |
| Timing | Early Bird | Enter a Theory within 1 hour of creating it. | `shot.created` where `time_since_theory_created <= 3600` |
| Timing | Trigger Happy | Have a limit order fill within 1 hour of setting it. | `shot.armed` where `time_to_fill <= 3600` |
| Timing | Patient Hunter | Have a limit order fill after waiting 7+ days. | `shot.armed` where `time_to_fill >= 604800` |
| Timing | Quick Draw | Open and close a profitable Shot in the same day. | `shot.closed` where `days_held == 0` AND `return_percent > 0` |
| Timing | Trend Rider | Enter within 1 day of a major trend reversal. | `shot.created` where `days_from_reversal <= 1` AND `return_percent > 10` |
| Timing | Catalyst Timer | Enter before catalyst event and exit within 3 days after. | `shot.closed` where `entered_before_catalyst` AND `exited_within_3_days` |
| Timing | Peak Performance | Close at the highest price the asset reaches during your hold. | `shot.closed` where `exit_price == position_high` |

---

## 10. Meta/Fun (6)

| Category | Name | Description | Backend Event |
|----------|------|-------------|---------------|
| Meta/Fun | Lucky 7 | Close a Shot with exactly 7.77% return. | `shot.closed` where `abs(return_percent - 7.77) < 0.01` |
| Meta/Fun | Palindrome Gains | Close with a palindrome return (e.g., 12.21%, 33.33%). | `shot.closed` where `is_palindrome(return_percent)` |
| Meta/Fun | Holiday Trader | Execute a Shot on a major holiday. | `shot.created` where `date in holidays` |
| Meta/Fun | Night Owl | Create a Theory between midnight and 4am local time. | `theory.created` where `local_hour >= 0` AND `local_hour < 4` |
| Meta/Fun | Power Hour | Execute 5 Shots within a single hour. | `shot.created` where `count(shots_this_hour) == 5` |
| Meta/Fun | Steady Eddie | Close 10 consecutive Shots with returns between 5-15%. | `shot.closed` where `user.consecutive_moderate_wins == 10` |

---

## Implementation Notes

### Backend Event Structure

Each achievement should track:
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  trigger_event: string;
  trigger_condition: object;
  created_at: timestamp;
}

interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: timestamp;
  trigger_shot_id?: string;  // The shot that triggered it, if applicable
  trigger_theory_id?: string;  // The theory that triggered it, if applicable
}
```

### Event Processing

1. After each relevant event (`shot.created`, `shot.closed`, `theory.created`, etc.), check applicable achievements
2. Use an achievement processor queue to avoid blocking main operations
3. Cache user achievement state for fast lookups
4. Emit notification when achievement unlocked

### Rarity Distribution

| Rarity | Criteria | Approx % |
|--------|----------|----------|
| Common | First actions, basic milestones | 20% |
| Uncommon | 10+ occurrences, moderate difficulty | 25% |
| Rare | 50+ occurrences, higher skill | 25% |
| Epic | 100+ occurrences or high skill | 20% |
| Legendary | Exceptional feats, long streaks | 10% |

### NPC Opponent Reference

| NPC | Benchmark | Use Case |
|-----|-----------|----------|
| S&P 500 | SPY ETF | Default comparison, "the market" |
| NASDAQ | QQQ ETF | Tech-heavy comparison |
| 10%/yr | Fixed rate | Conservative baseline |
| 20%/yr | Fixed rate | Aggressive baseline |
| Sector ETF | XLF, XLE, etc. | Sector-specific comparison |

---

## Summary Statistics

- **Total Achievements:** 100
- **Categories:** 10
- **Common:** ~20 achievements
- **Legendary:** ~10 achievements

Most achievements are designed to be unlockable through normal usage, while legendary achievements require exceptional performance or dedication.
