You're building Outvestments (outvestments.com), a gamified stock trading 
platform with a sports arena aesthetic. NOT a traditional SaaS dashboard.

CORE DESIGN CONSTRAINT:
This should feel like a Madden/NBA 2K arena scoreboard, not a finance app.
Avoid shadcn/ui defaults, generic Tailwind patterns, or traditional finance layouts.
Think: ESPN scoreboard, esports overlay, sports video game menus.

BRAND:
- Logo File: imports/images/outvestment_logo1-512x512.png
- Logo: Green upward arrow + target + candlestick in "O" shape
- Colors: Gold/amber LED scoreboard numbers, deep navy/black background,
  forest green accents, red for losses/misses
- Fonts: Seven-segment/LED style for big numbers, sporty sans-serif for labels
- Aesthetic: Dark arena with crowd, wooden court floor, stadium lighting, glow effects

CORE HIERARCHY (forced discipline):
- TARGET: Your investment thesis (the WHY)
- AIM: Specific ticker + price target + date (the WHAT)
- SHOT: The actual trade execution (the HOW)

OPENING DASHBOARD STRUCTURE (DO NOT deviate into standard grids):
1. SCOREBOARD HERO (top, 80-90% width, like arena jumbotron)
   - Left: 30-day account performance chart (bar or line)
   - Center: Big stats (Targets, Shots, Account Value, Daily +/-)
   - Right: Carousel lists (Today's Top Gainers, Hot Streaks, Expiring Soon)
   - LED-style fonts with glow on numbers
   - NO rounded card corners. Use sharp angles, thick borders, glowing edges.

2. TARGETS SECTION (below scoreboard)
   - Angled cards (not rectangles) for each active Target
   - Show thesis preview + # of Aims + performance %
   - Team-card aesthetic (like fantasy sports cards)
   - Diagonal cuts on edges, not bevels

3. FLOATING SIDEBAR (left edge)
   - Icon-based nav (scoreboard, targets, shots, history)
   - Glows on hover, flyouts slide from left
   - Avatar/settings at bottom

4. LEADERBOARD VIEW (separate page)
   - Treat like sports league standings
   - Rows = users/traders, columns = Prediction/Performance/Boldness/Alpha scores
   - Seed rankings, mini logos, color-coded bars
   - NOT a boring data table

CRITICAL "DON'Ts":
- DON'T use standard Tailwind grid layouts (12-col, etc.)
- DON'T use shadcn card components unmodified
- DON'T center align body text (sports UI doesn't)
- DON'T use pastel/light backgrounds (too SaaS)
- DON'T use minimal spacing (feel dense, data-rich like scoreboards)
- DON'T use horizontal nav tabs
- DON'T use modal dialogs (use full-screen overlays or side panels)

ANIMATION/INTERACTION:
- Heavy stagger animations on page load (tiles drop/slide like game menus)
- Number animations counting up to new values
- Hover states with scale + glow, not just color change
- Subtle parallax on arena background
- Confetti or celebratory animation on target hits

STARTING POINT:
Build the Dashboard homepage. Include:
- Arena background image (use placeholder or simple gradient dark navy)
- Scoreboard hero component with mock data
- Targets section with 2-3 sample target cards
- Left sidebar with navigation

Use Next.js, vanilla CSS (not Tailwind utilities; custom classNames OK), 
and HTML/SVG for precision control.

Do NOT ask for clarification. Build this now with creative ownership.
Use your best judgment on dimensions, spacing, and interactions
to make this feel like a premium sports gaming experience, not enterprise software.

DATA DENSITY EXPECTATIONS:

The HUD cards should pack: ticker, entry/exit, target, countdown, 
mini chart, P/L, PPD, pace status, and accuracy - all readable 
at a glance but NO wasted space.

Leaderboard should fit 15-20 rows of traders on screen (not scrolling 
after 5 rows). Each row = Seed, Name, W/L, Accuracy, Performance, 
PPD, Alpha, Streak, Trend. Column widths are tight; typography is 
bold and angular.

Think: Bloomberg terminal + esports overlay, not: Figma dashboard.
