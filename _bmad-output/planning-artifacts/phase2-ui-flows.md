# Phase 2: UI Flows & User Journeys

**Version:** 1.0
**Status:** Ready for Implementation
**Last Updated:** 2025-12-30

## Overview

This document defines user flows for tier-related events: warnings, blocks, promo redemption, and tier management. Payment flows are deferred to Phase 4+.

---

## 1. Approaching Limit Warning (90%)

### Trigger
User creates their Nth item where N >= 90% of their limit.

### Flow

```
User creates 3rd target (Free tier limit: 3)
          ↓
System detects: 3/3 = 100% (actually at limit)
          ↓
For 90%+ (but not 100%): Show inline warning banner
          ↓
┌─────────────────────────────────────────────────────┐
│ ⚠️ You've used 3 of 3 targets.         [View Plans] │
└─────────────────────────────────────────────────────┘
```

### UI Specifications

| Element | Specification |
|---------|---------------|
| **Location** | Top of resource list page (above targets list, aims list, etc.) |
| **Style** | Warning variant (`bg-yellow-50 border-yellow-200`) |
| **Persistence** | Shown on every page load until resolved |
| **Dismissible** | No - persists until user upgrades or deletes items |
| **CTA** | "View Plans" → Links to `/settings/upgrade` |

### Example Implementation

```tsx
// Shown on /targets page when at 90%+ of limit
<Alert variant="warning" className="mb-4">
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription className="flex items-center justify-between">
    <span>You've used {current} of {limit} targets.</span>
    <Button variant="outline" size="sm" asChild>
      <Link href="/settings/upgrade">View Plans</Link>
    </Button>
  </AlertDescription>
</Alert>
```

---

## 2. Limit Reached Block (100%)

### Trigger
User attempts to create an item when already at their limit.

### Flow

```
User clicks "New Target" (already at 3/3)
          ↓
Client-side: Show modal immediately (optimistic)
          ↓
┌────────────────────────────────────────────────────┐
│  ⚡ Limit Reached                              [X] │
├────────────────────────────────────────────────────┤
│                                                    │
│  You've reached your limit of 3 targets on the    │
│  Free plan. Upgrade to Premium for up to 25       │
│  targets.                                         │
│                                                    │
│  [Maybe Later]                    [View Plans]    │
│                                                    │
└────────────────────────────────────────────────────┘
```

### UI Specifications

| Element | Specification |
|---------|---------------|
| **Type** | Modal dialog |
| **Trigger** | On click of "New X" button |
| **Primary CTA** | "View Plans" → `/settings/upgrade` |
| **Secondary CTA** | "Maybe Later" → Closes modal |
| **Icon** | Lightning bolt (Zap) in yellow |
| **Tone** | Encouraging, not punitive |

### Server-Side Validation

Even with client-side blocking, always validate server-side:

```typescript
// In createTarget action
const { allowed, reason } = await canCreate(userId, "targets");
if (!allowed) {
  return { success: false, error: "LIMIT_REACHED", message: reason };
}
```

---

## 3. Premium Feature Access Denied

### Trigger
Free user attempts to access a Premium-only feature.

### Flow Options

**Option A: Blurred with Overlay (Visual Tease)**
```
User views dashboard with Alpaca widget
          ↓
Widget is visible but blurred
          ↓
┌─────────────────────────────────────────────┐
│        ░░░░░░░░░░░░░░░░░░░░░░░             │
│        ░░ Portfolio Value ░░░░             │
│        ░░░░ $45,230.00 ░░░░░░              │
│        ░░░░░░░░░░░░░░░░░░░░░░░             │
│   ┌─────────────────────────────────┐      │
│   │ 🔒 Alpaca Integration           │      │
│   │    requires Premium             │      │
│   │        [Upgrade]                │      │
│   └─────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

**Option B: Hidden Entirely**
```
Feature not rendered at all for free users
```

**Option C: Disabled Button/Link**
```
┌──────────────────────────────┐
│ 🔒 Connect Alpaca (Premium)  │  ← Disabled, shows tooltip on hover
└──────────────────────────────┘
```

### Recommended: Option A for high-value features, Option C for buttons

---

## 4. Promo Code Redemption

### Trigger
User enters a promo code on the upgrade page or settings.

### Flow

```
User navigates to /settings/upgrade or /redeem
          ↓
User sees promo code input field
          ↓
