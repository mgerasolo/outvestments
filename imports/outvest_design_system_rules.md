https://www.perplexity.ai/search/27a8df6f-7# Outvestments Design System & Brand Execution Guide
**For Claude Code & Future Development**

---

## PHILOSOPHY: "Arena First, Always"

This isn't a financial platform that happens to look like a game. **It IS a game that happens to be about trading.**

Every page, every component, every interaction should make you feel like you're in a competitive arena environment where your predictions are on the scoreboard and everyone can see your track record.

---

## VISUAL LANGUAGE (Non-Negotiable)

### Color Palette

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Arena Background** | Deep Navy | `#0f1419` | All page backgrounds |
| **Card Borders** | Gold/Amber | `#d4af37` | Primary UI element frames |
| **Scoreboard Numbers** | LED Amber | `#ff9500` | Large KPI numbers |
| **Win/Gain Indicator** | Neon Green | `#00ff41` | Positive performance, up trends |
| **Loss/Miss Indicator** | Bright Red | `#ff3333` | Negative performance, down trends |
| **Accent/Alert** | Cyan | `#00d4ff` | Secondary calls to action, warnings |
| **Accent/Secondary** | Purple | `#b624ff` | Tertiary data, hover states |
| **Crowd Shadows** | Very Dark Navy | `#0a0e13` | Darkest background layers |
| **Text Primary** | Off-White | `#f5f5f5` | Main readable text |
| **Text Secondary** | Muted Gray | `#a0a0a0` | Labels, hints, secondary text |

**DO NOT use:** Pastels, soft grays, whites, light backgrounds, mint/sage green, soft blues.

### Typography

| Use Case | Font Choice | Style | Example |
|----------|-------------|-------|---------|
| **Large Numbers (PPD, Scores)** | Seven-Segment or LED Font (if available; fallback: `IBM Plex Mono` bold) | Monospace, bold, all-caps for big numbers | `1.24 PPD` / `$127K` |
| **Labels / Secondary Text** | `Inter`, `Roboto Mono`, or system sans | Bold, 11-14px, tight letter-spacing | `PREDICTION` `ACCURACY` |
| **Body / Card Content** | `Inter` or `-apple-system` | 13-16px, normal weight | Thesis text, descriptions |
| **Headings / Section Titles** | `Inter` bold or `IBM Plex Sans` bold | 18-24px, tight tracking, all-caps for emphasis | `SCOREBOARD` `MY TARGETS` |
| **Countdown / Time** | Seven-Segment or `IBM Plex Mono` | Bold, monospace | `42d 16h 32m` |

**Enforce:** No soft/light fonts. No serif fonts except maybe occasional decorative use. Prioritize **readability at speed** (user is scanning, not reading prose).

### Shape Language

| Element | Shape | NOT This |
|---------|-------|----------|
| **Card Corners** | Sharp (0-2px radius, if any) OR 45Â° diagonal cuts | Rounded (8px+) |
| **Button Corners** | Sharp or beveled | Soft rounded |
| **Card Edges** | Thick borders (2-3px) + glowing border effect | Subtle shadows |
| **Panels** | Angled/rotated slightly (5-10Â°) OR diagonal cuts on corners | Perfectly aligned grids |
| **Icons** | Bold stroke weight (2-3px), sharp angles | Thin, delicate strokes |

**Enforce:** Geometry, not softness. Edges, not curves. Think blueprint/technical drawing, not UI design from Dribbble.

### Glow & Light Effects

| Effect | When Used | Implementation |
|--------|-----------|-----------------|
| **Border Glow** | Winning trades, active selections | `box-shadow: 0 0 20px rgba(0, 255, 65, 0.4)` (green) |
| **Number Glow** | Big KPI changes, animated updates | Text-shadow or filtered glow on large numbers |
| **Hover Glow** | Buttons, nav icons, interactable cards | Subtle green/cyan glow on hover |
| **Background Glow** | Behind important sections (scoreboard, leaderboard) | Very faint radial glow, not overwhelming |
| **Red Alert Glow** | Losing positions, missed targets | `box-shadow: 0 0 15px rgba(255, 51, 51, 0.3)` |

**Enforce:** Glow is subtle but visible. Not neon overdose, but noticeably "lit."

---

## LAYOUT PRINCIPLES (Non-Negotiable)

### Spacing & Density

