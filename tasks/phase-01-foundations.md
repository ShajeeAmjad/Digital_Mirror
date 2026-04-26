# Phase 1 — Foundations

**Goal**: Working monorepo with auth, database schema, and both apps running locally.
Complete every checkbox before moving to Phase 2.
Reference: @docs/architecture.md, @docs/data-model.md, @docs/env-guide.md

---

## 1.1 Repo & tooling

- [x] Initialise git repo with `.gitignore` (Node, Python, Expo, `.env`, `*.local.md`,
      `inference/models/`)
- [x] Add root `package.json` with workspaces: `["apps/mobile"]`
- [x] Add `.editorconfig` (2-space indent, LF line endings, trim trailing whitespace)
- [x] Add GitHub Actions workflow `.github/workflows/mobile-ci.yml`:
      triggers on push to `main` and all PRs; runs `yarn typecheck` and `yarn test`
- [x] Add GitHub Actions workflow `.github/workflows/backend-ci.yml`:
      triggers on push to `main` and all PRs; runs `ruff check`, `mypy`, `pytest`

## 1.2 Backend scaffolding

- [x] Create `backend/pyproject.toml` with dependencies:
      fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, alembic,
      pydantic-settings, PyJWT[crypto], boto3, httpx, redis,
      ruff, mypy, pytest, pytest-asyncio (dev)
- [x] Create `backend/app/main.py` — FastAPI app factory with:
      CORS middleware (allow mobile origin), `/health` endpoint, v1 router mounted at `/api/v1`
- [x] Create `backend/app/core/config.py` — pydantic-settings `Settings` class reading:
      `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`, `SUPABASE_DB_URL`,
      `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`, `R2_ENDPOINT`,
      `UPSTASH_REDIS_URL`, `ANTHROPIC_API_KEY`, `REVENUECAT_SECRET_KEY`
- [x] Create `backend/app/core/security.py` — `verify_supabase_jwt(token: str) -> dict`
      using HS256 with SUPABASE_JWT_SECRET; raise 401 on failure
- [x] Create `backend/app/core/storage.py` — `generate_presigned_put(key, content_type, ttl=300) -> str`
      using boto3 with R2 endpoint
- [x] Write Alembic migration for: `profiles`, `looks`, `products`, `critique_results`, `tutorials`
      (exact schema in @docs/data-model.md). RLS gated behind APP_ENV=production.
- [ ] Verify: `alembic upgrade head` runs against a local Supabase instance without errors
- [ ] Verify: `pytest` passes (requires a running PostgreSQL instance)
- [ ] Verify: `ruff check . && mypy .` passes with zero errors

## 1.3 Mobile scaffolding

- [x] Bootstrap Expo bare workflow (manual file creation — create-expo-app refused to overwrite
      existing src/ dir)
- [x] Install core dependencies:
      `@shopify/react-native-skia`, `react-native-reanimated`, `react-native-gesture-handler`,
      `@react-navigation/native`, `@react-navigation/native-stack`,
      `react-native-mmkv`, `@nozbe/watermelondb`,
      `@supabase/supabase-js`, `expo-secure-store`,
      `react-native-purchases`, `react-native-worklets`
- [x] Configure `babel.config.js` for Reanimated (add `react-native-reanimated/plugin` last)
- [x] Create `apps/mobile/src/constants/colors.ts` — export all tokens from design-system.md
- [x] Create `apps/mobile/src/navigation/RootNavigator.tsx` — native stack with all 15 screens;
      13 screens render placeholder `<View>`, Splash and FaceProfileSetup are implemented
- [x] Create `apps/mobile/src/api/client.ts` — typed fetch wrapper that:
      reads JWT from SecureStore, attaches `Authorization: Bearer <token>` header,
      handles 401 by calling `supabase.auth.refreshSession()` and retrying once
- [x] Verify: `yarn typecheck` passes with zero errors
- [x] Verify: `yarn test` passes (2 tests green)
- [ ] Verify: app boots to Splash screen on iOS simulator

## 1.4 Auth flow (mobile)

- [x] Implement `SplashScreen` — check for existing Supabase session on mount;
      route to `Home` if active session found, else stay on splash (show CTAs)
- [x] Implement `FaceProfileSetupScreen` — two modes:
      mode='auth': email/password sign-up/sign-in form
      mode='camera': camera oval guide (wireframe 02) after sign-up success
- [x] Implement sign-in flow (toggle chip on FaceProfileSetup) using
      `supabase.auth.signInWithPassword()`
- [x] Persist session: Supabase client configured with SecureStore adapter (encrypted keychain)
- [x] Implement sign-out: call `supabase.auth.signOut()`, navigate to Splash (in HomeScreen)

## 1.5 Auth endpoint (backend)

- [x] `GET /api/v1/auth/me` — verify JWT, return user profile from `profiles` table
- [x] `POST /api/v1/auth/profile` — create or update profile row (called after sign-up)
- [x] Unit tests for both endpoints with a mocked JWT

---

**Phase 1 done when**: App boots, user can sign up, sign in, sign out. Backend health check passes. All CI checks green.

**Remaining local verification steps** (requires environment setup):
- Connect a Supabase project and run `alembic upgrade head` (needs SUPABASE_DB_URL in backend/.env)
- Run `pip install -e ".[dev]" && ruff check . && mypy . && pytest` from backend/ with a running PostgreSQL
- Boot on iOS simulator: `cd apps/mobile && yarn ios`
