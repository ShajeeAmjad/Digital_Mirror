# Phase 7 — Polish & Remaining Screens

**Goal**: All 15 wireframe screens implemented. App is QA-ready for TestFlight.
Reference: all docs/, all previous task files for cross-cutting concerns

---

## 7.1 Home screen

- [ ] Implement `HomeScreen` (wireframe 4):
      - "Start a new look" CTA → `CameraUpload`
      - "Continue editing" section: last 3 saved looks (thumbnail + date)
      - "Picked for you" tutorials (from Phase 6 recommendations endpoint)
      - "Trending now" teaser (3 trend cards, "See all" → `TrendsFeed`)
      - Subscription upsell banner for free users (dismissible, max once per day, stored in MMKV)

## 7.2 Before/after export screen

- [ ] Implement `BeforeAfterExportScreen` (wireframe 10):
      - Side-by-side or swipeable before/after comparison (draggable divider using Reanimated)
      - "Save to camera roll": export the composite using `expo-media-library`
      - "Share": share sheet via `expo-sharing`
      - "Analyse with AI" CTA → `AICritique` (gated by PaywallGate)
      - "Back to editor" link

## 7.3 Profile screen

- [ ] Implement `ProfileScreen` (wireframe 14):
      - Display name, avatar (from Supabase Auth metadata or default initials)
      - Skin tone and face shape selectors (update via `PATCH /api/v1/auth/profile`)
      - Goals multi-select (same chips as GoalSelection)
      - Saved looks gallery (grid of thumbnails; tap to navigate to BeforeAfterExport)
      - Subscription status badge + "Manage subscription" link (opens RevenueCat management URL)
      - Sign out button

## 7.4 Trends feed screen (premium)

- [ ] Implement `TrendsFeedScreen` (wireframe 15) — gate with `PaywallGate`:
      - Vertically scrollable feed of trend cards
      - Each card: trend title, hero image, a "Try this look" CTA → Editor with pre-loaded layer config
      - Filter chips: Seasonal, Viral, Celebrity, Editorial
      - `GET /api/v1/trends` backend endpoint returning curated trend objects
        (seed with at least 8 manually curated trends)

## 7.5 Onboarding (GoalSelection screen fully wired)

- [ ] `GoalSelectionScreen` (wireframe 3):
      - Shown only once after first sign-up (check `profiles.goals IS NULL`)
      - On "Continue": `PATCH /api/v1/auth/profile` with selected goals + face shape + skin tone
      - Navigate to `Home`

## 7.6 Performance audit

- [ ] Profile Skia canvas with React Native Performance Monitor:
      - Editor with 5 active layers must maintain ≥ 55fps on iPhone 12 and equivalent Android
      - If below target: move layer compositing to a background thread using Skia `offscreenSurface`
- [ ] Profile FaceMesh detection: must complete in ≤ 200ms on cold start on the same devices
- [ ] Profile navigation transitions: all stack transitions must be ≤ 300ms

## 7.7 Error handling & edge cases

- [ ] No internet: app should open and show cached looks/tutorials; show offline banner
- [ ] No face detected: editor shows clear error and allows re-take
- [ ] Claude API timeout (>10s): show "Analysis taking longer than usual" with retry option
- [ ] RevenueCat purchase failure: show specific error (payment declined vs network error)
- [ ] R2 upload failure: retry 3 times with exponential backoff, then show user-facing error

## 7.8 Accessibility

- [ ] All interactive elements have `accessibilityLabel` and `accessibilityRole`
- [ ] Colour contrast ratio ≥ 4.5:1 for all text (verify against design tokens in `constants/colors.ts`)
- [ ] Editor colour picker includes text labels for each colour (not just swatches)
- [ ] Dynamic type: test with iOS largest accessibility text size

## 7.9 Pre-TestFlight checklist

- [ ] All `.env` values set in Railway (backend) and EAS secrets (mobile)
- [ ] Supabase RLS policies verified: run a test as a second user and confirm cross-user
      data access returns empty, not forbidden (RLS should silently return no rows)
- [ ] RevenueCat sandbox subscription tested end-to-end on physical device
- [ ] Backend `/health` endpoint monitored (add UptimeRobot or similar)
- [ ] EAS Build succeeds for both iOS and Android: `eas build --platform all`
- [ ] Submit to TestFlight internal group

---

**Phase 7 done when**: All 15 screens are implemented and navigable. App builds clean on EAS.
Internal TestFlight build distributed. No P0 crashes in first 30 minutes of manual testing.
