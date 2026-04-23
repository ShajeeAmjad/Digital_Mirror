# Mobile — Context

## Runtime
Expo bare workflow (not managed). Use `npx expo run:ios` / `npx expo run:android`
for native builds. EAS Build for distribution. `yarn start` for the Metro bundler.

## File structure
```
src/
  screens/         One file per screen, named after wireframe (e.g. EditorScreen.tsx)
  components/      Shared UI — atoms, molecules, no screen-specific logic
  ml/              MediaPipe + TFLite wrappers and landmark utilities
  store/           MMKV atoms + WatermelonDB models and migrations
  navigation/      React Navigation stack definitions
  hooks/           Custom hooks (useFaceMesh, useMakeupLayer, useSubscription, etc.)
  api/             Typed API client (wraps fetch, attaches JWT, handles refresh)
  constants/       Colors, spacing, routes — mirrors DESIGN.md tokens
```

## Skia canvas (critical)
The makeup editor renders in a `<Canvas>` from `@shopify/react-native-skia`.
- Each makeup type (lipstick, eyeshadow, contour…) is a separate `MakeupLayer` object
- Layers are composited in order using Skia `Paint` blend modes:
  - Lipstick → `multiply`
  - Eyeshadow → `screen`
  - Contour → `multiply` at lower opacity
  - Highlight → `screen`
- Never render makeup directly onto the base photo — always composite layers onto a
  transparent `Surface` and then blend the Surface onto the photo
- Landmark coordinates from MediaPipe are in [0,1] normalised space — scale to canvas
  pixels before drawing any paths

## Landmark regions (MediaPipe FaceMesh 478-point model)
```
Lips outer:    indices 61,146,91,181,84,17,314,405,321,375,291,308
Lips inner:    indices 78,191,80,81,82,13,312,311,310,415,308
Left eye:      indices 33,7,163,144,145,153,154,155,133
Right eye:     indices 362,382,381,380,374,373,390,249,263
Left brow:     indices 46,53,52,65,55,70,63,105,66,107
Right brow:    indices 276,283,282,295,285,300,293,334,296,336
Nose bridge:   indices 168,6,197,195,5
Left cheek:    indices 50,101,118,117,111  (blush/contour)
Right cheek:   indices 280,330,348,347,340
```

## State management
- UI state: React local state + `useReducer` for editor layer stack
- Persisted user prefs (theme, onboarding done): MMKV
- Saved looks, tutorial progress: WatermelonDB (structured, offline-first)
- Subscription state: RevenueCat SDK — always check `CustomerInfo.entitlements`
  before showing any paywalled UI

## Auth
Supabase Auth. On app launch: check session from SecureStore. If expired, call
`supabase.auth.refreshSession()`. Attach the access token to every API request via the
`api/` client. Never store the raw token in MMKV — use Expo SecureStore.

## Navigation screen names (match wireframes exactly)
```
Splash, FaceProfileSetup, GoalSelection, Home, CameraUpload,
CreationModeSelector, Editor, AICritique, ProductRecommendations,
BeforeAfterExport, Paywall, TutorialOverview, TutorialStepDetail,
Profile, TrendsFeed
```

## Testing
- Unit tests: Jest + `@testing-library/react-native`
- Mock Skia: `jest.mock('@shopify/react-native-skia', () => require('@shopify/react-native-skia/src/mock'))`
- Mock MediaPipe: provide a fixture of 478 landmark points
- Run: `yarn test` / `yarn test --coverage`

## Wireframes
Before implementing any screen, read its wireframe HTML first, then cross-reference
the design tokens in @docs/design-system.md for colours, typography, and spacing.

| Screen name            | Wireframe folder                        |
|------------------------|-----------------------------------------|
| SplashScreen           | @wireframes/01_splash_welcome/code.html |
| FaceProfileSetup       | @wireframes/02_face_profile_setup/code.html |
| GoalSelection          | @wireframes/03_goal_selection/code.html |
| HomeScreen             | @wireframes/04_home/code.html           |
| CameraUpload           | @wireframes/05_camera_upload/code.html  |
| CreationModeSelector   | @wireframes/06_creation_mode_selector/code.html |
| EditorScreen (empty)   | @wireframes/07_1_editor_empty/code.html |
| EditorScreen (editing) | @wireframes/07_2_editor_mid_edit/code.html |
| EditorScreen (post-AI) | @wireframes/07_3_editor_post_gen/code.html |
| EditorScreen (layers)  | @wireframes/07_4_editor_layers_view/code.html |
| AICritique             | @wireframes/08_ai_critique/code.html    |
| ProductRecommendations | @wireframes/09_product_recommendations/code.html |
| BeforeAfterExport      | @wireframes/10_before_after_export/code.html |
| PaywallScreen          | @wireframes/11_paywall/code.html        |
| TutorialOverview       | @wireframes/12_tutorial_overview/code.html |
| TutorialStepDetail     | @wireframes/13_tutorial_step_detail/code.html |
| ProfileScreen          | @wireframes/14_profile/code.html        |
| TrendsFeed             | @wireframes/15_trends_feed/code.html    |

### How to use wireframes
1. Read the HTML to understand component hierarchy, layout, and interactive states
2. Map CSS classes/variables to React Native StyleSheet equivalents using design-system.md
3. The PNG (screen.png in the same folder) is your visual QA reference — compare your
   implementation against it before marking a screen task as done
4. Do not copy HTML/CSS directly — translate structure and intent into RN primitives