┌─────────────────────────────────────────────────────┐
│  Have a promo code?                                 │
│  ┌────────────────────────────┐  [Apply]           │
│  │ LAUNCH2025                 │                    │
│  └────────────────────────────┘                    │
└─────────────────────────────────────────────────────┘
          ↓
User enters code and clicks Apply
          ↓
[Loading state: "Validating..."]
          ↓
┌─ SUCCESS ─────────────────────────────────────────────┐
│  ✅ Code applied!                                     │
│                                                       │
│  You now have Premium access until Jan 15, 2025.     │
│                                                       │
│                                   [Start Exploring]   │
└───────────────────────────────────────────────────────┘
          ↓
OR
          ↓
┌─ ERROR ───────────────────────────────────────────────┐
│  ❌ Invalid code                                      │
│                                                       │
│  This code doesn't exist or has expired.             │
└───────────────────────────────────────────────────────┘
```

### Error States

| Error | Message |
|-------|---------|
| Invalid code | "This code doesn't exist or has expired." |
| Already redeemed | "You've already used this code." |
| Max uses reached | "This code has reached its maximum uses." |
| Not eligible | "This code is only for new users." |
| Higher tier required | "This code requires Premium tier." |

---

## 5. Trial Activation

### Trigger
New user signs up (if trials are enabled) or admin grants trial.

### Flow

```
User completes signup
          ↓
System checks: Is trial enabled?
          ↓
YES → Assign tier: "premium", source: "trial", expires: +14 days
          ↓
Show welcome modal:
┌─────────────────────────────────────────────────────────┐
│  🎉 Welcome to Outvestments!                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  You have 14 days of Premium access to explore         │
│  all features. After that, you'll be on the Free       │
│  plan unless you upgrade.                              │
│                                                         │
│  Premium features you can try:                         │
│  • Alpaca integration for real-time trading            │
│  • Up to 25 active targets                             │
│  • Full 8-metric scoring                               │
│  • Extended trade history                              │
│                                                         │
│                              [Get Started]              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Trial Countdown Warning

### Trigger
User's trial is expiring within 3 days.

### Flow

```
User logs in with 3 days left on trial
          ↓
Show persistent banner (different from limit warning):
┌─────────────────────────────────────────────────────────┐
│ ⏰ Your Premium trial ends in 3 days.      [View Plans] │
└─────────────────────────────────────────────────────────┘
          ↓
Last day:
┌─────────────────────────────────────────────────────────┐
│ ⏰ Your Premium trial ends today!          [View Plans] │
└─────────────────────────────────────────────────────────┘
```

### UI Specifications

| Days Left | Banner Style | Message |
|-----------|--------------|---------|
| 3 days | Info (blue) | "Your Premium trial ends in 3 days." |
| 2 days | Warning (yellow) | "Your Premium trial ends in 2 days." |
| 1 day | Warning (yellow) | "Your Premium trial ends tomorrow!" |
| Today | Destructive (red) | "Your Premium trial ends today!" |

---

## 7. Trial/Promo Expired → Downgrade

### Trigger
User's tier expires (background job or on-demand check).

### Flow

```
User logs in after trial expired
          ↓
System detects: tierExpiresAt < now
          ↓
Update tier to "free", tierSource to "default"
          ↓
Show one-time modal:
┌─────────────────────────────────────────────────────────┐
│  Your Premium Access Has Ended                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  You're now on the Free plan. Your data is safe,       │
│  but some features are now limited:                    │
│                                                         │
│  • Active targets: 25 → 3                              │
│  • Alpaca integration: Disabled                        │
│  • History retention: 1 year → 90 days                 │
│                                                         │
│  Upgrade anytime to restore full access.               │
│                                                         │
│  [Continue on Free]              [Upgrade Now]         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Data Handling on Downgrade

| Resource | Behavior |
|----------|----------|
| Targets over limit | Kept but marked "archived" |
| Aims over limit | Kept, viewable, can't add new |
| Shots over limit | Kept, viewable, can't add new |
| Alpaca connection | Disconnected automatically |
| History > 90 days | Still viewable but exports limited |

---

## 8. Referral Link Sharing

### Trigger
User clicks "Share" or views referral section in settings.

### Flow

```
User navigates to /settings/referrals
          ↓
