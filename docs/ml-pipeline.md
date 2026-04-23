# ML Pipeline

## Overview

The makeup application pipeline is entirely free — no paid AI APIs are involved.
Two approaches are combined depending on the makeup type:

1. **Landmark-based overlay** (MediaPipe FaceMesh + Skia) — covers ~90% of effects
2. **Model-based transfer** (BeautyGAN / LADN via TFLite/ONNX) — heavier effects

## Approach 1: Landmark overlay

Used for: lipstick, eyeshadow, blush, contour, highlight, brow tinting, lashes.

### Pipeline
```
Camera frame
  → MediaPipe FaceMesh (on-device, real-time at 30fps)
  → 478 normalised [0,1] landmarks
  → Extract region indices (see apps/mobile/CLAUDE.md for index lists)
  → Scale to canvas pixel coordinates
  → Skia Path constructed from region points
  → Skia Paint configured (color, opacity, blendMode)
  → Drawn onto transparent Surface
  → Surface composited onto base photo
```

### Lash rendering
Not ML — asset-based. 2D lash sprite PNGs are perspective-warped onto the eyelid
landmark plane using a homography matrix computed from 4 corner landmark points.
Sprites live in `apps/mobile/assets/lashes/`.

## Approach 2: Model-based (server + on-device)

Used for: foundation colour-matching, full-face look generation.

### Models
| Model | Format | Input | Output | Latency |
|---|---|---|---|---|
| BeautyGAN | ONNX (quantised INT8) | 256×256 face crop | 256×256 with makeup | ~250ms on device, ~80ms server |
| LADN | TFLite (FP16) | 256×256 face crop | 256×256 transferred look | ~400ms on device |

### Download
Models are NOT committed to git (too large). Download via:
```bash
bash scripts/download_models.sh
```
This fetches from a private R2 bucket. See `docs/env-guide.md` for credentials.

### On-device inference (mobile)
```
User triggers effect
  → Crop face region from photo using FaceMesh bounding box
  → Resize to 256×256 (bilinear)
  → Normalise to [-1, 1]
  → Run TFLite / ONNX Runtime Mobile
  → De-normalise output
  → Blend result back into full resolution photo using face mask
```

### Server-side fallback
Same pipeline, runs in `backend/app/inference/`. Used when:
- Device is low-end (TFLite inference >800ms)
- Full-look generation requested (LADN is heavy on old devices)

The mobile client checks device benchmark on first launch and sets
`useServerInference: bool` in MMKV.

## MediaPipe FaceMesh integration (React Native)

Use the `@mediapipe/tasks-vision` package compiled for React Native via JSI bridge.
Alternatively, use the native SDKs:
- iOS: `MediaPipeTasksVision` via Swift, bridged via Expo Module
- Android: `com.google.mediapipe:tasks-vision` via Kotlin, bridged via Expo Module

The Expo module lives in `apps/mobile/modules/face-mesh/`.
It exposes `detectLandmarks(frameData: Uint8Array, width: number, height: number): Landmark[]`.

## Performance targets
- FaceMesh detection: ≤ 33ms per frame (30fps)
- Skia layer compositing: ≤ 16ms (60fps canvas)
- TFLite inference (on-device): ≤ 500ms (acceptable for non-realtime effects)
- Server-side inference: ≤ 300ms p95