- **Dense, not airy.** A scoreboard is packed with data. Apply that philosophy everywhere.
- **Minimum padding:** 12px inside cards (not 24px+)
- **Tight columns:** Data columns are 80-120px, not sprawling
- **No giant whitespace:** If there's blank space, fill it with secondary data, indicators, or micro-charts
- **Mobile:** Stack ruthlessly, but don't add padding; compress instead

### Grid & Structure

- **No 12-column grid.** Not that kind of app.
- **Use CSS Grid for dense layouts**, not Flexbox for everything
- **Sidebar (fixed left):** ~80px wide, icon-based nav
- **Main content area:** Fills remaining space, never centered
- **Right panel (optional):** Narrow (~160-200px) for alerts/trends
- **Top bar:** Scoreboard hero, 80-90% viewport width, sticky or fixed

### Navigation

| Location | Behavior | NOT This |
|----------|----------|----------|
| **Left Sidebar** | Floating icons, flyouts on hover/click, glows on active | Horizontal top nav, tabs |
| **Flyout Menus** | Slide from left, semi-transparent dark background | Traditional popovers, centered modals |
| **Mobile Nav** | Bottom nav bar (same icons) OR full-screen overlay | Hamburger into list, top tabs |
| **Page Titles** | Large text in content area, not in header bar | Breadcrumbs, page titles in nav |

**Enforce:** No horizontal tabs. No centered dialogs. No breadcrumbs.

---

## COMPONENT PATTERNS

### Scoreboard Hero (Top Bar)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [Left: User Stats] | [Center: Primary KPIs] | [Right: Time] â”‚
â”‚ Name, Avatar       | Account Value, PPD,    | Session Timer â”‚
â”‚ Win/Loss Record    | Daily Change, Accuracy | Market Status â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Rules:**
- Always visible (sticky or fixed)
- LED-style fonts for numbers
- Gold borders, dark background
- Updates animate (numbers count up/down, colors shift)
- No dropdowns from scoreboard; it's display-only

### Data Cards (Targets, Shots, etc.)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [Header: Ticker/Title]  â”‚  â† Bold, uppercase, or mix case
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Dense Data Grid]       â”‚  â† Rows of label:value, no padding
â”‚ Entry: $150 | Now: $162 â”‚
â”‚ Target: $180 | 42d left â”‚
â”‚ PPD: 1.24 | Acc: 87%    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Mini Chart OR Bars]    â”‚  â† Sparkline or status bar
â”‚ [Interaction Row]       â”‚  â† Small buttons or indicators
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Rules:**
- Thick gold/colored borders (2-3px)
- Sharp corners or 45Â° cuts on corners
- No rounded corners
- Glowing border if winning/active
- Angled slightly (5Â°) or offset from grid for visual interest

### Leaderboard Table

**Columns:** Seed | Name | W/L | Accuracy | Performance | PPD | Alpha | Streak | Trend

**Row Height:** 48-56px (tall enough for data, compact)
**Column Width:** Tight (80-120px per column typically)
**Top 3:** Highlight with medal icons, subtle glow, different background color
**Current User:** Bold gold border
**Hover:** Very subtle background color shift, no full row highlight

**Rules:**
- NOT a spreadsheet. Think sports league standings.
- All text is aligned left (not center).
- Numbers are right-aligned within their columns.
- No alternating row colors; use very subtle background shifts.

### Status Indicators

| Status | Visual | Color |
|--------|--------|-------|
| **Winning/On Track** | âœ“ or â–² | Neon Green |
| **Losing/Off Track** | âœ— or â–¼ | Bright Red |
| **Neutral/Watching** | â—† or â€” | Gray |
| **Alert/Action Needed** | ! or âš  | Cyan |
| **Achievement/Hot** | â­ or ðŸ”¥ | Gold |

**Enforce:** Icons are simple, bold, monochrome. Not emoji. Not cute graphics.

---

## INTERACTION & ANIMATION

### Page Transitions

- **Load:** Tiles/cards drop or slide in with stagger timing (50-100ms between each)
- **Nav:** Sidebar icons glow, flyouts slide from left, no fade (too soft)
- **Data Update:** Numbers count up/down, not jump; colors animate smoothly over 200-300ms

### Micro-interactions

| Action | Animation | Duration |
|--------|-----------|----------|
| **Hover Button** | Scale 1.05, glow appears | 150ms |
| **Click Card** | Quick scale (0.98) then back | 100ms |
| **Number Change** | Count animation + color tint | 300ms |
| **Success State** | Subtle bounce + green flash | 400ms |
| **Error State** | Shake + red glow | 300ms |

