---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - product-brief-outvestments-2025-12-26.md
  - prd-outvestments-2025-12-27.md
  - architecture.md
status: complete
---

# UX Design Specification: Outvestments

**Author:** Matt
**Date:** 2025-12-27

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Game feel, not SaaS** | Video game menus, not enterprise dashboards |
| **Scoreboard-first** | Performance metrics are the hero, not portfolio value |
| **Heavy animations** | Tiles slide, drop, fade - like transitioning through game menus |
| **Sports scoreboard aesthetic** | LED/dot-matrix style fonts, stadium dark backgrounds |
| **Desktop-first, mobile-responsive** | Design for desktop, adapt for iPhone (90% of mobile) |

### Visual Inspiration

- Sports scoreboards (LED fonts, innings-style layouts)
- Video game HUDs (Destiny 2 orbit, FIFA menus)
- Habitica-style gamification (achievements, progress bars)
- Fantasy sports apps (cards, big numbers, leaderboards)

### What to Avoid

- Traditional finance/trading platform look
- SaaS horizontal nav tabs
- Minimal/sterile enterprise feel
- Static, lifeless interfaces

---

## 2. Information Architecture

### Core Hierarchy (Three Levels)

| Level | Term | Description | Example |
|-------|------|-------------|---------|
| **1** | **Target** | The thesis/prediction | "AI infrastructure will boom in 2025" |
| **2** | **Aim** | Specific asset + price target + date | "NVDA up 20% by Dec 2026" |
| **3** | **Shot** | The order/position | "$1,000 buy at market" |

**Trigger** = The execution event (market order fires immediately, limit order fires when price hits)

### Terminology Flow

```
"Set your eyes on the target" → Define thesis (Target created)
"Take aim"                    → Pick asset + price prediction (Aim set)
"Set up your shot"            → Configure order details (Shot ready)
"Pull the trigger"            → Execute (Shot fired)
```

### Target Flexibility

Targets are NOT stock-specific. A Target can be:
- Stock-specific: "TSLA to $400"
- Event-driven: "iPhone launch will boost Apple"
- Sector-wide: "EV sector will boom in Q1"
- Market-wide: "Bear market coming in 2025"
- Theme-based: "Mag 7 will underperform"

Future enhancement: Sub-targets (e.g., "Apple suppliers" under "iPhone launch")

---

## 3. Navigation

### Desktop: Floating Icon Sidebar with Fly-Outs

```
COLLAPSED STATE (Icons floating on left edge):

    [Scoreboard icon]  Dashboard
    [Eye icon]         Targets
    [Arrow icon]       Shots
    [Chart icon]       History

    [Gear icon]        Settings
    [Avatar]           Profile


HOVER/SELECT - Fly-out menu appears:

    [Eye] ──────┬─────────────────────┐
                │  All Targets        │
                │  + New Target       │
                │  Active Targets     │
                │  Completed          │
                └─────────────────────┘
```

### Fly-Out Behavior

- Game controller style hover-out menus
- Icon glows on hover, fly-out slides in from left
- Animated transitions between states
- Settings + Profile at bottom of sidebar

### Mobile: Accordion or Bottom Nav

- Accordion pattern for dashboard sections (collapse/expand)
- Bottom nav with same icons for primary navigation
- Gesture-based options for power users (swipe from edge)

### No Top Nav

- Avoid horizontal tabs (too SaaS-like)
- Page titles appear as large text in content area
- Maximum screen real estate for content

---

## 4. Dashboard Layout

### Row 1: Performance Overview (3 Columns)

```
┌──────────────────┬──────────────────┬──────────────────┐
│  DAILY GAINS     │ ACCOUNT CHART    │ ACCOUNT STATS    │
│                  │                  │                  │
│  30-day bar chart│  Candlestick     │ Total Value: $X  │
│  (per-day +/-)   │  (default)       │ Buying Power: $X │
│                  │                  │ Day Change: +$X  │
│  [$/% toggle]    │  [candle/line    │                  │
│                  │   toggle]        │                  │
└──────────────────┴──────────────────┴──────────────────┘
```

### Row 2: Leaderboards (6 Columns, 3 Groups)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ TRENDING │   TOP    │   TOP    │  WORST   │   TOP    │   TOP    │
│ TARGETS  │ TARGETS  │  SHOTS   │  SHOTS   │  USERS   │ TARGETS  │
│          │          │          │          │          │ (global) │
│  (mine)  │  (mine)  │  (mine)  │  (mine)  │(platform)│(platform)│
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
     MY TARGETS           MY SHOTS              PLATFORM
