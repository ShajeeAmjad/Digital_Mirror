# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is
A React Native beauty app. Users photograph themselves, apply virtual makeup (lipstick,
eyeshadow, foundation, contour, lashes, brows, highlight) in real time, then optionally
receive AI critique and product recommendations behind a paywall.

## Monorepo map
```
apps/mobile/      React Native + Expo bare workflow (iOS + Android)
backend/          FastAPI (Python) — REST API, image pipeline, AI inference
docs/             Architecture, data model, ML pipeline, design system, env guide
tasks/            Phased execution plans — work through these in order
wireframes/       HTML + PNG per screen — read the HTML before implementing any screen
.github/          CI workflows for mobile and backend
```

Each sub-directory has its own CLAUDE.md with detailed context:
- `apps/mobile/CLAUDE.md` — Skia canvas, landmark indices, navigation screen names, wireframe mapping
- `backend/CLAUDE.md` — Endpoint conventions, paywall gate pattern, inference pipeline, Claude API usage

## Tech stack (do not substitute without asking)
- **Mobile**: React Native, Expo bare, React Native Skia, Reanimated 3, Gesture Handler,
  React Navigation (native stack), MMKV, WatermelonDB
- **On-device ML**: MediaPipe FaceMesh, TensorFlow Lite, ONNX Runtime Mobile
- **Backend**: FastAPI, Python 3.12, Pydantic v2, SQLAlchemy 2 (async)
- **Database**: Supabase (PostgreSQL + Row-Level Security + Auth)
- **Storage**: Cloudflare R2 (images), Upstash Redis (cache + job queue)
- **AI critique** (paywalled): Anthropic Claude API (multimodal)
- **Payments**: RevenueCat (iOS + Android IAP)
- **Infra**: Railway (backend), GitHub Actions (CI), Cloudflare (CDN + WAF)

## Shared conventions
- Language: TypeScript (strict) for mobile; Python with full type hints for backend
- Commit style: `type(scope): description` — e.g. `feat(editor): add contour layer`
  Types: feat, fix, chore, docs, refactor, test, ci
- All user photos are treated as sensitive biometric data — never log raw image bytes
- Pre-signed URL pattern: images upload directly from client to R2; backend never proxies raw bytes

## Key commands

```bash
# Mobile
cd apps/mobile && yarn install
yarn start                          # Expo dev server (Metro)
yarn ios / yarn android             # Run on simulator
npx expo run:ios                    # Native build (bare workflow)
npx expo prebuild                   # Regenerate ios/ and android/ after adding native modules
yarn typecheck                      # tsc --noEmit
yarn test                           # Jest (all tests)
yarn test --testPathPattern=Editor  # Jest (single file match)
yarn test --coverage                # Jest with coverage report

# Backend
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload       # Dev server on :8000
alembic upgrade head                # Apply DB migrations
pytest -x -q                        # Run tests (fail-fast, quiet)
pytest tests/test_auth.py::test_me  # Run a single test
ruff check . && mypy .              # Lint + type-check (must pass before every commit)
```

## Reference docs (use @ to load on demand)
- Architecture overview → @docs/architecture.md
- Database schema → @docs/data-model.md
- ML inference approach → @docs/ml-pipeline.md
- Env vars guide → @docs/env-guide.md
- Design system (colours, typography, spacing, components) → @docs/design-system.md

## Wireframes
Every screen has a folder in `wireframes/` containing `code.html` (layout + structure)
and `screen.png` (visual reference). Always read the HTML before implementing a screen —
it contains richer structural information than the PNG.
Screen-to-wireframe folder mapping is in `apps/mobile/CLAUDE.md`.

## Task execution order
Work through `tasks/` in phase order. Each file has checkboxes — check them off as you complete each item.
- `tasks/phase-01-foundations.md`   Auth, env, DB schema, project scaffolding
- `tasks/phase-02-camera.md`        Camera, upload flow, R2 pre-signed URLs
- `tasks/phase-03-editor.md`        Skia canvas, makeup layer system, blend modes
- `tasks/phase-04-ml.md`            MediaPipe FaceMesh, TFLite, makeup overlay rendering
- `tasks/phase-05-ai-critique.md`   Claude API integration, paywall gate, RevenueCat
- `tasks/phase-06-tutorials.md`     Tutorial system, product recommendations
- `tasks/phase-07-polish.md`        Trends feed, profile, before/after export, QA