**Enforce:** Animations are snappy, not laggy. Use `ease-out` for most animations. No bouncy easing (cubic-bezier).

### Hover States

- **Buttons:** Glow appears, text brightens slightly, no color change alone
- **Cards:** Subtle scale (1.02) + border glow, background darkens slightly
- **Rows (Leaderboard):** Very subtle background shift, no full highlight
- **Icons:** Glow in accent color (cyan or green)

---

## CONTENT VOICE & COPY

### Section Titles

- **ALL-CAPS, bold, tight tracking**
- Examples: `MY TARGETS` / `ACTIVE SHOTS` / `LEADERBOARD` / `YOUR SCORECARD`
- Use `:` for labels like `PREDICTION: 87%` or `PPD: 1.24`

### Labels & Descriptions

- **Short, direct, no fluff**
- Examples: `Entry $150` not `Your entry price was $150`
- Use abbreviations: `PPD`, `PnL`, `Acc`, `Perf`, `W/L`
- **Numbers first:** `+$340` not `You made $340`

### Error Messages & Alerts

- **Direct and actionable:** `Need Target first` not `You must create a target before...`
- **Show the fix:** `[ Create Target ]` button embedded in message
- **Use color:** Red background for error, cyan for info, gold for success

---

## LANDING PAGE APPLICATION

The entire landing page should **preview the arena experience**, not explain it:

### Hero Section
- **Background:** Arena image (court visible, crowd blurred, lights overhead)
- **Overlay:** Scoreboard mockup showing fictional trader leaderboard
- **CTA Button:** "PULL THE TRIGGER" (gold, thick border, glow on hover)
- **Headline:** `OUTVEST THE REST` (all caps, LED font, gold)
- **Subheading:** "Prove Your Edge. Track Everything. Beat the Market." (smaller, bold)

### Value Propositions (as Card Deck)

Instead of written bullets, show **visual examples**:
- Card 1: "Thesis Documentation" â†’ Image of Target creation screen
- Card 2: "Real-Time Scoring" â†’ Image of scoreboard with PPD metrics
- Card 3: "Leaderboard Competition" â†’ Image of dense trader standings
- Card 4: "Opportunity Cost" â†’ Chart comparing user vs SPY

Each card is **angled**, has a **thick border**, and shows actual UI (not illustrations).

### Testimonials / Social Proof

Styled like **game leaderboard entries:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RANK #3 | TRADER_ALPHA          â”‚
â”‚ "Finally see my real edge"      â”‚
â”‚ +47% YTD | +$340 Alpha Generatedâ”‚
â”‚ [FOLLOW THIS TRADER]            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### CTA Section

- **Scoreboard mockup** showing empty player dashboard
- **Text overlay:** "Your scoreboard is waiting."
- **Button:** "START PAPER TRADING" (same styling as hero)

### Footer

Minimal. Just links in small bold text. Background same as arena (dark navy). No copyright fluff.

---

## MOBILE & RESPONSIVE

### Breakpoint Rules

| Device | Changes |
|--------|---------|
| **Desktop (1024px+)** | Full scoreboard hero, left sidebar, right panel visible |
| **Tablet (768-1024px)** | Scoreboard hero compresses, sidebar icons only, right panel hidden |
| **Mobile (< 768px)** | Scoreboard stacks (stats become vertical list), bottom nav, full-width cards |

### Mobile Card Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NVDA                 â”‚  â† Ticker (bold, large)
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Entry: $150          â”‚
â”‚ Now: $162 (+8%)      â”‚
â”‚ PPD: 1.24            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Small sparkline]    â”‚
â”‚ 42d left / +$340 gainâ”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Never:** Drop columns, hide data, make text tiny. Instead: **stack vertically, compress spacing.**

---

## DESIGN SYSTEM TOKENS (CSS Variables)

Store these in a central file so Claude Code doesn't invent colors:

```css
:root {
  /* Colors */
  --color-bg-arena: #0f1419;
  --color-bg-crowdShadow: #0a0e13;
  --color-border-gold: #d4af37;
  --color-text-led: #ff9500;
  --color-win: #00ff41;
  --color-loss: #ff3333;
  --color-alert: #00d4ff;
  --color-accent: #b624ff;
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #a0a0a0;

  /* Typography */
  --font-led: 'IBM Plex Mono', monospace;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;

  /* Border & Shadow */
  --border-card: 2px solid var(--color-border-gold);
  --glow-win: 0 0 20px rgba(0, 255, 65, 0.4);
  --glow-loss: 0 0 15px rgba(255, 51, 51, 0.3);

  /* Radius (keep minimal) */
  --radius-none: 0;
  --radius-sm: 2px;
  --radius-angled: 45deg (for clip-path);
}
```