```

### Primary Metric: PPD (Performance Per Day)

All leaderboards sort by PPD, not raw percentage. This enables fair comparison across different holding periods.

### Mobile Dashboard: Accordion

```
┌────────────────────────────────────┐
│ > TODAY'S PERFORMANCE              │
│   [Expanded: bar chart + stats]    │
├────────────────────────────────────┤
│ > ACCOUNT HISTORY                  │
├────────────────────────────────────┤
│ > MY TARGETS                       │
├────────────────────────────────────┤
│ > MY SHOTS                         │
├────────────────────────────────────┤
│ > PLATFORM LEADERS (Coming Soon)   │
└────────────────────────────────────┘
```

---

## 5. Target Creation Flow

### Screen 1: "Set Your Eyes on the Target"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│        WHERE ARE YOU SETTING YOUR TARGET?                   │
│                                                             │
│   What's your thesis?                                       │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ "AI infrastructure goes up 20% in a year..."       │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Target Type:                                              │
│   [ STOCK ] [ SECTOR ] [ MARKET ] [ THEME ] [ EVENT ]      │
│                                                             │
│   Catalyst:  [ MACRO ] [ INDUSTRY ] [ COMPANY ] [ OTHER ]  │
│   Tags:      [AI] [Infrastructure] [+ Add]                 │
│                                                             │
│                         [ LOCK ON ]                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2: "Take Aim"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              WHO ARE YOU SETTING YOUR SIGHTS ON?            │
│                                                             │
│   TARGET: "AI infrastructure goes up 20% in a year"        │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Search tickers...                                   │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  NVDA   │  UP  │  20%  │  by Dec 31, 2025  │  [x]  │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │  MSFT   │  UP  │  20%  │  by Dec 31, 2025  │  [x]  │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │  GOOGL  │  UP  │  20%  │  by Dec 31, 2025  │  [x]  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   [+ ADD ANOTHER TO YOUR SIGHTS]                           │
│                                                             │
│                   [ CONFIRM SIGHTS ]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Shot Creation Flow

### Screen: "What's Your Shot Looking Like?"

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           WHAT'S YOUR SHOT LOOKING LIKE?                    │
│                                                             │
│   TARGET: "AI infrastructure boom 2025"                     │
│   IN SIGHTS: NVDA +20%, MSFT +20%, GOOGL +20%              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ TICKER  │ BUY/SELL │ AMOUNT  │ QTY   │ TRIGGER     │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ NVDA    │   BUY    │ $1,000  │ ~7 sh │ MARKET      │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ MSFT    │   BUY    │  $500   │ ~1 sh │ LIMIT $420  │   │
│   ├─────────────────────────────────────────────────────┤   │
│   │ GOOGL   │   BUY    │  $500   │ ~3 sh │ MARKET      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   TOTAL: $2,000                                             │
│   BUYING POWER: $10,000                                     │
│                                                             │
│              [ PULL THE TRIGGER ]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Trigger Types

| Type | Behavior | UX |
|------|----------|-----|
| **Market** | Execute immediately | "Pull the Trigger" button |
| **Limit** | Execute when price hits | "Set Your Trigger @ $X" |

### Shot States

| State | Description |
|-------|-------------|
| **Pending** | Shot configured, not yet submitted |
| **Armed** | Limit order placed, waiting for price |
| **Fired** | Market executed / limit filled |
| **Active** | Position held, tracking toward target |
| **Closed** | Position exited, scored |

---

## 7. Trajectory Visualization

### Concept

When you "take aim" at an asset, we calculate the required pace to hit your target. The trajectory view shows if you're on pace or not.

**Example:**
- Target: NVDA up 50% in 12 months
- Required pace: ~4.2% per month
- Your current pace: 5.1% per month = Ahead of pace

### Trajectory Chart

```
PRICE
  │
  │                               ╱ TARGET
  │                          ╱
  │                     ╱  [candlesticks]
  │                ╱    overlaid
  │           ╱
  │      ╱  ← trajectory line
  │ START
  │
  └────────────────────────────────────────►
                                        TIME
```

Fanning zones follow the trajectory slope (not horizontal bands), expanding over time.

### Pace Status Bar

Horizontal gradient bar with center "on pace" marker:

```
               ON PACE (4.2%/mo)
                    │
                    ○
                    │
🔴 ─────────────────●───────────────── 🟢
                YOUR PACE: 5.1%/mo
                (+0.9%/mo ahead)
```

- Left = behind pace (toward red)
- Center = exactly on pace (white marker)
- Right = ahead of pace (toward green)

### Aim Card with Pace Status

```
┌─────────────────────────────────────────────────────────────┐
│  NVDA  →  $200  by Dec 2026                                │
│                                                             │
│  Required pace: 4.2%/mo  │  Your pace: 5.1%/mo             │
│                                                             │
│               ○ on pace                                     │
│               │                                             │
│  🔴 ──────────┼─────●───────── 🟢                          │
│               │                                             │
│           +0.9%/mo ahead                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Multiple Aims View

