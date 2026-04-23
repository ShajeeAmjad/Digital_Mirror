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