---

## RED FLAGS (What Would Break the Vibe)

If Claude Code produces ANY of these, reject it:

- âŒ Rounded corners (border-radius > 4px)
- âŒ Pastel colors
- âŒ Serif fonts
- âŒ Centered text or layouts
- âŒ Large whitespace / airy padding
- âŒ Soft shadows instead of glows
- âŒ Horizontal nav tabs
- âŒ Modal dialogs (use full-screen overlays)
- âŒ "Coming Soon" placeholders
- âŒ Stock icons (use custom, bold strokes)
- âŒ Light backgrounds
- âŒ Hamburger menu on desktop
- âŒ Dropdown menus (use flyouts)
- âŒ Subtle hover effects (make them obvious)
- âŒ Generic "Dashboard" or "Portfolio" language (use "Scoreboard," "Arena," "Leaderboard")

---

## PROMPT TEMPLATE FOR CLAUDE CODE

Use this when requesting new pages/features:

```
Build [PAGE/COMPONENT] for Outvestments using the attached 
Design System (claude_design_system.md).

REQUIREMENTS:
1. Arena aesthetic: dark navy background, gold borders, glow effects
2. Data-dense layout: no wasted space, every pixel = information
3. Colors: use --color-* CSS variables only (no inventing colors)
4. Shapes: sharp corners or 45Â° angles (no soft rounded corners)
5. Typography: LED font for big numbers, Inter for body
6. Animations: stagger on load, glow on hover, number count-ups
7. Navigation: left sidebar with icons (not top nav)
8. Responsive: desktop (scoreboard hero + sidebar) â†’ mobile (bottom nav + stacked)

Reference images provided: [dense HUD] [leaderboard] [arena concept]

Do not deviate from this system. If you have design questions, 
default to "more arena, more data, more glow."
```

---

## SUCCESS CHECKLIST

When Claude Code finishes a page, verify:

- [ ] Dark navy background (not white, not light)
- [ ] Gold borders on cards/sections
- [ ] Green glows on winning/active elements
- [ ] Red glows on losing/alert elements
- [ ] Thick borders (2-3px minimum on cards)
- [ ] LED or monospace font for large numbers
- [ ] No rounded corners (or max 2px)
- [ ] Dense data layout (no empty space)
- [ ] Animations stagger on load
- [ ] Hover states have glow or scale
- [ ] All text readable at 1024px+ and mobile
- [ ] Left sidebar nav visible on desktop
- [ ] Bottom nav on mobile
- [ ] Color scheme matches provided palette
- [ ] No modal dialogs
- [ ] Copy is bold and short (not explanatory)

---

## EXAMPLES OF "RIGHT" vs "WRONG"

### Wrong (Generic SaaS)
```
Dashboard
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ My Portfolio                    â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Account      â”‚  â”‚ Today's  â”‚  â”‚
â”‚ â”‚ Value: $127K â”‚  â”‚ Change   â”‚  â”‚
â”‚ â”‚ +2.3%        â”‚  â”‚ +$2,340  â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                 â”‚
â”‚ Recent Trades                   â”‚
â”‚ â€¢ NVDA: +8%                     â”‚
â”‚ â€¢ MSFT: -2%                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Right (Arena Vibe)
```
SCOREBOARD
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TRADER_42 | ACCOUNT: $127K (+$2,340)  â”‚
â”‚ ACCURACY: 87% | PPD: 1.24 | vs SPY: +1.2%
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

[CARDS IN GRID, ANGLED, DENSE DATA]:
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NVDA â†‘       â”‚  â”‚ MSFT â†“       â”‚
â”‚ $150â†’$162    â”‚  â”‚ $380â†’$372    â”‚
â”‚ Tgt: $180    â”‚  â”‚ Tgt: $400    â”‚
â”‚ PPD: 1.24    â”‚  â”‚ PPD: -0.64   â”‚
â”‚ +42d left    â”‚  â”‚ -5d left     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## WHEN IN DOUBT

Ask: **"Would this feel at home in an esports broadcast or NBA 2K menu?"**

If the answer is no, it doesn't belong in Outvestments.

---

*This document is the single source of truth for Outvestments visual identity. Reference it for every page, component, and interaction. Pass it to Claude Code before every build.*