```
┌─────────────────────────────────────────────────────────────┐
│  TARGET: AI Infrastructure Boom                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  NVDA → $200       ○                                       │
│  Pace: 5.1%/mo     │    🔴 ────┼────●──── 🟢  +0.9% ahead  │
│                                                             │
│  AMD → $180        ○                                        │
│  Pace: 2.8%/mo     │    🔴 ──●─┼──────── 🟢   -1.4% behind │
│                                                             │
│  AVGO → $250       ○                                        │
│  Pace: 6.3%/mo     │    🔴 ────┼──────●─ 🟢  +2.1% ahead   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Animation Direction

### MVP: Video Game Menu Feel

| Transition | Effect |
|------------|--------|
| Page load | Tiles slide/drop in with stagger timing |
| Data refresh | Numbers animate/count up to new value |
| Tab switch | Panels slide out, new panels slide in |
| Card interactions | Subtle scale/glow on hover, satisfying click |
| Success states | Celebratory animation (confetti, bounce) |

### Future (Phase 2+): FPS-Style Animations

| Moment | Animation Concept |
|--------|-------------------|
| Set Your Sights | Scope/crosshairs zoom onto ticker |
| Pull the Trigger | Muzzle flash, bullet flies toward target |
| Order Filled | Impact animation on target board |
| Target Hit | Bullseye explosion, confetti |
| Exceeded Target | Headshot/critical hit, screen shake |

---

## 9. Charting Decisions

### Chart Library

Apache eCharts (per Architecture document). UX validation needed to ensure it can be styled for "game feel" vs "finance feel."

### Chart Types Required

| Chart | Use Case |
|-------|----------|
| Bar chart | Daily gains (30-day) |
| Candlestick | Account history, trajectory overlay |
| Line chart | Alternative to candlestick (toggle) |
| Heatmap | GitHub-style daily performance (future) |

### Chart Toggles

- Daily gains: $ / % toggle
- Account history: Candlestick / Line toggle
- Show trajectory overlay: On / Off

---

## 10. Accessibility

### Colorblind Mode

Per PRD: Yellow/purple alternative for red/green

| Standard | Colorblind |
|----------|------------|
| Green (gain) | Yellow |
| Red (loss) | Purple |

### Other Considerations

- High contrast on dark backgrounds
- Clear focus states for keyboard navigation
- Screen reader support for charts (data tables fallback)

---

## 11. Onboarding Flow

### First-Time User Experience

#### Step 1: Welcome Screen

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         WELCOME TO OUTVESTMENTS                             │
│                                                                             │
│                          "Outvest the Rest"                                 │
│                                                                             │
│   Prove your investing skill. Track your predictions. Beat the market.     │
│                                                                             │
│   Before you can start taking shots, you'll need to connect a paper        │
│   trading account. We use Alpaca - it's free and takes about 5 minutes.    │
│                                                                             │
│                        [ LET'S GET STARTED ]                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Step 2: Alpaca Account Creation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    STEP 1 OF 3: CREATE YOUR ALPACA ACCOUNT                  │
│                                                                             │
│   Alpaca is a commission-free trading platform. We use their paper         │
│   trading feature to simulate real trades with fake money.                  │
│                                                                             │
│   1. Click the button below to open Alpaca in a new tab                     │
│   2. Click "Sign Up" (top right)                                            │
│   3. Fill in your email and create a password                               │
│   4. Verify your email when prompted                                        │
│   5. Come back here when you're done                                        │
│                                                                             │
│                    [ OPEN ALPACA SIGN UP → ]                                │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  [Screenshot: Alpaca homepage with arrow pointing to Sign Up]      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Already have an Alpaca account? [ Skip to API Keys → ]                    │
│                                                                             │
│                      [ I'VE CREATED MY ACCOUNT ]                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Step 3: Enable Paper Trading

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    STEP 2 OF 3: ENABLE PAPER TRADING                        │
│                                                                             │
│   Now we need to switch to paper trading mode (fake money).                 │
│                                                                             │
│   1. Log into your Alpaca account                                           │
│   2. Look for the toggle in the top-right that says "Live"                  │
│   3. Click it to switch to "Paper"                                          │
│   4. You should see "Paper Trading" confirmed                               │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  [Screenshot: Alpaca dashboard with Live/Paper toggle circled]     │   │
│   │  [Arrow pointing to Paper option]                                  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   ⚠️  Make sure it says "Paper" - not "Live"!                              │
│   Paper trading uses fake money. Live uses real money.                      │
│                                                                             │
│                      [ I'VE ENABLED PAPER TRADING ]                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Step 4: Get API Keys

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    STEP 3 OF 3: GET YOUR API KEYS                           │
│                                                                             │
│   API keys let Outvestments talk to Alpaca on your behalf.                  │
│                                                                             │
│   1. In Alpaca, go to "Paper Trading" section (left sidebar)                │
│   2. Find "API Keys" or "Your API Keys"                                     │
│   3. Click "Generate New Keys" or "Regenerate"                              │
│   4. You'll see two values:                                                 │
│      - API Key ID (starts with "PK...")                                     │
│      - Secret Key (only shown once - copy it now!)                          │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  [Screenshot: Alpaca API Keys page with keys visible]              │   │
│   │  [Both Key ID and Secret Key fields highlighted]                   │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│   Paste your keys below:                                                    │
│                                                                             │
│   API Key ID:   ┌─────────────────────────────────────────────────────┐     │
│                 │ PK...                                               │     │
│                 └─────────────────────────────────────────────────────┘     │
│                                                                             │
│   Secret Key:   ┌─────────────────────────────────────────────────────┐     │
│                 │ ••••••••••••••••••••                                │     │
│                 └─────────────────────────────────────────────────────┘     │
│                                                                             │
│   🔒 Your keys are encrypted and stored securely.                          │
│                                                                             │
│                      [ CONNECT MY ACCOUNT ]                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Step 5: Success + First Target

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         ✓ YOU'RE CONNECTED!                                 │
│                                                                             │
│   Account Balance: $100,000 (paper money)                                   │
│   Buying Power: $100,000                                                    │
│                                                                             │
│   You're ready to start proving your investing skill.                       │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   WHAT'S FIRST?                                                    │   │
│   │                                                                     │   │
│   │   [ SET MY FIRST TARGET ]     ← Create your first thesis           │   │
│   │                                                                     │   │
│   │   [ EXPLORE THE DASHBOARD ]   ← Look around first                  │   │
│   │                                                                     │   │
│   │   [ TAKE A TOUR ]             ← Quick 2-minute walkthrough         │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Error Handling During Onboarding

| Error | Message | Action |
|-------|---------|--------|
| Invalid API Key | "That key doesn't look right. Make sure you copied the full key." | Show format hint |
| Connection failed | "Couldn't connect to Alpaca. Check your keys and try again." | Retry button |
| Live keys detected | "Those are Live keys! Switch to Paper mode in Alpaca first." | Link to Alpaca |
| Keys already in use | "These keys are connected to another account." | Contact support link |

---

## 12. Target Detail View

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back                                           [Edit Target] [Archive]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TARGET: AI INFRASTRUCTURE BOOM 2025                                        │
│  Created: Dec 15, 2024  │  Status: ACTIVE  │  Type: SECTOR                 │
│                                                                             │
│  THESIS:                                                                    │
│  "Data center buildout and AI chip demand will drive infrastructure        │
│   companies to outperform the broader market through 2025."                │
│                                                                             │
│  Catalyst: INDUSTRY  │  Tags: [AI] [Infrastructure] [Datacenter]           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              VS                                             │
│                                                                             │
│  ┌──────────────────────────┐    ⚔️    ┌──────────────────────────────┐     │
│  │      YOUR TARGET         │         │       S&P 500                │     │
│  │                          │         │                              │     │
│  │   Total Invested: $5,000 │         │   Same $5,000 in SPY         │     │
│  │   Current Value: $6,240  │         │   Would be: $5,890           │     │
│  │   Return: +24.8%         │         │   Return: +17.8%             │     │
│  │   PPD: 0.34%             │         │   PPD: 0.24%                 │     │
│  │                          │         │                              │     │
│  └──────────────────────────┘         └──────────────────────────────┘     │
│                                                                             │
│                         YOUR THESIS WINS                                    │
│                        +$350 / +7.0% ALPHA                                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AIMS UNDER THIS TARGET                                                     │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  NVDA → $200 by Dec 2026                                            │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                      │   │
│  │  ┌────────────────┐    ⚔️    ┌────────────────┐                      │   │
│  │  │ YOU: +32.1%    │         │ SPY: +18.2%    │    YOU WIN +13.9%   │   │
│  │  │ $1,605         │         │ $1,410         │                      │   │
│  │  └────────────────┘         └────────────────┘                      │   │
│  │                                                                      │   │
│  │  Pace: 5.1%/mo  │  Required: 4.2%/mo  │  +0.9%/mo ahead            │   │
│  │  2 Active Shots │ $2,500 invested                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  AMD → $180 by Dec 2026                                             │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │                                                                      │   │
│  │  ┌────────────────┐    ⚔️    ┌────────────────┐                      │   │
│  │  │ YOU: +8.4%     │         │ SPY: +12.1%    │    SPY WINS +3.7%   │   │
│  │  │ $542           │         │ $605           │                      │   │
│  │  └────────────────┘         └────────────────┘                      │   │
│  │                                                                      │   │
│  │  Pace: 2.8%/mo  │  Required: 4.1%/mo  │  -1.3%/mo behind           │   │
│  │  1 Active Shot  │ $1,500 invested                                   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                        [ + ADD NEW AIM ]                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Shot Detail View

### Active Shot Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Target                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SHOT FIRED: NVDA                                                           │
│  Under Target: "AI Infrastructure Boom 2025"                                │
│  Aim: NVDA → $200 by Dec 2026                                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              VS                                             │
│                                                                             │
│  ┌──────────────────────────┐    ⚔️    ┌──────────────────────────────┐     │
│  │         YOUR SHOT        │         │         S&P 500             │     │
│  │                          │         │                              │     │
│  │        [NVDA logo]       │         │        [SPY logo]            │     │
│  │                          │         │                              │     │
│  │       +15.2%             │         │       +8.7%                  │     │
│  │       +$1,520            │         │       +$870                  │     │
│  │                          │         │       (if you'd bought SPY)  │     │
│  │       36 days held       │         │       36 days                │     │
│  │       0.42%/day          │         │       0.24%/day              │     │
│  │                          │         │                              │     │
│  └──────────────────────────┘         └──────────────────────────────┘     │
│                                                                             │
│                     ════════════════════════════                            │
│                              YOU WIN                                        │
│                           +6.5% ALPHA                                       │
│                        +$650 more than SPY                                  │
│                     ════════════════════════════                            │
│                                                                             │
│                      [Change Opponent ▼]                                    │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRAJECTORY                                                                 │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  PRICE                                    ╱ TARGET $200             │   │
│  │    │                                 ╱                              │   │
│  │    │                            ╱  [candles]                        │   │
│  │    │                       ╱                                        │   │
│  │    │                  ╱                                             │   │
│  │    │             ╱                                                  │   │
│  │    │        ╱  ← trajectory                                         │   │
│  │    │   START                                                        │   │
│  │    └────────────────────────────────────────────────────► TIME      │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                 ○ on pace                                                   │
│                 │                                                           │
│  🔴 ────────────┼─────●───────── 🟢   +0.9%/mo ahead                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  SHOT DETAILS                                                               │
│                                                                             │
│  │ Entry Price      │ $134.52          │                                   │
│  │ Current Price    │ $154.97          │                                   │
│  │ Shares           │ 74               │                                   │
│  │ Cost Basis       │ $9,954.48        │                                   │
│  │ Current Value    │ $11,467.78       │                                   │
│  │ Unrealized P/L   │ +$1,513.30       │                                   │
│  │ Trigger          │ MARKET           │                                   │
│  │ Filled           │ Dec 15, 2024     │                                   │
│  │ Days Held        │ 36               │                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                        [ CLOSE POSITION ]                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Close Position Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         CLOSE YOUR SHOT                                     │
│                                                                             │
│  NVDA  │  74 shares  │  +$1,513.30 unrealized                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  How much do you want to close?                                             │
│                                                                             │
│  [ CLOSE ALL ]  [ CLOSE PARTIAL ]                                          │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────     │
│                                                                             │
│  Shares to close: ┌─────────┐                                               │
│                   │ 74      │  ← All                                       │
│                   └─────────┘                                               │
│                                                                             │
│  Trigger type:                                                              │
│  [ MARKET - Close now ]  [ LIMIT - Set price ]                             │
│                                                                             │
│  Limit price: ┌─────────┐  (Current: $154.97)                              │
│               │ $160.00 │                                                   │
│               └─────────┘                                                   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FINAL SCORE PREVIEW                                                        │
│                                                                             │
│  ┌──────────────────────────┐    ⚔️    ┌──────────────────────────────┐     │
│  │         YOUR SHOT        │         │         S&P 500             │     │
│  │       +15.2%             │         │       +8.7%                  │     │
│  │       +$1,520            │         │       +$870                  │     │
│  │       0.42%/day          │         │       0.24%/day              │     │
│  └──────────────────────────┘         └──────────────────────────────┘     │
│                                                                             │
│                            YOU WIN                                          │
│                         +6.5% ALPHA                                         │
│                                                                             │
│  Accuracy Score: 76 (hit 76% of your +20% target)                          │
│  Difficulty: 1.0x (Close Range prediction)                                  │
│  Shot Score: 76                                                             │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    [ CLOSE THIS SHOT ]                                      │
│                                                                             │
│  ⚠️  This will sell your position and lock in your score.                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Shot Closed Confirmation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         🎯 SHOT LANDED                                      │
│                                                                             │
│                            NVDA                                             │
│                                                                             │
│                          +15.2%                                             │
│                         +$1,520                                             │
│                                                                             │
│                     ════════════════════                                    │
│                                                                             │
│                    YOU BEAT S&P BY 6.5%                                     │
│                                                                             │
│                     ════════════════════                                    │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                                                                    │     │
│  │  SHOT SCORECARD                                                   │     │
│  │                                                                    │     │
│  │  Accuracy:     76    (hit 76% of +20% target)                     │     │
│  │  Difficulty:   1.0x  (Close Range)                                │     │
│  │  Shot Score:   76                                                 │     │
│  │                                                                    │     │
│  │  vs S&P 500:   +6.5% alpha                                        │     │
│  │  vs 10%/yr:    +11.2% alpha                                       │     │
│  │                                                                    │     │
│  │  Held:         36 days                                            │     │
│  │  PPD:          0.42%                                              │     │
│  │                                                                    │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│       [ VIEW TARGET ]    [ TAKE ANOTHER SHOT ]    [ DASHBOARD ]            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. Opponent Comparison System

### Core Concept: Opportunity Cost

Every investment decision has an opportunity cost. You could have just bought S&P 500 and done nothing. The opponent comparison makes this visceral and gamified.

**Key Insight:** This is what separates Outvestments from every other platform. Users need to understand that a 10% gain that underperforms S&P's 15% gain is actually a failure.

### Opponent Types

| Type | Description | Examples |
|------|-------------|----------|
| **NPC Opponents** | Computer-controlled benchmarks (MVP) | S&P 500, NASDAQ, 10%/yr, Sector ETFs |
| **PvP Opponents** | User vs User head-to-head (Phase 2+) | Volleys, Heats, Leaderboard challenges |

NPC = "Non-Player Character" - benchmarks you're always competing against
PvP = "Player vs Player" - real users competing against each other

### Visual Design: Street Fighter / Fantasy Football Style

Left-right face-off layout at every level:

- You on the left
- NPC/Opponent on the right
- Clear winner/loser messaging in center

### Opponent Comparison Levels

#### Shot Level (Individual Position)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              VS                                             │
│                                                                             │
│  ┌──────────────────────────┐    ⚔️    ┌──────────────────────────────┐     │
│  │         YOUR SHOT        │         │         S&P 500             │     │
│  │                          │         │                              │     │
│  │        [NVDA logo]       │         │        [SPY logo]            │     │
│  │                          │         │                              │     │
│  │       +15.2%             │         │       +8.7%                  │     │
│  │       +$1,520            │         │       +$870                  │     │
│  │                          │         │       (if you'd bought SPY)  │     │
│  │       36 days            │         │       36 days                │     │
│  │       0.42%/day          │         │       0.24%/day              │     │
│  │                          │         │                              │     │
│  └──────────────────────────┘         └──────────────────────────────┘     │
│                                                                             │
│                     ════════════════════════════                            │
│                              YOU WIN                                        │
│                           +6.5% ALPHA                                       │
│                     ════════════════════════════                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Aim Level (Multiple Shots Under One Aim)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AIM: NVDA → $200 by Dec 2026                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              VS                                             │
│                                                                             │
│  ┌──────────────────────────┐    ⚔️    ┌──────────────────────────────┐     │
│  │       YOUR SHOTS         │         │       IF YOU'D BOUGHT SPY    │     │
│  │                          │         │                              │     │
│  │   Shot 1: +$520          │         │       Same $: +$340          │     │
│  │   Shot 2: +$180          │         │       Same $: +$210          │     │
│  │   Shot 3: -$45           │         │       Same $: +$85           │     │
│  │   ─────────────          │         │       ─────────────          │     │
│  │   Total: +$655           │         │       Total: +$635           │     │
│  │   Avg PPD: 0.31%         │         │       Avg PPD: 0.28%         │     │
│  │                          │         │                              │     │
│  └──────────────────────────┘         └──────────────────────────────┘     │
│                                                                             │
│                        YOU WIN BY $20                                       │
│                     +0.03%/day better                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Target Level (Aggregate Thesis Performance)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TARGET: AI Infrastructure Boom 2025                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              VS                                             │
│                                                                             │
│  ┌──────────────────────────┐    ⚔️    ┌──────────────────────────────┐     │
│  │      YOUR THESIS         │         │     THE LAZY INVESTOR        │     │
│  │                          │         │                              │     │
│  │   3 Aims                 │         │   "Just buy S&P"             │     │
│  │   7 Shots                │         │                              │     │
│  │                          │         │                              │     │
│  │   Total Invested: $5,000 │         │   Same $5,000 in SPY         │     │
│  │   Current Value: $6,240  │         │   Would be: $5,890           │     │
│  │   Return: +24.8%         │         │   Return: +17.8%             │     │
│  │   PPD: 0.34%             │         │   PPD: 0.24%                 │     │
│  │                          │         │                              │     │
│  └──────────────────────────┘         └──────────────────────────────┘     │
│                                                                             │
│                     ════════════════════════════                            │
│                         YOUR THESIS WINS                                    │
│                        +$350 / +7.0% ALPHA                                  │
│                     ════════════════════════════                            │
│                                                                             │
│   "Your AI thesis beat the market by $350. You earned this by doing        │
│    research and taking calculated risks. The lazy investor lost out."      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### When You LOSE to the Opponent

Critical messaging to drive the opportunity cost lesson home:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                              VS                                             │
│                                                                             │
│  ┌──────────────────────────┐    ⚔️    ┌──────────────────────────────┐     │
│  │         YOUR SHOT        │         │         S&P 500             │     │
│  │                          │         │                              │     │
│  │        [TSLA logo]       │         │        [SPY logo]            │     │
│  │                          │         │                              │     │
│  │       +3.2%              │         │       +11.4%                 │     │
│  │       +$320              │         │       +$1,140                │     │
│  │                          │         │       (if you'd bought SPY)  │     │
│  │                          │         │                              │     │
│  └──────────────────────────┘         └──────────────────────────────┘     │
│                                                                             │
│                     ════════════════════════════                            │
│                          S&P 500 WINS                                       │
│                    You left $820 on the table                               │
│                     ════════════════════════════                            │
│                                                                             │
│   "You could have made $820 more by just buying SPY. This shot             │
│    underperformed the market by 8.2%. Review your thesis."                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### NPC Opponent Selection (MVP)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SELECT YOUR NPC OPPONENTS                                                  │
│  (Benchmarks you're always competing against)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [✓] S&P 500 (SPY)           ← Default opponent                            │
│  [ ] NASDAQ (QQQ)            ← Tech benchmark                              │
│  [ ] Same Sector (XLK)       ← Sector ETF auto-matched                     │
│  [ ] 10% Annual              ← "Expected market return"                    │
│  [ ] Risk-Free (T-Bills)     ← Conservative benchmark                      │
│  [ ] Custom Ticker: [____]   ← "What if I'd bought AAPL instead?"          │
│                                                                             │
│                        [CONFIRM OPPONENTS]                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dashboard Summary: Your Record vs NPC Opponents

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  YOUR RECORD VS NPC OPPONENTS                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│          YOU                    W-L           OPPONENT                      │
│                                                                             │
│    ┌─────────┐               ┌─────┐         ┌─────────┐                   │
│    │  [You]  │     7-3       │ VS  │         │  [SPY]  │  S&P 500          │
│    └─────────┘    +4.2% α    └─────┘         └─────────┘                   │
│                                                                             │
│    ┌─────────┐               ┌─────┐         ┌─────────┐                   │
│    │  [You]  │     5-5       │ VS  │         │  [QQQ]  │  NASDAQ           │
│    └─────────┘    +1.1% α    └─────┘         └─────────┘                   │
│                                                                             │
│    ┌─────────┐               ┌─────┐         ┌─────────┐                   │
│    │  [You]  │     8-2       │ VS  │         │  [💵]   │  10% Annual       │
│    └─────────┘    +6.8% α    └─────┘         └─────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Messaging Patterns

| Result | Message Style |
|--------|---------------|
| **You Win Big** | Celebratory: "Your thesis crushed the market!" |
| **You Win Small** | Affirming: "You edged out S&P - every % counts" |
| **You Lose Small** | Instructive: "Close, but SPY had the edge this time" |
| **You Lose Big** | Direct: "You left $X on the table. Review your thesis." |
| **Wrong Direction** | Critical: "You lost money while the market gained. What went wrong?" |

---

## 15. Toast & Notification System

### Design Philosophy: Game Achievements Meet Stock Tickers

Toasts should feel like unlocking an achievement or getting a kill notification in an FPS - satisfying, animated, and memorable.

### Toast Animation Patterns

| Event Type | Animation Style | Duration |
|------------|-----------------|----------|
| **Success** | Slide in from right + pulse glow + confetti burst | 4s |
| **Order Filled** | Slam down from top + screen shake + cash register sound | 5s |
| **Target Hit** | Explosion effect + "HEADSHOT" style text + slow-mo feel | 6s |
| **Warning** | Bounce in + amber pulse | 4s |
| **Error** | Retro Windows 95 modal (see below) | Until dismissed |
| **Info** | Gentle slide + fade | 3s |

### Success Toasts

```
┌────────────────────────────────────────────────────┐
│  ⚡ SHOT FIRED                                     │
│                                                    │
│  NVDA × 74 shares @ $134.52                       │
│  Order filled successfully                         │
│                                                    │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  ← progress bar  │
└────────────────────────────────────────────────────┘
     ↑ slides in from right with momentum
     ↑ number "74" counts up rapidly
     ↑ subtle screen shake on arrival
