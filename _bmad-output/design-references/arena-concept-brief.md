# Arena Concept Design Brief

**Date:** 2025-12-27
**Status:** Reference / Inspiration
**For:** UX and Development Teams

---

## Assets Location

```
AppServices/icons/apps/outvestments/
├── arena.png                         # Full arena WITH scoreboard (reference only)
├── basketballarena-noscoreboard.png  # Arena background for layering (USE THIS)
└── outvestment_logo1-512x512.png     # Logo (512x512)
```

**Key visual elements captured:**

---

## Core Visual Elements

### 1. Arena Perspective
- Court-level view looking toward the basket
- Creates immersion - you're IN the arena
- Stands/bleachers visible on both sides
- Atmospheric lighting from above

### 2. Scoreboard Hero (Jumbotron)

**Layout:** 80-90% width, feels like arena video board/jumbotron

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SCOREBOARD HERO (80-90% width)                   │
├─────────────────────────────────────────┬───────────────────────────────┤
│           MAIN VIDEO SCREEN             │      SIDE VIDEO BOARD         │
│                                         │                               │
│   ┌─────────────────────────────────┐   │   ┌───────────────────────┐   │
│   │  30-Day Performance Graph       │   │   │  CAROUSEL LISTS       │   │
│   │  (Account History Chart)        │   │   │                       │   │
│   └─────────────────────────────────┘   │   │  • Today's Top Gainers│   │
│                                         │   │  • Today's Top Losers │   │
│   TARGETS    SHOTS     ACCOUNT          │   │  • Top Active Targets │   │
│   ┌────┐    ┌────┐    ┌────────┐        │   │  • Hot Streaks        │   │
│   │ 12 │    │ 47 │    │$125,432│        │   │                       │   │
│   │Win:8│   │Win:32│  │ +2.3%  │        │   └───────────────────────┘   │
│   │Los:4│   │Los:15│  │ Today  │        │                               │
│   └────┘    └────┘    └────────┘        │                               │
│                                         │                               │
│   Avg Gain/Target: +$1,240  |  Daily: +$890 / -$340  |  vs SPY: +1.2%  │
└─────────────────────────────────────────┴───────────────────────────────┘
```

**Main Video Screen (Left ~65%):**

| Metric | Display |
|--------|---------|
| 30-Day Chart | Account performance graph (like arena replay screen) |
| Target Count | Total active Targets |
| Winning Targets | Count with green indicator |
| Losing Targets | Count with red indicator |
| Shot Count | Total active Shots |
| Shot Win/Loss | Win count / Loss count |
| Account Value | Current portfolio value |
| Account Performance | % change (today, week, month) |
| Avg Gain/Target | Average $ or % gain per Target |
| Daily Gains | Today's realized gains |
| Daily Losses | Today's realized losses |
| vs NPC (SPY) | Alpha generated today |

**Side Video Board (Right ~35%):**

Carousel rotation of lists:
- "Today's Top Gainers" (best performing Shots)
- "Today's Top Losers" (worst performing Shots)
- "Top Active Targets" (most $ at stake)
- "Hot Streaks" (consecutive wins)
- "Expiring Soon" (Aims near target date)
- "NPC Battles" (you vs S&P today)

**LED Aesthetic:**
- Seven-segment / dot-matrix font for numbers
- Glow effects on changing values
- Amber/orange for primary numbers
- Green for gains, Red for losses
- Subtle animation on score changes

### Page Layout Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARENA BACKGROUND (full viewport)                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              SCOREBOARD HERO (Jumbotron) - 80-90% width           │  │
│  │         Aggregate Account Data • Charts • Carousel Lists          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      TARGETS SECTION                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │  │
│  │  │  Target 1   │  │  Target 2   │  │  Target 3   │   ...          │  │
│  │  │  AI Thesis  │  │  EV Thesis  │  │  Macro Play │                │  │
│  │  │  3 Aims     │  │  2 Aims     │  │  1 Aim      │                │  │
│  │  │  +12.3%     │  │  -2.1%      │  │  +8.7%      │                │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                      RECENT ACTIVITY                               │  │
│  │  Shot fired • Aim hit target • Achievement unlocked • etc.        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Scroll Behavior:**
- Scoreboard stays at top (potentially sticky on scroll)
- Targets section scrolls with content
- Arena background creates parallax or fixed effect

---

### 3. Center Court Logo
The reference shows a powerful logo concept:
- **Target/Bullseye** - Fits our "Target" terminology
- **Green Upward Arrow** - Stock growth, winning
- **Candlestick Bars** - Trading/market visual
- **"O" Shape** - Outvestments branding
- **Green/Gold Colors** - Money, success, premium feel

### 4. Hardwood Floor
- Classic basketball court wood grain
- Reflective surface
- Court markings/lines visible
- Creates authenticity

### 5. Crowd/Atmosphere
- Blurred crowd in stands
- Creates energy and stakes
- Suggests "people are watching"
- Stadium lighting with bokeh effects

---

## Color Palette (from reference)

| Element | Color | Hex (approx) |
|---------|-------|--------------|
| Scoreboard BG | Dark Navy/Black | #1a1a2e |
| Score Numbers | Orange/Amber LED | #ff9500 |
| Clock | Green LED | #00ff00 |
| Logo Green | Forest/Money Green | #2d8a4e |
| Logo Gold | Trophy Gold | #d4af37 |
| Wood Floor | Warm Maple | #c19a6b |
| Arena Lights | White/Warm | #fff5e6 |

---

## Implementation Approach (MVP)

### Layered Composition
```
Layer 3 (top):    SVG Scoreboard (dynamic, data-driven)
Layer 2:          UI Components (cards, buttons, etc.)
Layer 1 (base):   Arena Background (no scoreboard in image)
```

**Key Decision:** Use arena background WITHOUT scoreboard baked in, then overlay custom SVG scoreboard. This allows:
- Dynamic data in scoreboard
- Responsive scoreboard sizing
- Animation/transitions on score changes
- Consistent styling with rest of app

### Phase 1 (MVP - Stock + CSS)
1. **Background:** Arena image WITHOUT scoreboard (crowd, court, lights only)
2. **Scoreboard:** Custom SVG/CSS component with LED font (SEPARATE layer)
3. **Floor:** Stock hardwood texture as base layer
4. **Logo:** SVG version of target/arrow/chart concept

### Phase 2 (Custom Assets)
1. **AI-Generated:** Custom arena backgrounds via Hugging Face MCP
2. **Custom Logo:** Professional vector version
3. **Animations:** Crowd movement, light effects
4. **Sound:** Arena ambiance (optional)

---

## Technical Notes

- Scoreboard must be dynamic (real data)
- LED font for numbers (Seven Segment or similar)
- Consider dark mode only (arena lighting works best)
- Mobile: Scoreboard should stack/simplify
- Performance: Lazy load background assets

---

## Questions for Team

1. Should the "arena view" be the entire dashboard or just a section?
2. How do we handle the scoreboard on mobile?
3. Do we want ambient crowd sounds? (Phase 2+)
4. Should we animate score changes?

---

## Related Documents

- [UX Design Specification](../planning-artifacts/ux-design-specification.md)
- [Future Enhancements - Phase 3](../planning-artifacts/future-enhancements-phase3.md) - See #13 for Hugging Face MCP

---

*Reference image provided by Matt, 2025-12-27*
