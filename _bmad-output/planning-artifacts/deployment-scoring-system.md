# Deployment Plan: 4-Level Scoring System

**Status:** Ready for Execution
**Created:** 2025-12-31
**Risk Level:** LOW (additive changes only)

---

## Summary

Deploy the completed 4-level hierarchical scoring system to production. All code is written, tested, and builds successfully.

**What's Being Deployed:**
- 4-level scoring hierarchy (User → Target → Aim → Shot)
- Centered -50 to +50 scale where 0 = market baseline (C grade)
- Letter grades: FFF → AAA (16 tiers)
- Database tables for persistent scoring
- UI components for score display
- Integration with shot/aim close actions

---

## Pre-Deployment Checklist

| Item | Status | Notes |
|------|--------|-------|
| Build passes | ✅ | 7.4s compile, all TypeScript checks pass |
| Tests pass | ✅ | 111 tests passing |
| Code complete | ✅ | 3,938 lines scoring logic + 6 UI components |
| Git committed | ✅ | Commit 4d19096 on main branch |
| Documentation updated | ✅ | PRD, epics, architecture, product brief |

---

## Deployment Steps

### Step 1: Push to Remote Repository
```bash
cd /home/mgerasolo/Dev/outvestments
git push origin main
```

**Verify:** `git log --oneline -1` should show:
```
4d19096 feat: Add 4-level hierarchical scoring system
```

### Step 2: Apply Database Migration

The database runs inside Docker on stark (10.0.0.31). Run migration from inside the container:

**Option A: Via Docker exec on stark**
```bash
ssh stark
docker exec -it outvestments-app-1 npx drizzle-kit push --force
```

**Option B: Via Portainer console**
1. Go to Portainer: http://10.0.0.28:9000
2. Navigate to: Containers → outvestments-app-1 → Console
3. Run: `npx drizzle-kit push --force`

**Option C: Modify DATABASE_URL temporarily for local push**
```bash
# On local dev machine, temporarily use stark's IP
DATABASE_URL=postgresql://outvestments:nlkQwrpqMdsrkJXVSfICncGg@10.0.0.31:5432/outvestments npx drizzle-kit push --force
```

**Migration creates:**
- 4 new tables: `aim_scores`, `shot_scores`, `target_scores`, `user_career_scores`
- 4 new enums: `letter_grade`, `risk_grade`, `risk_plan_quality`, `execution_discipline`
- Foreign keys with cascade deletes
- Indexes for query performance

**Verify migration success:**
```sql
-- Connect to PostgreSQL and verify tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%scores%';
```

Expected output:
```
 table_name
-------------------
 aim_scores
 shot_scores
 target_scores
 user_career_scores
```

### Step 3: Build Docker Image

```bash
cd /home/mgerasolo/Dev/outvestments

# Build the image
docker build -t mgerasolo/outvestments:latest .

# Push to Docker Hub
docker push mgerasolo/outvestments:latest
```

**Verify:** `docker images | grep outvestments` should show fresh timestamp

### Step 4: Redeploy via Portainer

**Option A: Via Portainer API**
```bash
source ~/Infrastructure/scripts/secrets.sh
curl -X POST "http://10.0.0.28:9000/api/stacks/13/git/redeploy" \
  -H "X-API-Key: $PORTAINER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pullImage": true}'
```

**Option B: Via Portainer UI**
1. Go to: http://10.0.0.28:9000
2. Navigate to: Stacks → outvestments
3. Click: "Pull and redeploy"

**Stack Details:**
- Stack ID: 13
- Target VM: stark (10.0.0.31)
- Port: 3155
- URL: https://dev.outvestments.com

### Step 5: Verify Deployment

**Health Check:**
```bash
curl -s https://dev.outvestments.com/api/health | jq
```

Expected: `{"status": "ok"}`

**Database Tables Check:**
```bash
ssh stark
docker exec outvestments-postgres-1 psql -U outvestments -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%scores%';"
```

**Application Logs:**
```bash
# Via Portainer or direct
docker logs outvestments-app-1 --tail 50
```

---

## File Reference

### Scoring Module (`src/lib/scoring/`)
| File | Purpose |
|------|---------|
| `types.ts` | TypeScript interfaces for all scoring structures |
| `constants.ts` | Weights, grade mappings, interpolation points |
| `grade-mapper.ts` | Score to letter grade (FFF→AAA, 16 tiers) |
| `interpolators.ts` | Smooth interpolation for magnitude/forecast |
| `risk-assessor.ts` | Risk plan + execution discipline scoring |
| `aim-scorer.ts` | 4 metrics + difficulty calculation |
| `shot-scorer.ts` | 4 metrics + risk multiplier + adaptability |
| `target-scorer.ts` | Aggregation with P&L metrics |
| `user-scorer.ts` | Career-level aggregation |
| `index.ts` | Module exports |