```

### Achievement-Style Toasts (Major Events)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     🎯  TARGET ACQUIRED                                    │
│                                                             │
│     ████████████████████████████████████████████           │
│                                                             │
│     NVDA hit $200.00                                       │
│     +49.2% │ 247 days │ You called it.                     │
│                                                             │
│     [ VIEW SCORECARD ]                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
     ↑ slams in from top
     ↑ gold/yellow glow pulsing
     ↑ confetti particles behind
     ↑ dramatic pause before content reveals
```

### Kill Feed Style (Rapid Updates)

For multiple quick updates (e.g., batch order fills), use a kill-feed style stack:

```
                                          ┌─────────────────────┐
                                          │ NVDA +2.4% today    │
                                          ├─────────────────────┤
                                          │ MSFT order filled   │
                                          ├─────────────────────┤
                                          │ AMD hit pace target │
                                          └─────────────────────┘
                                               ↑ stack in corner
                                               ↑ newest on top
                                               ↑ fade out after 3s
```

---

## 16. Error States: Windows 95 Retro Edition

### Design Philosophy: Ironic Nostalgia

Errors use a deliberately retro Windows 95/98 aesthetic as an ironic counterpoint to the modern game UI. This makes errors memorable, reduces frustration, and gives the platform personality.

### The Classic Error Modal

