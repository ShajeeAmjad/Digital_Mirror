# Digital Mirror — Root Context

## What this project is
A React Native beauty app. Users photograph themselves, apply virtual makeup (lipstick,
eyeshadow, foundation, contour, lashes, brows, highlight) in real time, then optionally
receive AI critique and product recommendations behind a paywall.

## Monorepo map
```
apps/mobile/      React Native + Expo bare workflow (iOS + Android)
backend/          FastAPI (Python) — REST API, image pipeline, AI inference
docs/             Architecture, data model, API spec, ML pipeline, compliance
tasks/            Phased execution plans — work through these in order
.github/          CI workflows for mobile and backend
```

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
- Secrets: never hardcode — use `.env` (gitignored); see `docs/env-guide.md`
- All user photos are treated as sensitive biometric data — never log raw image bytes
- Pre-signed URL pattern: images upload directly from client to R2; backend never proxies raw bytes

## Key commands
```bash
# Mobile
cd apps/mobile && yarn install
yarn start              # Expo dev server
yarn ios / yarn android # Run on simulator
yarn typecheck          # tsc --noEmit
yarn test               # Jest

# Backend
cd backend
pip install -e ".[dev]"
uvicorn app.main:app --reload   # Dev server on :8000
pytest                          # Run tests
ruff check . && mypy .          # Lint + type-check
```

## Reference docs (use @ to load on demand)
- Architecture overview → @docs/architecture.md
- Database schema → @docs/data-model.md
- API contract → @docs/api-spec.md
- ML inference approach → @docs/ml-pipeline.md
- Regulatory & compliance → @docs/regulatory.md
- Env vars guide → @docs/env-guide.md

## Task execution order
Work through tasks/ in phase order. Each file has checkboxes. Check them off as you go.
- tasks/phase-01-foundations.md   Auth, env, DB schema, project scaffolding
- tasks/phase-02-camera.md        Camera, upload flow, R2 pre-signed URLs
- tasks/phase-03-editor.md        Skia canvas, makeup layer system, blend modes
- tasks/phase-04-ml.md            MediaPipe FaceMesh, TFLite, makeup overlay rendering
- tasks/phase-05-ai-critique.md   Claude API integration, paywall gate, RevenueCat
- tasks/phase-06-tutorials.md     Tutorial system, product recommendations
- tasks/phase-07-polish.md        Trends feed, profile, before/after export, QA