### Server Actions (`src/app/actions/scoring.ts`)
- `calculateAndStoreAimScore(aimId)` - Called when aim closes
- `calculateAndStoreShotScore(shotId)` - Called when shot closes
- `recalculateTargetScore(targetId)` - Cascades from aim/shot scores
- `recalculateUserCareerScores(userId)` - Cascades from target scores

### UI Components (`src/components/scoring/`)
| Component | Purpose |
|-----------|---------|
| `ScoreBadge.tsx` | Letter grade badge (FFF→AAA) |
| `DifficultyBadge.tsx` | Video game-style difficulty indicator |
| `MetricBar.tsx` | Centered horizontal bar (-50 to +50) |
| `AimScorecard.tsx` | Full aim scorecard with metrics |
| `ShotScorecard.tsx` | Shot scorecard with risk/adaptability |
| `TargetScorecard.tsx` | Dual scores + P&L summary |
| `UserScorecard.tsx` | Career stats with experience progress |

### Database Schema (`src/lib/db/schema.ts`)
**New Tables:**
- `aim_scores` - Primary scoring with 4 metrics + difficulty
- `shot_scores` - Execution scoring with risk multiplier
- `target_scores` - Aggregated prediction + performance scores
- `user_career_scores` - Career-level rollups

**New Enums:**
- `letter_grade` - AAA, AA, A, BBB, BB, B, CCC, CC, C, DDD, DD, D, FFF, FF, F
- `risk_grade` - A, B, C, D, F
- `risk_plan_quality` - comprehensive, good, basic, minimal, none
- `execution_discipline` - strict, mostly, partial, poor, absent

### Integration Points
- `src/app/actions/shots.ts:1303,1363` - Calls `calculateAndStoreShotScore()` on close
- `src/app/actions/aims.ts:17` - Imports and uses `calculateAndStoreAimScore()`

---

## Scoring System Details

### Aim Level (PRIMARY) - 4 Metrics
| Metric | Weight | Description |
|--------|--------|-------------|
| Directional Accuracy | 20% | Did price move in predicted direction? |
| Magnitude Accuracy | 30% | How close to target price? |
| Forecast Edge | 35% | How much did you beat the market? |
| Thesis Validity | 15% | Did your thesis play out? (capped at 0 if no risks documented) |

**Difficulty** is displayed independently, NOT multiplied into final score.

### Shot Level - 4 Metrics + Risk
| Metric | Weight | Description |
|--------|--------|-------------|
| Performance Score | 45% | Raw % return normalized |
| Shot Forecast Edge | 35% | Alpha vs market |
| Perfect Shot Capture | 20% | Entry/exit timing quality |
| Risk Mitigation | — | Risk multiplier (0.70× to 1.10×) |

**Adaptability Bonus:** +5 to +15 points for mid-trade adjustments (Pro tier)

### Target Level - Dual Scores
- **Prediction Score:** Weighted average of aim scores
- **Performance Score:** Weighted average of shot scores
- **P&L Metrics:** Total dollars, percent return, win ratio

### User Level - Career Rollups
- Aggregates all target scores
- Tracks total aims/shots scored
- Career P&L accumulation

---

## Rollback Plan

If issues arise:
1. Redeploy previous Docker image: `mgerasolo/outvestments:previous-tag`
2. Database changes are additive (new tables only) - no destructive rollback needed
3. Scoring triggers fail gracefully (try/catch in action handlers)

---

## Post-Deployment Tasks (Optional)

- [ ] Add scorecards to aim/shot detail pages in the UI
- [ ] Test scoring calculations with real trade data
- [ ] Monitor logs for scoring errors via Grafana/Loki
- [ ] Create Grafana dashboard for scoring metrics

---

## Environment Variables Required

All existing - no new env vars needed. Database connection uses existing `DATABASE_URL`.

---

## Verification Checklist

After deployment, verify:
- [ ] Health check returns `{"status": "ok"}`
- [ ] 4 new tables exist in PostgreSQL
- [ ] Application logs show no errors
- [ ] Closing a shot creates a record in `shot_scores`
- [ ] Closing an aim creates a record in `aim_scores`
