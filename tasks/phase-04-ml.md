# Phase 4 — On-Device ML

**Goal**: Replace placeholder Skia paths with landmark-accurate paths from MediaPipe
FaceMesh. Integrate TFLite for foundation/full-look effects.
Reference: @docs/ml-pipeline.md, apps/mobile/CLAUDE.md (landmark regions + ML sections)

---

## 4.1 FaceMesh Expo module

- [ ] Create `apps/mobile/modules/face-mesh/` as an Expo Module:
      - iOS: Swift, using `MediaPipeTasksVision` pod
      - Android: Kotlin, using `com.google.mediapipe:tasks-vision`
      - JS interface: `detectLandmarks(imageUri: string): Promise<Landmark[]>`
        where `Landmark = { x: number, y: number, z: number }` (normalised [0,1])
      - Use the FaceMesh 478-point model (not the 68-point lite model)
      - Add pod and gradle dependencies; run `npx expo prebuild` after
- [ ] Unit test the module with a fixture JPEG + known landmark positions

## 4.2 Run FaceMesh on the editor photo

- [ ] Create `apps/mobile/src/hooks/useFaceMesh.ts`:
      - Accepts `imageUri: string`
      - Calls the Expo module `detectLandmarks`
      - Returns `{ landmarks: Landmark[] | null, isDetecting: boolean, error: string | null }`
      - Runs once when the editor mounts with the photo (not per-frame — the photo is static)
- [ ] In `EditorScreen`, call `useFaceMesh` with the photo URI
- [ ] Show a loading indicator while detection runs (first run may take ~200ms)
- [ ] If detection fails (no face found): show error banner "No face detected — try a clearer photo"

## 4.3 Landmark path generation

- [ ] Create `apps/mobile/src/ml/landmarkPaths.ts`:
      - `getLipsOuterPath(landmarks: Landmark[], canvasW: number, canvasH: number): SkPath`
      - `getLipsInnerPath(...)`, `getLeftEyePath(...)`, `getRightEyePath(...)`,
        `getLeftBrowPath(...)`, `getRightBrowPath(...)`, `getLeftCheekPath(...)`,
        `getRightCheekPath(...)`, `getNoseBridgePath(...)`
      - Use exact index lists from apps/mobile/CLAUDE.md
      - Scale normalised coords: `x * canvasW`, `y * canvasH`
      - Return closed Skia `Path` objects
- [ ] Replace placeholder paths in `EditorScreen` Skia canvas with these functions

## 4.4 Makeup-type to landmark region mapping

- [ ] Create `apps/mobile/src/ml/makeupRegions.ts`:
      ```ts
      const MAKEUP_REGIONS: Record<MakeupType, (l: Landmark[], w: number, h: number) => SkPath[]> = {
        lipstick:  (l, w, h) => [getLipsOuterPath(l, w, h)],
        eyeshadow: (l, w, h) => [getLeftEyePath(l, w, h), getRightEyePath(l, w, h)],
        blush:     (l, w, h) => [getLeftCheekPath(l, w, h), getRightCheekPath(l, w, h)],
        contour:   (l, w, h) => [/* jaw + temple paths */],
        highlight: (l, w, h) => [/* brow bone + nose bridge paths */],
        brows:     (l, w, h) => [getLeftBrowPath(l, w, h), getRightBrowPath(l, w, h)],
        lashes:    (l, w, h) => [], // handled separately (sprite warping)
        foundation: (l, w, h) => [], // handled by TFLite (4.5)
      }
      ```

## 4.5 Lash sprite warping

- [ ] Add 5 lash sprite PNGs to `apps/mobile/assets/lashes/` (natural, wispy, dramatic, cat, doll)
- [ ] Create `apps/mobile/src/ml/lashWarp.ts`:
      - Compute homography from 4 upper eyelid landmark anchor points
      - Use Skia `canvas.drawImageRect` with a transformed matrix to warp sprite onto eyelid
      - Apply per eye (left + right lash sprites warped independently)

## 4.6 TFLite foundation effect

- [ ] Add `react-native-fast-tflite` (or `onnxruntime-react-native`)
- [ ] Add `download_models.sh` script to fetch `beauty_gan_int8.onnx` and `ladn_fp16.tflite`
      from R2 into `apps/mobile/models/` (gitignored)
- [ ] Create `apps/mobile/src/ml/foundationInference.ts`:
      - Crop face bounding box from photo (from FaceMesh landmarks)
      - Resize crop to 256×256
      - Run BeautyGAN ONNX inference
      - Blend output onto canvas at full resolution using face mask (landmark convex hull)
- [ ] Add device benchmark on first run:
      - Run a 10-iteration TFLite inference benchmark
      - If p50 > 600ms, set `MMKV.set('useServerInference', true)`

## 4.7 Server-side inference fallback (backend)

- [ ] `POST /api/v1/inference/foundation` endpoint:
      - Body: `{ object_key: string, skin_tone: string }`
      - Fetch image from R2, run BeautyGAN via `backend/app/inference/beauty_gan.py`
      - Return processed image as a new R2 object key
- [ ] Wrap inference in `ProcessPoolExecutor` (non-blocking async)
- [ ] Mobile client: if `useServerInference` is true, call this endpoint instead of local TFLite

---

**Phase 4 done when**: Lipstick, eyeshadow, blush, contour, highlight, brows, and lashes all
render on accurate facial landmarks. Foundation runs either on-device or server depending on
device benchmark. All paths visually verified against at least 3 test photos with different
face shapes.
