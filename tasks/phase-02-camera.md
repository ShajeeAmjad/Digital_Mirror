# Phase 2 — Camera & Upload

**Goal**: User can take/select a photo, it uploads directly to R2 via pre-signed URL,
and the object key is stored against their profile.
Reference: @docs/architecture.md (Image upload flow section), @docs/data-model.md

---

## 2.1 Camera screen (mobile)

- [ ] Implement `CameraUploadScreen`:
      - Use `expo-camera` for live camera preview
      - "Take photo" button → capture JPEG, max 2048×2048
      - "Choose from library" option via `expo-image-picker`
      - Show captured photo preview with "Use this" / "Retake" options
- [ ] On "Use this": compress image to ≤ 2MB with `expo-image-manipulator`
      (quality 0.85, resize if either dimension > 1920px)
- [ ] Request camera and photo library permissions on mount; show friendly error UI if denied

## 2.2 Pre-signed upload (backend)

- [ ] `POST /api/v1/upload/presign` endpoint:
      - Request body: `{ filename: string, content_type: string, size_bytes: number }`
      - Validate: `content_type` must be `image/jpeg` or `image/png`
      - Validate: `size_bytes` ≤ 20_971_520 (20MB)
      - Generate R2 object key: `{user_id}/originals/{uuid4}.jpg`
      - Return: `{ upload_url: string, object_key: string }`
- [ ] Unit test: valid request returns 200 with upload_url and object_key
- [ ] Unit test: oversized request returns 400
- [ ] Unit test: unauthenticated request returns 401

## 2.3 Upload flow (mobile)

- [ ] In `CameraUploadScreen`, after "Use this" is confirmed:
      1. Call `POST /api/v1/upload/presign` with file metadata
      2. `PUT` the image to the returned `upload_url` using `fetch` (no JWT header — it's a direct R2 call)
      3. Show upload progress bar (use `XMLHttpRequest` for progress events)
      4. On success: store `object_key` in component state
      5. Navigate to `CreationModeSelector` screen, passing `object_key` as route param
- [ ] Handle upload errors: retry once automatically; show error toast if retry fails

## 2.4 Creation mode selector (mobile)

- [ ] Implement `CreationModeSelectorScreen`:
      - Receives `object_key` as route param
      - Two options: "Use AI to generate a look" / "Start from scratch"
      - "Start from scratch" → navigate to `Editor` with `object_key`
      - "Use AI" → navigate to `GoalSelection` with `object_key`

## 2.5 Goal selection (mobile)

- [ ] Implement `GoalSelectionScreen`:
      - Multi-select chips: Natural, Glam, Editorial, Office, Evening, Bold
      - "Continue" → navigate to `Editor` with `{ object_key, goals }`

## 2.6 Looks endpoint (backend)

- [ ] `POST /api/v1/looks` — create a look record:
      - Body: `{ original_key, title?, layer_config? }`
      - Creates row in `looks` table for the authenticated user
      - Returns the created look object
- [ ] `GET /api/v1/looks` — list looks for authenticated user (paginated, 20 per page)
- [ ] `GET /api/v1/looks/{look_id}` — fetch a single look
- [ ] `DELETE /api/v1/looks/{look_id}` — delete (also delete R2 objects for that look)

---

**Phase 2 done when**: User can take a photo, see it upload with a progress bar, and arrive at the Editor screen with the object key in scope. Backend look endpoints pass all tests.