```
┌──────────────────────────────────────────────────────────────────┐
│ ■ Outvestments Error                                    [X]      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ⚠️                                                          │
│                                                                  │
│     A problem occurred while trying to execute your shot.       │
│                                                                  │
│     NVDA order failed: Insufficient buying power.               │
│                                                                  │
│     You have $1,420 available.                                  │
│     This order requires $10,000.                                │
│                                                                  │
│     ─────────────────────────────────────────────────────────   │
│                                                                  │
│     WHAT TO DO:                                                 │
│     • Reduce position size to $1,420 or less                   │
│     • Close an existing position to free up capital            │
│     • Wait for pending orders to settle                        │
│                                                                  │
│     Error Code: INSUFFICIENT_BUYING_POWER                       │
│     Timestamp: 2025-12-27 14:32:15 EST                          │
│                                                                  │
│              [ OK ]    [ Copy Details ]    [ Help ]             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
     ↑ Gray beveled border (Windows 95 style)
     ↑ Blue title bar with [X] close button
     ↑ System font (or similar retro feel)
     ↑ Satisfying "bonk" sound on appear
```

### Error Modal Styling

| Element | Style |
|---------|-------|
| Border | 3D beveled gray (classic Windows) |
| Title bar | Blue gradient (#000080 → #1084d0) |
| Background | #c0c0c0 (Windows gray) |
| Font | System/MS Sans Serif style |
| Buttons | Raised 3D with dark border |
| Icon | Classic yellow warning triangle |

### Error Types with Personality

#### Connection Error

```
┌──────────────────────────────────────────────────────────────────┐
│ ■ Connection Lost                                       [X]      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     📡  ╳                                                       │
│                                                                  │
│     Lost connection to Alpaca.                                  │
│                                                                  │
│     Your shots are safe. We'll reconnect automatically.        │
│     If this persists, Alpaca might be having a moment.         │
│                                                                  │
│     Last successful sync: 2 minutes ago                         │
│                                                                  │
│              [ Retry Now ]    [ Check Alpaca Status ]           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Market Closed

```
┌──────────────────────────────────────────────────────────────────┐
│ ■ Market's Closed, Chief                                [X]      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     🌙                                                          │
│                                                                  │
│     The market is closed right now.                             │
│                                                                  │
│     Market hours: 9:30 AM - 4:00 PM ET                          │
│     Current time: 7:45 PM ET                                    │
│     Next open: Tomorrow 9:30 AM ET                              │
│                                                                  │
│     Your order will be queued and executed at market open.      │
│                                                                  │
│              [ Queue Order ]    [ Cancel ]                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### API Rate Limited

```
┌──────────────────────────────────────────────────────────────────┐
│ ■ Slow Down There, Hotshot                              [X]      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     🐌                                                          │
│                                                                  │
│     You're making requests faster than we can handle.           │
│                                                                  │
│     Take a breath. We'll retry automatically in 30 seconds.     │
│                                                                  │
│     ████████████░░░░░░░░░░░░░░░░░░ 30s                          │
│                                                                  │
│              [ Retry Now ]    [ OK ]                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Invalid Input

```
┌──────────────────────────────────────────────────────────────────┐
│ ■ That Doesn't Look Right                               [X]      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│     🤔                                                          │
│                                                                  │
│     Your target price needs some work.                          │
│                                                                  │
│     Problem: $-50 is not a valid price                          │
│     (Stocks can't have negative prices. Yet.)                   │
│                                                                  │
│     Current NVDA price: $134.52                                 │
│     Suggested: Enter a price above $0                           │
│                                                                  │
│              [ OK ]                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### BSOD Easter Egg (Critical Errors Only)

For truly catastrophic errors (extremely rare), show a fake Blue Screen of Death:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                                                                  │
│     A problem has been detected and Outvestments has been       │
│     shut down to prevent damage to your portfolio.              │
│                                                                  │
│     IRQL_NOT_LESS_OR_EQUAL_TO_YOUR_EXPECTATIONS                 │
│                                                                  │
│     If this is the first time you've seen this error,          │
│     restart the app. If it happens again, we're very sorry.    │
│                                                                  │
│     Technical information:                                       │
│                                                                  │
│     *** STOP: 0x0000BEEF (Your code is fine, ours isn't)       │
│                                                                  │
│     Beginning dump of error details...                          │
│     (Just kidding, click below to get back to your money)       │
│                                                                  │
│                                                                  │
│              [ Return to Dashboard ]    [ Report Bug ]          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
     ↑ Blue background (#0000AA)
     ↑ White text
     ↑ Full-screen overlay
     ↑ Auto-dismiss after 5s or on click
```

---

## 17. Empty States

### Design Philosophy: Encouraging, Not Depressing

Empty states should motivate action, not feel like a dead end. Use the game metaphor to frame emptiness as opportunity.

### Dashboard - No Targets Yet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           🎯                                               │
│                                                                             │
│                    NO TARGETS IN YOUR SIGHTS                               │
│                                                                             │
│     You haven't set any targets yet. Every great investor                  │
│     starts with a thesis. What do you believe will happen?                 │
│                                                                             │
│                    [ SET YOUR FIRST TARGET ]                               │
│                                                                             │
│     ─────────────────────────────────────────────────────────────         │
│                                                                             │
│     NEED INSPIRATION?                                                       │
│                                                                             │
│     • "Tech will outperform in Q1 2025"                                    │
│     • "EV adoption accelerates this year"                                  │
│     • "AI infrastructure boom continues"                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Target Detail - No Aims

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           🔭                                               │
│                                                                             │
│                    YOU HAVE A TARGET, BUT NO SIGHTS                        │
│                                                                             │
│     You've identified your thesis, but haven't aimed at any               │
│     specific assets yet. Time to pick your targets.                        │
│                                                                             │
│                        [ TAKE AIM ]                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Aim Detail - No Shots

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           🔫                                               │
│                                                                             │
│                    READY, AIM... NO SHOTS FIRED                            │
│                                                                             │
│     You've got NVDA in your sights at $200, but haven't                   │
│     pulled the trigger yet. Paper trading is free - take a shot!          │
│                                                                             │
│                    [ SET UP YOUR SHOT ]                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### History - No Closed Positions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           📜                                               │
│                                                                             │
│                    NO HISTORY YET                                          │
│                                                                             │
│     You haven't closed any positions yet. Your track record               │
│     will appear here once you start closing shots.                         │
│                                                                             │
│     Active shots don't count until they're closed and scored.             │
│                                                                             │
│                    [ VIEW ACTIVE SHOTS ]                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 18. Settings Page

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              SETTINGS                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  DISPLAY                                                                    │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  Theme                          [ Dark ▼ ]                                 │
│                                 Dark | Light | System                       │
│                                                                             │
│  Colorblind Mode                [ Off ▼ ]                                  │
│                                 Off | Deuteranopia (Yellow/Purple)          │
│                                                                             │
│  Animation Intensity            ●────────○ High                            │
│                                 Reduced | Normal | High                     │
│                                                                             │
│  Number Format                  [ $1,234.56 ▼ ]                            │
│                                 $1,234.56 | $1234.56 | 1,234.56            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NPC OPPONENTS (Default Benchmarks)                                         │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  [✓] S&P 500 (SPY)              Always on                                  │
│  [✓] NASDAQ (QQQ)                                                          │
│  [ ] 10% Annual (Expected)                                                 │
│  [ ] Sector ETF (Auto-matched)                                             │
│  [ ] Risk-Free (T-Bills)                                                   │
│                                                                             │
│  Custom Opponent: [ Enter ticker... ]                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ALPACA CONNECTION                                                          │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  Status:        ● Connected (Paper Trading)                                │
│  Account:       PA••••••7X                                                 │
│  Balance:       $97,420.00                                                 │
│  Buying Power:  $45,000.00                                                 │
│                                                                             │
│  Last Sync:     2 minutes ago                                              │
│                                                                             │
│  [ Refresh Connection ]    [ Disconnect ]                                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NOTIFICATIONS                                                              │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  Order Filled              [✓] Toast  [ ] Email                            │
│  Target Price Hit          [✓] Toast  [✓] Email                            │
│  Behind Pace Warning       [✓] Toast  [ ] Email                            │
│  Daily Summary             [ ] Toast  [✓] Email                            │
│                                                                             │
│  Sound Effects             [ On ▼ ]                                        │
│                            On | Off | Critical Only                        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PROFILE                                                                    │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  Display Name:  [ Matt ]                                                   │
│  Email:         mgerasolo@example.com                                      │
│                                                                             │
│  [ Change Password ]    [ Export My Data ]    [ Delete Account ]           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  About Outvestments                                                         │
│  Version 1.0.0 │ © 2025 │ Privacy Policy │ Terms of Service               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 19. History View

### Design Philosophy

History is your track record - the permanent record of your skill. It should feel like a sports stats page or a player career summary.

### Main History Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back                                                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              YOUR TRACK RECORD                              │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CAREER STATS                                                               │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │   TARGETS   │    AIMS     │    SHOTS    │   WIN RATE  │   vs S&P    │   │
│  │             │             │             │             │             │   │
│  │     12      │     34      │     89      │    67%      │   +4.2%     │   │
│  │   created   │   tracked   │   closed    │  (60/89)    │   alpha     │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  PERFORMANCE OVER TIME                                               │   │
│  │                                                                      │   │
│  │  [Monthly performance bar chart - green/red bars]                   │   │
│  │                                                                      │   │
│  │  Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct   Nov   │   │
│  │   ▓     ▓     ░     ▓     ▓     ░     ▓     ▓     ▓     ░     ▓    │   │
│  │  +4%   +2%   -1%   +6%   +3%   -2%   +5%   +4%   +1%   -3%   +7%   │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FILTER: [ All Time ▼ ]  [ All Targets ▼ ]  [ All Tickers ▼ ]  🔍 Search  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLOSED SHOTS                                                               │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  NVDA                                        SHOT LANDED 🎯         │   │
│  │  74 shares │ Dec 15 - Jan 20 (36 days)                              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐    ⚔️    ┌──────────────┐                         │   │
│  │  │ YOU: +15.2%  │         │ SPY: +8.7%   │    YOU WIN +6.5%        │   │
│  │  │ +$1,520      │         │ +$870        │                         │   │
│  │  └──────────────┘         └──────────────┘                         │   │
│  │                                                                      │   │
│  │  Target: AI Infrastructure Boom 2025                                │   │
│  │  Accuracy: 76 │ Shot Score: 76 │ PPD: 0.42%                        │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  TSLA                                        SHOT MISSED ❌         │   │
│  │  25 shares │ Nov 1 - Dec 15 (44 days)                               │   │
│  │                                                                      │   │
│  │  ┌──────────────┐    ⚔️    ┌──────────────┐                         │   │
│  │  │ YOU: +3.2%   │         │ SPY: +11.4%  │    SPY WINS +8.2%       │   │
│  │  │ +$320        │         │ +$1,140      │                         │   │
│  │  └──────────────┘         └──────────────┘                         │   │
│  │                                                                      │   │
│  │  Target: EV Sector Momentum                                         │   │
│  │  Accuracy: 32 │ Shot Score: 32 │ PPD: 0.07%                        │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  AMD                                         SHOT LANDED 🎯         │   │
│  │  50 shares │ Oct 10 - Nov 28 (49 days)                              │   │
│  │  ...                                                                 │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│                         [ Load More ]                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Closed Target Summary (Archived Targets)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  CLOSED TARGETS                                                             │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  AI INFRASTRUCTURE BOOM 2025                     THESIS PROVEN ✓    │   │
│  │  Created: Dec 2024 │ Closed: Dec 2025 │ 12 months                   │   │
│  │                                                                      │   │
│  │  3 Aims │ 7 Shots │ 5 Wins, 2 Losses                               │   │
│  │                                                                      │   │
│  │  ┌──────────────┐    ⚔️    ┌──────────────┐                         │   │
│  │  │ YOUR THESIS  │         │ S&P 500      │    YOU WIN +12.4%       │   │
│  │  │ +31.2%       │         │ +18.8%       │                         │   │
│  │  └──────────────┘         └──────────────┘                         │   │
│  │                                                                      │   │
│  │  "Data center buildout and AI chip demand drove infrastructure      │   │
│  │   companies to outperform as predicted."                            │   │
│  │                                                                      │   │
│  │  Target Grade: A │ Total Alpha: +$2,340                            │   │
│  │                                                                      │   │
│  │                              [ View Full Details ]                  │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 20. Outstanding Questions / Future Work

### Completed

1. ~~**Onboarding flow**~~ - ✓ Completed (Section 11)
2. ~~**Settings page**~~ - ✓ Completed (Section 18)
3. ~~**History view**~~ - ✓ Completed (Section 19)
4. ~~**Target detail page**~~ - ✓ Completed (Section 12)
5. ~~**Shot detail page**~~ - ✓ Completed (Section 13)
6. ~~**Empty/error states**~~ - ✓ Completed (Sections 16-17)
7. ~~**Notifications**~~ - ✓ Completed (Section 15)

### A/B Testing Candidates

- Fly-out menus vs radial quick menu
- Hover vs click for fly-out expansion
- Icons always visible vs peek-on-mouse-near-edge
- Animation intensity levels

### Phase 2+ Features

- FPS-style animations
- Sub-targets
- Public profiles and social features
- Platform-wide leaderboards
- Achievement/badge system
- PvP opponents (user vs user head-to-head)
- Volleys, Heats, Brackets competitions

---

## 21. Terminology Reference

### Complete Glossary

| Term | Definition |
|------|------------|
| **Target** | Investment thesis/prediction (can be broad or specific) |
| **Aim** | Specific asset + price target + target date |
| **Shot** | Order/position (exists before and after execution) |
| **Trigger** | Execution event (market = immediate, limit = conditional) |
| **Sight In** | Action: Create a target |
| **Take Aim** | Action: Add specific asset prediction to target |
| **Set Up Your Shot** | Action: Configure order details |
| **Pull the Trigger** | Action: Execute the order |
| **Pace** | Required rate of gain to hit target (%/month) |
| **PPD** | Performance Per Day - normalized scoring metric |
| **Trajectory** | The expected price path from current to target |
| **Alpha** | Performance above/below benchmark (your return minus opponent return) |
| **NPC Opponent** | Computer-controlled benchmark (S&P 500, NASDAQ, etc.) - always competing against |
| **PvP Opponent** | Real user in head-to-head competition (Phase 2+) |

### Screen Headers

| Screen | Header |
|--------|--------|
| Create Target | "SET YOUR EYES ON THE TARGET" |
| Add Aim | "TAKE AIM" / "WHO ARE YOU SETTING YOUR SIGHTS ON?" |
| Configure Shot | "WHAT'S YOUR SHOT LOOKING LIKE?" |
| Execute | "PULL THE TRIGGER" |
| Active Position | "SHOT FIRED" / "TRACKING..." |
| Closed Position | "SHOT LANDED" |

---

**Document Status:** Complete (MVP)
**Last Updated:** 2025-12-27
**Next Steps:** Ready for implementation. Future phases will add FPS-style animations, PvP opponents, achievements, and social features.

See also: [ux-design-specification-plan-c.md](ux-design-specification-plan-c.md) for conservative visual alternative.
