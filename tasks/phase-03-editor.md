# Phase 3 — Makeup Editor

**Goal**: Functional Skia canvas editor with a layer stack system. User can add, adjust,
toggle, and remove makeup layers. No ML yet — use placeholder static regions.
Reference: @docs/ml-pipeline.md, apps/mobile/CLAUDE.md (Skia canvas section)

---

## 3.1 Layer data model (mobile)

- [ ] Create `apps/mobile/src/ml/types.ts`:
      ```ts
      type MakeupType = 'lipstick' | 'eyeshadow' | 'blush' | 'contour' |
                        'highlight' | 'foundation' | 'lashes' | 'brows'
      interface MakeupLayer {
        id: string
        type: MakeupType
        color: string       // hex
        opacity: number     // 0–1
        blendMode: SkBlendMode
        enabled: boolean
      }
      type LayerStack = MakeupLayer[]
      ```
- [ ] Create `apps/mobile/src/hooks/useMakeupLayers.ts`:
      - State: `LayerStack`
      - Actions: `addLayer`, `removeLayer`, `updateLayer`, `toggleLayer`, `reorderLayers`
      - Persist current stack to MMKV on every change (debounced 500ms)
      - Load from MMKV on mount

## 3.2 Editor screen layout (mobile)

- [ ] Implement `EditorScreen` layout (matches wireframes 7.1–7.4):
      - Full-screen photo display at top (react-native `Image` for now; Skia canvas in 3.3)
      - Bottom sheet panel (Reanimated `BottomSheet`) with two tabs: "Makeup" and "Layers"
      - "Makeup" tab: horizontal scrollable category chips (Lips, Eyes, Brows, Cheeks, Face)
      - Selecting a category shows colour swatches + opacity slider below
      - "Layers" tab: drag-reorderable layer list (use `react-native-draggable-flatlist`)
      - Each layer row: type icon, colour swatch, visibility toggle, delete button
      - Top bar: "Undo", "Redo", "Generate with AI" (navigates to `AICritique`), "Save"

## 3.3 Skia canvas (mobile)

- [ ] Replace the `Image` placeholder in `EditorScreen` with a Skia `<Canvas>`:
      - Render the base photo as a Skia `Image` filling the canvas
      - For each `enabled` layer in `LayerStack`, draw its path with correct Paint settings
      - Use placeholder hardcoded paths for now (e.g. an ellipse over the lip region)
        — ML-accurate paths come in Phase 4
- [ ] Implement blend modes per layer type (see apps/mobile/CLAUDE.md for the mapping)
- [ ] Implement real-time opacity control: slider value updates layer Paint opacity live
- [ ] Implement colour picker: tapping a swatch updates layer color and redraws immediately

## 3.4 Undo / redo

- [ ] Implement undo/redo stack in `useMakeupLayers`:
      - Max 20 history entries
      - Undo/redo buttons in editor top bar are disabled when stack is empty/at head
      - Keyboard shortcut: Cmd+Z / Cmd+Shift+Z on iPad

## 3.5 Save look

- [ ] "Save" button in editor:
      1. Export the Skia canvas to JPEG using `canvas.makeImageSnapshot().encodeToBase64()`
      2. Upload result image via pre-signed URL (same flow as Phase 2 but for `result_key`)
      3. Call `POST /api/v1/looks` with `{ original_key, result_key, title, layer_config }`
      4. Show success toast; navigate to `BeforeAfterExport` screen

## 3.6 Editor states (wireframes 7.1–7.4)

- [ ] `EditorEmpty` state: show "Add your first makeup layer" prompt when LayerStack is empty
- [ ] `EditorMidEdit` state: normal editing state with layer panel visible
- [ ] `EditorPostGen` state: after AI generation (Phase 5), show generated layers pre-loaded
- [ ] `EditorLayersView` state: layers tab active, showing the reorderable layer list

---

**Phase 3 done when**: User can open the editor, add lipstick/eyeshadow/contour layers with
colour and opacity controls, undo/redo, reorder layers, and save a look to the backend.
Paths are placeholder shapes — not yet landmark-accurate.
