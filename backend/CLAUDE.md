# Backend — Context

## Runtime
Python 3.12. Dependency management via `pyproject.toml` (no requirements.txt).
Dev server: `uvicorn app.main:app --reload --port 8000`
Tests: `pytest -x -q`
Lint + types: `ruff check . && mypy .` (must pass before every commit)

## File structure
```
app/
  main.py            FastAPI app factory, middleware, router registration
  core/
    config.py        Settings via pydantic-settings (reads from env)
    security.py      JWT verification (Supabase public key)
    storage.py       R2 pre-signed URL generation (boto3)
    redis.py         Upstash Redis client
  api/v1/
    auth.py          POST /auth/verify — validate Supabase JWT
    upload.py        POST /upload/presign — issue R2 pre-signed URL
    looks.py         CRUD for saved looks
    critique.py      POST /critique — Claude API call (paywall-gated)
    products.py      GET /products/recommend
    tutorials.py     GET /tutorials
  models/
    user.py          SQLAlchemy ORM model
    look.py
    product.py
  schemas/           Pydantic request/response schemas (one file per domain)
  inference/
    face_mesh.py     Server-side MediaPipe wrapper (fallback for heavy effects)
    beauty_gan.py    BeautyGAN inference (ONNX)
    ladn.py          LADN inference (TFLite)
    utils.py         Image pre/post-processing helpers
  workers/
    critique_worker.py  Async Redis queue consumer for AI critique jobs
```

## Endpoint conventions
- All routes prefixed `/api/v1/`
- Auth: every endpoint except `/health` requires `Authorization: Bearer <supabase_jwt>`
- Verify JWT with Supabase's JWKS endpoint — do NOT re-implement crypto
- Return shapes: always `{"data": ..., "error": null}` or `{"data": null, "error": "..."}`
- HTTP status: 200 success, 400 bad request, 401 unauthenticated, 403 forbidden (paywall),
  422 validation, 500 internal

## Paywall gate pattern
```python
async def require_subscription(user: User = Depends(get_current_user)):
    info = await revenuecat.get_customer(user.id)
    if not info.entitlements.get("premium", {}).get("is_active"):
        raise HTTPException(status_code=403, detail="subscription_required")
    return user
```
Use `Depends(require_subscription)` on any paywalled route (critique, premium tutorials).

## Pre-signed URL flow
1. Client calls `POST /api/v1/upload/presign` with `{filename, content_type, size_bytes}`
2. Backend validates size (≤ 20MB), generates R2 pre-signed PUT URL (TTL: 300s)
3. Returns `{upload_url, object_key}` — client uploads directly to R2
4. Client calls next API with `object_key` to trigger processing
Never pass raw image bytes through the API server.

## Inference pipeline
- On-device (MediaPipe, TFLite) handles ≥90% of effects — no server call needed
- Server-side inference (`/inference`) is fallback for:
  - Foundation colour-matching (BeautyGAN, ONNX, ~250ms)
  - Full-face look generation (LADN, ~400ms)
- Models live in `inference/models/` (gitignored, downloaded via `scripts/download_models.sh`)
- All inference functions are async-wrapped; heavy work runs in a `ProcessPoolExecutor`

## Claude API (critique)
- Model: `claude-opus-4-5` (multimodal, vision capable)
- System prompt lives in `app/prompts/critique_system.txt` — do not hardcode in route
- Send image as base64 with content_type `image/jpeg`
- Enforce paywall gate before the API call — never reach Claude API for free users
- Wrap in try/except; if Claude API fails, return 503 with `retry_after` header

## Database
- Supabase PostgreSQL via async SQLAlchemy (`asyncpg` driver)
- Migrations: Alembic — `alembic upgrade head`
- RLS is enforced at the DB level; the API layer does NOT re-implement access control
- Schema reference: @docs/data-model.md

## Testing
- Use `pytest-asyncio` for async tests
- Fixture: `async_client` — httpx AsyncClient with test DB
- Mock R2, RevenueCat, Claude API in tests — no real external calls in CI
- Coverage target: ≥80% for api/ and core/; inference/ excluded from coverage requirement