┌─────────────────────────────────────────────────────────┐
│  Invite Friends                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Your referral link:                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ https://outvestments.com/r/MATT2025             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Copy Link]  [Share on Twitter]  [Share on LinkedIn] │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Your Referrals                                        │
│  ┌───────────────────────────────────────────────┐     │
│  │ Name          │ Signed Up   │ Status         │     │
│  ├───────────────────────────────────────────────┤     │
│  │ John D.       │ Dec 28      │ Active         │     │
│  │ Sarah M.      │ Dec 25      │ Active         │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  (Referral rewards coming soon!)                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Upgrade Page (Pre-Stripe)

### Location
`/settings/upgrade`

### Content

```
┌─────────────────────────────────────────────────────────┐
│  Upgrade Your Plan                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─ FREE (Current) ──┐ ┌─ PREMIUM ───────┐ ┌─ PLUS ──┐ │
│  │                   │ │                  │ │          │ │
│  │ 3 targets         │ │ 25 targets       │ │ Unlimited│ │
│  │ 5 aims/target     │ │ 15 aims/target   │ │ Unlimited│ │
│  │ Basic scoring     │ │ Full scoring     │ │ Full +AI │ │
│  │ 90-day history    │ │ 1-year history   │ │ Unlimited│ │
│  │                   │ │ Alpaca trading   │ │ API      │ │
│  │                   │ │                  │ │          │ │
│  │ [Current Plan]    │ │ Coming Soon      │ │ Coming   │ │
│  │                   │ │ [Join Waitlist]  │ │ Soon     │ │
│  │                   │ │                  │ │          │ │
│  └───────────────────┘ └──────────────────┘ └──────────┘ │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Have a promo code?                                     │
│  ┌────────────────────────────┐  [Apply]               │
│  │                            │                        │
│  └────────────────────────────┘                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Admin: Grant Tier to User

### Location
`/admin/users/[id]` (Admin only)

### Flow

```
Admin views user profile
          ↓
Admin selects tier and duration
          ↓
┌─────────────────────────────────────────────────────────┐
│  Grant Tier                                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User: john@example.com                                │
│  Current: Free (default)                               │
│                                                         │
│  Grant Tier:                                           │
│  ○ Premium  ● Premium Plus                             │
│                                                         │
│  Duration:                                             │
│  ○ 7 days  ○ 14 days  ○ 30 days  ○ 90 days  ○ 1 year  │
│                                                         │
│  Reason (internal note):                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Beta tester reward                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│                           [Cancel]    [Grant Tier]     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Admin: Global Tier Override

### Location
`/admin/settings` (Admin only)

### Flow

```
Admin wants to give everyone Premium for a week
          ↓
┌─────────────────────────────────────────────────────────┐
│  Global Tier Override                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⚠️ This overrides ALL user tiers system-wide.         │
│                                                         │
│  Current Status: [No override active]                  │
│                                                         │
│  Set Override:                                         │
│  Tier:  ○ Premium  ○ Premium Plus                      │
│                                                         │
│  Expires:                                              │
│  ┌─────────────────┐                                   │
│  │ 2025-01-07      │ (7 days from now)                 │
│  └─────────────────┘                                   │
│                                                         │
│  [Cancel]                        [Activate Override]   │
│                                                         │
└─────────────────────────────────────────────────────────┘
          ↓
After activation:
┌─────────────────────────────────────────────────────────┐
│  Global Tier Override                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✅ Override Active                                     │
│                                                         │
│  All users have: Premium                               │
│  Until: January 7, 2025 at 11:59 PM                    │
│                                                         │
│                              [Clear Override]          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Flow Summary Table

| Flow | Trigger | UI Element | CTA |
|------|---------|------------|-----|
| 90% Warning | Create item at 90%+ | Inline banner | View Plans |
| 100% Block | Create at limit | Modal | View Plans / Maybe Later |
| Feature Denied | Access premium feature | Blurred overlay / disabled | Upgrade |
| Promo Redemption | Enter code | Input + success/error | Apply |
| Trial Start | New signup | Welcome modal | Get Started |
| Trial Warning | 3 days left | Persistent banner | View Plans |
| Trial Expired | Tier expires | One-time modal | Upgrade / Continue Free |
| Referral Share | View referrals | Link + copy button | Copy / Share |
| Upgrade Page | Navigate | Tier comparison | Join Waitlist |
| Admin Grant | Admin action | Form modal | Grant Tier |
| Global Override | Admin action | Settings panel | Activate / Clear |
