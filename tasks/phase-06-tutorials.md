# Phase 6 — Tutorials

**Goal**: Fully browsable tutorial system with step-by-step detail views.
Premium tutorials gated by paywall.
Reference: @docs/data-model.md (tutorials table)

---

## 6.1 Tutorial content (backend)

- [ ] Seed the `tutorials` table with at least 6 tutorials (2 free, 4 premium):
      - Natural everyday look (free, beginner)
      - Bold red lip (free, intermediate)
      - Smoky eye (premium, intermediate)
      - Contouring for oval face (premium, beginner)
      - Full glam (premium, advanced)
      - Editorial avant-garde (premium, advanced)
      - Each tutorial needs 5–8 steps; each step: `{ title, instruction, image_key?, tip? }`
- [ ] `GET /api/v1/tutorials` — list all tutorials; premium ones return metadata only for free users
      (no steps content)
- [ ] `GET /api/v1/tutorials/{id}` — full tutorial with steps; 403 if premium and user is free
- [ ] Add tutorial thumbnail images to R2 (placeholder solid-colour images acceptable for now)

## 6.2 Tutorial overview screen (mobile)

- [ ] Implement `TutorialOverviewScreen` (wireframe 12):
      - Category filter tabs: All, Eyes, Lips, Face, Contouring
      - Difficulty filter: beginner / intermediate / advanced
      - Tutorial cards: thumbnail, title, category, difficulty badge, duration estimate
      - Premium tutorials show a lock icon overlay; tapping navigates to Paywall
      - Free tutorials navigate to `TutorialStepDetail`

## 6.3 Tutorial step detail screen (mobile)

- [ ] Implement `TutorialStepDetailScreen` (wireframe 13):
      - Progress bar showing current step / total steps
      - Step image (from R2 via CDN URL)
      - Step title + instruction text
      - Pro tip (if present) in a highlighted card
      - "Previous" / "Next" step navigation
      - On final step: "Open in Editor" button — pre-loads the tutorial's layer config
        into the Editor screen so user can follow along interactively
      - Bookmark button: saves tutorial ID to WatermelonDB for offline access

## 6.4 Tutorial progress tracking

- [ ] Create WatermelonDB `tutorial_progress` model:
      `{ tutorial_id, last_step_completed, is_bookmarked, completed_at? }`
- [ ] In `TutorialStepDetailScreen`, on each step advance:
      update `last_step_completed` in WatermelonDB
- [ ] In `TutorialOverviewScreen`, show progress ring on partially-completed tutorials

## 6.5 Personalised tutorial recommendations

- [ ] `GET /api/v1/tutorials/recommended` — returns 3 tutorials ranked by:
      1. Match to user's `goals` from profile
      2. Match to user's `skin_tone`
      3. Appropriate difficulty (beginner first for new users based on account age)
- [ ] Show the 3 recommended tutorials in a "Picked for you" section at top of
      `TutorialOverviewScreen`

---

**Phase 6 done when**: All 6 tutorials are browsable. Step detail navigation works.
Free user sees paywall when tapping a premium tutorial. Progress is persisted between sessions.
