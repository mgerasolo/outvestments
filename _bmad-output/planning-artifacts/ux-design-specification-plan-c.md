---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - ux-design-specification.md
status: complete
---

# UX Design Specification: Plan C

## The Conservative Visual Alternative

*Same shooting range soul. Different suit.*

---

## Overview

**What Plan C IS:**
- A visual redesign with a cleaner, more traditional fintech aesthetic
- Light mode primary, professional navigation, subtle animations
- Standard UI patterns that feel familiar and trustworthy

**What Plan C is NOT:**
- A terminology change (we KEEP Target, Aim, Shot, Pull the Trigger)
- A feature reduction (all gamification mechanics remain)
- A personality removal (shooting range metaphor stays strong)

> *Picture this: Plans A/B are the tactical FPS (Call of Duty, neon sights, screen shake). Plan C is the precision rifle range (clean lines, focused, professional... but you're still absolutely pulling a trigger).*

---

## C1. Design Philosophy

### The Core Distinction

| Aspect | Plans A/B | Plan C |
|--------|-----------|--------|
| **Visual Aesthetic** | FPS game + sports scoreboard | Modern fintech + investment tool |
| **Color Mode** | Dark first (stadium lights) | Light first (clean professional) |
| **Typography** | LED/dot-matrix inspired | Modern sans-serif (Inter, SF Pro) |
| **Animations** | Heavy, celebratory, dramatic | Subtle, smooth, purposeful |
| **Error Handling** | Ironic Windows 95 modals | Standard professional patterns |
| **Navigation** | Floating orb, icon fly-outs | Standard left sidebar |
| **Layout** | Scoreboard columns, leaderboards | Cards, clean data tables |

### What Stays the Same

| Element | Shared Across All Plans |
|---------|------------------------|
| **Terminology** | Target, Aim, Shot, Pull the Trigger, Shot Fired, Shot Landed |
| **Core Flow** | "Set your eyes on the target" -> "Take aim" -> "Pull the trigger" |
| **NPC Opponents** | Always beating "the market" (S&P, NASDAQ, etc.) |
| **PPD Metric** | Performance Per Day scoring |
| **Pace Tracking** | Trajectory toward your target |
| **Gamification** | Streaks, achievements, head-to-head comparisons |

### Plan C Core Principles

| Principle | Description |
|-----------|-------------|
| **Clean over clever** | Information hierarchy first, personality in content not chrome |
| **Professional polish** | Could sit next to your Schwab app without cognitive dissonance |
| **Light mode primary** | White/light gray backgrounds, dark mode as secondary option |
| **Familiar patterns** | Standard fintech conventions users already know |
| **Shooting metaphor in words** | The language is the game, the UI is the tool |

---

## C2. Terminology (UNCHANGED)

Plan C uses **identical terminology** to Plans A/B:

### Core Hierarchy

| Term | Definition |
|------|------------|
| **Target** | Your investment thesis / prediction |
| **Aim** | A specific stock + price target + date |
| **Shot** | The actual trade order |
| **Trigger** | Market or limit order execution |

### Action Language

| Action | Copy |
|--------|------|
| Start new target | "Set your eyes on the target" |
| Add aim to target | "Take aim" |
| Configure shot | "Set up your shot" |
| Execute order | "Pull the trigger" |
| Order confirmed | "Shot fired" |
| Position closed | "Shot landed" |

### Opponent Language

| Element | Copy |
|---------|------|
| Benchmark | "NPC Opponent" |
| You vs S&P 500 | "Your shot vs the NPC" |
| Outperformance | "You're beating the NPC by +6.5%" |
| Underperformance | "The NPC is ahead by -2.1%" |

---

## C3. Navigation

### Desktop: Clean Left Sidebar

```
+--------------------------------------------------------------------------------+
|  +---------------+  +-------------------------------------------------------+  |
|  |               |  |                                                       |  |
|  |  OUTVESTMENTS |  |                                                       |  |
|  |  [Crosshair]  |  |                                                       |  |
|  |               |  |                                                       |  |
|  |  -------------+  |                                                       |  |
|  |               |  |                                                       |  |
|  |  @ Dashboard  |  |                    CONTENT AREA                       |  |
|  |               |  |                                                       |  |
|  |  + Targets    |  |                                                       |  |
|  |               |  |                                                       |  |
|  |  # Shots      |  |                                                       |  |
|  |               |  |                                                       |  |
|  |  = History    |  |                                                       |  |
|  |               |  |                                                       |  |
|  |               |  |                                                       |  |
|  |               |  |                                                       |  |
|  |  -------------+  |                                                       |  |
|  |               |  |                                                       |  |
|  |  * Settings   |  |                                                       |  |
|  |               |  |                                                       |  |
|  |  o Profile    |  |                                                       |  |
|  |               |  |                                                       |  |
|  +---------------+  +-------------------------------------------------------+  |
+--------------------------------------------------------------------------------+
```

### Sidebar Details

- **Logo**: Outvestments with subtle crosshair icon
- **Navigation**: Text labels with small icons, highlighted on active
- **Sections**: Dashboard, Targets, Shots, History, Settings, Profile
- **Behavior**: Always visible (no collapse), subtle hover states

### Mobile: Bottom Tab Navigation

```
+---------------------------------------+
|                                       |
|                                       |
|              CONTENT AREA             |
|                                       |
|                                       |
+---------------------------------------+
|  @      +      #      =      o       |
| Home  Targets Shots History  You     |
+---------------------------------------+
```

---

## C4. Dashboard Layout

### Plan C Dashboard

```
+--------------------------------------------------------------------------------+
|                                                                                |
|  Good morning, Matt                                            Dec 27, 2025   |
|                                                                                |
+--------------------------------------------------------------------------------+
|                                                                                |
|  YOUR SHOOTING RANGE                                                           |
|  -------------------------------------------------------------------------    |
|                                                                                |
|  +--------------------+ +--------------------+ +--------------------+          |
|  |                    | |                    | |                    |          |
|  |   Total Value      | |   Today's P&L      | |   vs NPC (S&P)     |          |
|  |                    | |                    | |                    |          |
|  |   $97,420.00       | |   +$1,240.00       | |   +4.2%            |          |
|  |                    | |   +1.29%           | |   You're winning   |          |
|  |                    | |                    | |                    |          |
|  +--------------------+ +--------------------+ +--------------------+          |
|                                                                                |
+--------------------------------------------------------------------------------+
|                                                                                |
|  PERFORMANCE                                      [1W] [1M] [3M] [YTD] [ALL]  |
|  -------------------------------------------------------------------------    |
|                                                                                |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  |     $100k |                                                   .----   |   |
|  |           |                                             .----'        |   |
|  |      $95k |                                       .----'              |   |
|  |           |                              .--------'                   |   |
|  |      $90k |                   .----------'                            |   |
|  |           |         .---------'                                       |   |
|  |      $85k |---------'                                                 |   |
|  |           |                                                            |   |
|  |           +----------------------------------------------------------  |   |
|  |            Nov 1    Nov 15    Dec 1     Dec 15    Dec 27               |   |
|  |                                                                        |   |
|  |    -- Your Portfolio    -- NPC (S&P 500)                              |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
+--------------------------------------------------------------------------------+
|                                                                                |
|  ACTIVE TARGETS                                      [+ Set New Target]       |
|  -------------------------------------------------------------------------    |
|                                                                                |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  |  AI Infrastructure Boom                                                |   |
|  |  Target set Dec 15  *  3 aims  *  $5,000 deployed                     |   |
|  |                                                                        |   |
|  |  +------------------------------------------------------------------+  |   |
|  |  |                                                                  |  |   |
|  |  |  Your Return          NPC (S&P)              Alpha               |  |   |
|  |  |  +24.8%               +17.8%                 +7.0%               |  |   |
|  |  |  +$1,240              +$890                  +$350               |  |   |
|  |  |                                                                  |  |   |
|  |  +------------------------------------------------------------------+  |   |
|  |                                                                        |   |
|  |  Pace: [================------]  67% toward target                    |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
+--------------------------------------------------------------------------------+
|                                                                                |
|  ACTIVE SHOTS                                              [View All >]       |
|  -------------------------------------------------------------------------    |
|                                                                                |
|  +----------------------------------------------------------------------+     |
|  |  Ticker  |  Return   |  vs NPC   |  PPD     |  Pace                  |     |
|  |----------|-----------|-----------|----------|------------------------|     |
|  |  NVDA    |  +15.2%   |  +6.5%    |  0.42%   |  * On track            |     |
|  |  AMD     |  +8.4%    |  -3.7%    |  0.19%   |  * Behind pace         |     |
|  |  MSFT    |  +12.1%   |  +3.4%    |  0.28%   |  * On track            |     |
|  |  GOOGL   |  +6.8%    |  -2.1%    |  0.15%   |  * Behind pace         |     |
|  +----------------------------------------------------------------------+     |
|                                                                                |
+--------------------------------------------------------------------------------+
```

### Key Visual Differences from Plans A/B

| Element | Plans A/B | Plan C |
|---------|-----------|--------|
| Header | LED scoreboard | Simple greeting + date |
| KPI cards | Glowing tiles, stadium dark | Clean white cards with borders |
| Chart | Candlestick with trajectory overlay | Simple line chart with dual series |
| Target cards | Scoreboard-style with LED fonts | Standard card with clean typography |
| Shots table | Leaderboard columns | Standard data table |
| Pace indicator | Emoji endpoints, dramatic colors | Simple progress bar with % |
| Status dots | Animated pulsing indicators | Simple colored dots |

---

## C5. Target Creation Flow

### Screen 1: Set Your Target

```
+--------------------------------------------------------------------------------+
|  < Back                                                                        |
+--------------------------------------------------------------------------------+
|                                                                                |
|                         Set Your Eyes on the Target                            |
|                                                                                |
|               What's your prediction? Describe your target.                    |
|                                                                                |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  |  Target Name                                                           |   |
|  |  +------------------------------------------------------------------+  |   |
|  |  | AI infrastructure will outperform in 2025                       |  |   |
|  |  +------------------------------------------------------------------+  |   |
|  |                                                                        |   |
|  |  Notes (optional)                                                      |   |
|  |  +------------------------------------------------------------------+  |   |
|  |  | Data center buildout and AI chip demand will drive              |  |   |
|  |  | infrastructure companies to outperform the broader market...    |  |   |
|  |  +------------------------------------------------------------------+  |   |
|  |                                                                        |   |
|  |  Category                                                              |   |
|  |  o Stock-specific    o Sector    * Theme    o Market    o Event       |   |
|  |                                                                        |   |
|  |  Catalyst                                                              |   |
|  |  o Macro    * Industry    o Company    o Other                        |   |
|  |                                                                        |   |
|  |  Tags                                                                  |   |
|  |  [ AI ] [ Infrastructure ] [ + Add tag ]                              |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|                              [ Lock In Target ]                                |
|                                                                                |
+--------------------------------------------------------------------------------+
```

### Screen 2: Take Aim

```
+--------------------------------------------------------------------------------+
|  < Back to Target                                                              |
+--------------------------------------------------------------------------------+
|                                                                                |
|                                Take Aim                                        |
|                                                                                |
|            Target: AI infrastructure will outperform in 2025                   |
|                                                                                |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  |  Search for a ticker                                                   |   |
|  |  +------------------------------------------------------------------+  |   |
|  |  | Search stocks...                                                 |  |   |
|  |  +------------------------------------------------------------------+  |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|  YOUR AIMS                                                                     |
|  -------------------------------------------------------------------------    |
|                                                                                |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  |  +------+  +------+  +-----------+  +-----------------+  +---+        |   |
|  |  | NVDA |  |  ^   |  |   +20%    |  | by Dec 31, 2025 |  | x |        |   |
|  |  +------+  +------+  +-----------+  +-----------------+  +---+        |   |
|  |                                                                        |   |
|  |  +------+  +------+  +-----------+  +-----------------+  +---+        |   |
|  |  | MSFT |  |  ^   |  |   +15%    |  | by Dec 31, 2025 |  | x |        |   |
|  |  +------+  +------+  +-----------+  +-----------------+  +---+        |   |
|  |                                                                        |   |
|  |  +------+  +------+  +-----------+  +-----------------+  +---+        |   |
|  |  | GOOGL|  |  ^   |  |   +20%    |  | by Dec 31, 2025 |  | x |        |   |
|  |  +------+  +------+  +-----------+  +-----------------+  +---+        |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|                            [ + Add Another Aim ]                               |
|                                                                                |
|                              [ Lock In Aims ]                                  |
|                                                                                |
+--------------------------------------------------------------------------------+
```

---

## C6. Shot Execution Flow

### Pull the Trigger

```
+--------------------------------------------------------------------------------+
|  < Back                                                                        |
+--------------------------------------------------------------------------------+
|                                                                                |
|                            Pull the Trigger                                    |
|                                                                                |
|            Target: AI Infrastructure Boom 2025                                 |
|            Aim: NVDA +20% by Dec 31, 2025                                      |
|                                                                                |
|  +------------------------------------------------------------------------+   |
|  |                                                                        |   |
|  |  NVDA - NVIDIA Corporation                                             |   |
|  |  Current Price: $134.52                                                |   |
|  |                                                                        |   |
|  |  -----------------------------------------------------------------    |   |
|  |                                                                        |   |
|  |  Trigger Type                                                          |   |
|  |  +-----------------+  +-----------------+                              |   |
|  |  |   * Market      |  |     o Limit     |                              |   |
|  |  |  Fire now       |  |  Fire at price  |                              |   |
|  |  +-----------------+  +-----------------+                              |   |
|  |                                                                        |   |
|  |  Amount                                                                |   |
|  |  +-------------------------------------------+                         |   |
|  |  | $ 1,000                                   |                         |   |
|  |  +-------------------------------------------+                         |   |
|  |  ~ 7 shares at current price                                           |   |
|  |                                                                        |   |
|  |  -----------------------------------------------------------------    |   |
|  |                                                                        |   |
|  |  Shot Summary                                                          |   |
|  |                                                                        |   |
|  |  Action:          Buy                                                  |   |
|  |  Ticker:          NVDA                                                 |   |
|  |  Amount:          $1,000                                               |   |
|  |  Shares:          ~7                                                   |   |
|  |  Trigger:         Market                                               |   |
|  |                                                                        |   |
|  |  Buying Power:    $45,000.00                                           |   |
|  |                                                                        |   |
|  +------------------------------------------------------------------------+   |
|                                                                                |
|                           [ Pull the Trigger ]                                 |
|                                                                                |
+--------------------------------------------------------------------------------+
```

---

## C7. NPC Comparison

### Comparison Card (Clean Side-by-Side)

```
+------------------------------------------------------------------------+
|                                                                        |
|  YOU vs NPC                                                            |
|                                                                        |
|  +---------------------------+     +---------------------------+       |
|  |                           |     |                           |       |
|  |  Your Shot                |     |  NPC (S&P 500)            |       |
|  |                           |     |                           |       |
|  |  +15.2%                   |     |  +8.7%                    |       |
|  |  +$1,520                  |     |  +$870                    |       |
|  |  0.42% PPD                |     |  0.24% PPD                |       |
|  |                           |     |  (if you'd bought SPY)    |       |
|  +---------------------------+     +---------------------------+       |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |                                                                  |  |
|  |  Result:  You're beating the NPC by +6.5%                       |  |
|  |  Alpha:   +$650 more than just buying the market                |  |
|  |                                                                  |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
|  Compare against: [ S&P 500 v ]                                        |
|                                                                        |
+------------------------------------------------------------------------+
```

### When NPC is Winning

```
+------------------------------------------------------------------------+
|                                                                        |
|  YOU vs NPC                                                            |
|                                                                        |
|  +---------------------------+     +---------------------------+       |
|  |                           |     |                           |       |
|  |  Your Shot                |     |  NPC (S&P 500)            |       |
|  |                           |     |                           |       |
|  |  +3.2%                    |     |  +11.4%                   |       |
|  |  +$320                    |     |  +$1,140                  |       |
|  |                           |     |                           |       |
|  +---------------------------+     +---------------------------+       |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |                                                                  |  |
|  |  Result:  The NPC is ahead by -8.2%                             |  |
|  |  Cost:    -$820 compared to just buying the market              |  |
|  |                                                                  |  |
|  |  Your shot made money, but not as much as the NPC would have.  |  |
|  |  Revisit your aim and adjust if needed.                         |  |
|  |                                                                  |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
+------------------------------------------------------------------------+
```

---

## C8. Toast Notifications

### Standard Toast Design

```
                                   +--------------------------------+
                                   |  [Check] Shot fired            |
                                   |                                |
                                   |  NVDA x 7 shares at $134.52    |
                                   |                                |
                                   |  [View Shot]        [Dismiss]  |
                                   +--------------------------------+
```

### Toast Types

| Type | Style | Icon |
|------|-------|------|
| Success | Green left border | Checkmark |
| Warning | Amber left border | Warning triangle |
| Error | Red left border | X mark |
| Info | Blue left border | Info circle |

### Example Toasts

**Shot Fired:**
```
+------------------------------------------------+
| [Check]  Shot fired                             |
|          NVDA x 7 shares at $134.52             |
+------------------------------------------------+
```

**Shot Landed (Target Hit):**
```
+------------------------------------------------+
| [Target] Shot landed!                           |
|          NVDA hit your $200 aim                 |
|          +49.2% return over 247 days            |
|          [View Details]                         |
+------------------------------------------------+
```

**Milestone Achievement:**
```
+------------------------------------------------+
| [Trophy] New achievement unlocked!              |
|          "Sharpshooter" - 5 shots landed        |
|          in a row                               |
+------------------------------------------------+
```

---

## C9. Error States

### Standard Error Modal

```
+------------------------------------------------------------------+
|                                                                  |
|  [Warning] Shot blocked                                          |
|                                                                  |
|  ---------------------------------------------------------------  |
|                                                                  |
|  Insufficient buying power                                       |
|                                                                  |
|  You have $1,420 available.                                      |
|  This shot requires $10,000.                                     |
|                                                                  |
|  What you can do:                                                |
|  - Reduce shot size to $1,420 or less                           |
|  - Close an existing shot to free up capital                    |
|                                                                  |
|                       [ OK ]     [ Help ]                        |
|                                                                  |
+------------------------------------------------------------------+
```

### Inline Validation

```
+------------------------------------------------------------------+
|                                                                  |
|  Amount                                                          |
|  +------------------------------------------------------------+ |
|  | $ 10,000                                                   | |
|  +------------------------------------------------------------+ |
|  [Warning] Exceeds available buying power ($1,420)             |
|                                                                  |
+------------------------------------------------------------------+
```

---

## C10. Empty States

### No Targets Yet

```
+--------------------------------------------------------------------------------+
|                                                                                |
|                              [Target Icon]                                     |
|                                                                                |
|                         Set your first target                                  |
|                                                                                |
|         Every great shot starts with a clear target. What's your              |
|         prediction about the market?                                           |
|                                                                                |
|                      [ Set Your Eyes on a Target ]                             |
|                                                                                |
|         ------------------------------------------------------------------     |
|                                                                                |
|         Example targets:                                                       |
|         - "Tech will outperform in Q1 2025"                                   |
|         - "AI infrastructure demand accelerates"                              |
|         - "Interest rates will drive bank stocks"                             |
|                                                                                |
+--------------------------------------------------------------------------------+
```

---

## C11. Animation Direction

### Subtle, Professional Motion

| Transition | Plan C Effect |
|------------|---------------|
| Page load | Fade in (200ms), subtle slide up |
| Data refresh | Number fade/morph to new value |
| Tab switch | Cross-fade (150ms) |
| Card interactions | Subtle shadow lift on hover |
| Success states | Checkmark appear + green flash |
| Loading | Skeleton screens or subtle spinner |
| Shot fired | Brief checkmark animation, toast appears |

### Milestone Moments (Optional Extras)

For key achievements, Plan C can optionally include slightly more celebration:
- **Shot landed on target**: Confetti optional (user preference)
- **Beat NPC for the month**: Subtle trophy animation
- **10-shot streak**: Achievement badge slides in

These are toned down from Plans A/B but still present for gamification.

### What NOT to Include

- Screen shake
- Slam/drop animations
- Particle effects beyond confetti
- Sound effects by default (optional in settings)
- Slow-motion reveals
- FPS gun reload animations

---

## C12. Color Palette

### Light Mode (Primary)

| Element | Color |
|---------|-------|
| Background | #FFFFFF |
| Card background | #F9FAFB |
| Text primary | #111827 |
| Text secondary | #6B7280 |
| Border | #E5E7EB |
| Accent (primary) | #3B82F6 (blue) |
| Success / Winning | #10B981 (green) |
| Warning | #F59E0B (amber) |
| Error / Losing | #EF4444 (red) |

### Dark Mode (Secondary)

| Element | Color |
|---------|-------|
| Background | #111827 |
| Card background | #1F2937 |
| Text primary | #F9FAFB |
| Text secondary | #9CA3AF |
| Border | #374151 |
| Accent (primary) | #60A5FA (lighter blue) |

### Colorblind Mode

| Standard | Colorblind |
|----------|------------|
| Green (winning) | Yellow |
| Red (losing) | Purple |

---

## C13. Typography

### Font Stack

```
Primary: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Monospace: 'SF Mono', 'Fira Code', Consolas, monospace (for numbers/prices)
```

### Type Scale

| Use | Size | Weight |
|-----|------|--------|
| Page title | 24px | 600 |
| Section header | 18px | 600 |
| Card title | 16px | 500 |
| Body text | 14px | 400 |
| Caption | 12px | 400 |
| Large numbers | 32px | 700 |

---

## C14. Pace Tracking

### Progress Toward Aim

```
+------------------------------------------------------------------------+
|                                                                        |
|  PACE TOWARD AIM                                                       |
|                                                                        |
|  NVDA -> $200 by Dec 2026                                             |
|                                                                        |
|  Required pace:   4.2% / month                                         |
|  Your pace:       5.1% / month                                         |
|  Status:          [*] On track (+0.9%/mo ahead)                       |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |                                                                  |  |
|  |  [=================================-------]  76% of aim          |  |
|  |                                                                  |  |
|  |  Current: $154.97          Aim: $200.00                         |  |
|  |                                                                  |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
+------------------------------------------------------------------------+
```

### Multiple Aims Summary

```
+------------------------------------------------------------------------+
|                                                                        |
|  AIM PROGRESS                                                          |
|                                                                        |
|  +------------------------------------------------------------------+  |
|  |  Ticker  |  Aim         |  Progress  |  Pace    |  Status        |  |
|  |----------|--------------|------------|----------|----------------|  |
|  |  NVDA    |  $200        |  [====] 76% |  +0.9%   |  * On track   |  |
|  |  AMD     |  $180        |  [===] 52%  |  -1.4%   |  * Behind     |  |
|  |  AVGO    |  $250        |  [=====] 88%|  +2.1%   |  * Ahead      |  |
|  +------------------------------------------------------------------+  |
|                                                                        |
+------------------------------------------------------------------------+
```

---

## C15. Summary: Plan C vs Plans A/B

### At a Glance

| Feature | Plans A/B | Plan C |
|---------|-----------|--------|
| **Terminology** | Target/Aim/Shot/Trigger | Target/Aim/Shot/Trigger (SAME) |
| **Visual aesthetic** | FPS game / sports scoreboard | Modern fintech |
| **Primary mode** | Dark | Light |
| **Animations** | Heavy, dramatic | Subtle, smooth |
| **NPC view** | Street Fighter face-off | Side-by-side cards |
| **Error handling** | Ironic Windows 95 | Standard professional |
| **Navigation** | Floating icon fly-outs | Standard sidebar |
| **Progress indicators** | Pace bar with emoji | Progress bar with % |
| **Notifications** | Achievement/kill-feed style | Standard toasts |
| **Sound effects** | Yes (FPS sounds) | No (optional) |

### Same Core Features

Both plans include:
- Target -> Aim -> Shot hierarchy
- NPC opponent comparison engine
- Pace tracking toward aims
- PPD scoring
- History and track record
- Achievements and streaks
- Onboarding flow
- Settings and profile

---

## C16. Recommendation

### When to Choose Each Plan

| Choose Plans A/B if... | Choose Plan C if... |
|------------------------|---------------------|
| Target audience loves games | Target audience is finance-focused |
| Differentiation is priority | Trust/credibility is priority |
| Users want an experience | Users want a tool |
| Mobile-secondary | Mobile-important |
| Younger demographic | Broader demographic |
| Brand can be playful | Brand needs professionalism |

### Hybrid Approach

Consider: **Plan C base with Plan A/B celebrations**

- Use Plan C for daily interface (navigation, data display, forms)
- Use Plan A/B elements for milestone moments:
  - Shot landed -> celebratory animation + confetti
  - Monthly win streak -> achievement toast with fanfare
  - Beat NPC for the quarter -> special confirmation modal

This gives users a professional tool that occasionally delights when they achieve something.

---

**Document Status:** Complete
**Last Updated:** 2025-12-27
**Next Steps:** Compare all three plans and decide on direction before implementation.
