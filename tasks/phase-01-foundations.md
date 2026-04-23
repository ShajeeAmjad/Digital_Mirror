# Phase 1 — Foundations

**Goal**: Working monorepo with auth, database schema, and both apps running locally.
Complete every checkbox before moving to Phase 2.
Reference: @docs/architecture.md, @docs/data-model.md, @docs/env-guide.md

---

## 1.1 Repo & tooling

- [ ] Initialise git repo with `.gitignore` (Node, Python, Expo, `.env`, `*.local.md`,
      `inference/models/`)
- [ ] Add root `package.json` with workspaces: `["apps/mobile"]`
- [ ] Add `.editorconfig` (2-space indent, LF line endings, trim trailing whitespace)
- [ ] Add GitHub Actions workflow `.github/workflows/mobile-ci.yml`:
      triggers on push to `main` and all PRs; runs `yarn typecheck` and `yarn test`
- [ ] Add GitHub Actions workflow `.github/workflows/backend-ci.yml`:
      triggers on push to `main` and all PRs; runs `ruff check`, `mypy`, `pytest`

## 1.2 Backend scaffolding

- [ ] Create `backend/pyproject.toml` with dependencies:
      fastapi, uvicorn[standard], sqlalchemy[asyncio], asyncpg, alembic,
      pydantic-settings, python-jose[cryptography], boto3, httpx, redis,
      ruff, mypy, pytest, pytest-asyncio, pytest-httpx (dev)
- [ ] Create `backend/app/main.py` — FastAPI app factory with:
      CORS middleware (allow mobile origin), `/health` endpoint, v1 router mounted at `/api/v1`
- [ ] Create `backend/app/core/config.py` — pydantic-settings `Settings` class reading:
      `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`,
      `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET`,
      `UPSTASH_REDIS_URL`, `ANTHROPIC_API_KEY`, `REVENUECAT_SECRET_KEY`
- [ ] Create `backend/app/core/security.py` — `verify_supabase_jwt(token: str) -> dict`
      using Supabase JWKS endpoint; raise 401 on failure
- [ ] Create `backend/app/core/storage.py` — `generate_presigned_put(key, content_type, ttl=300) -> str`
      using boto3 with R2 endpoint
- [ ] Write Alembic migration for: `profiles`, `looks`, `products`, `critique_results`, `tutorials`
      (exact schema in @docs/data-model.md)
- [ ] Verify: `alembic upgrade head` runs against a local Supabase instance without errors
- [ ] Verify: `pytest` passes (at minimum the `/health` test)
- [ ] Verify: `ruff check . && mypy .` passes with zero errors

## 1.3 Mobile scaffolding

- [ ] Bootstrap Expo bare workflow: `npx create-expo-app apps/mobile --template bare-minimum`
- [ ] Install core dependencies:
      `@shopify/react-native-skia`, `react-native-reanimated`, `react-native-gesture-handler`,
      `@react-navigation/native`, `@react-navigation/native-stack`,
      `react-native-mmkv`, `@nozbe/watermelondb`,
      `@supabase/supabase-js`, `expo-secure-store`,
      `@revenuecat/purchases-react-native`
- [ ] Configure `babel.config.js` for Reanimated (add `react-native-reanimated/plugin`)
- [ ] Create `apps/mobile/src/constants/colors.ts` — export all tokens from DESIGN.md
      (surface, primary, secondary, accent terracotta `#B35D44`, etc.)
- [ ] Create `apps/mobile/src/navigation/RootNavigator.tsx` — native stack with all 15
      screen names listed in `apps/mobile/CLAUDE.md`; each screen renders a placeholder `<View>`
- [ ] Create `apps/mobile/src/api/client.ts` — typed fetch wrapper that:
      reads JWT from SecureStore, attaches `Authorization: Bearer <token>` header,
      handles 401 by calling `supabase.auth.refreshSession()` and retrying once
- [ ] Verify: `yarn typecheck` passes with zero errors
- [ ] Verify: `yarn test` passes
- [ ] Verify: app boots to Splash screen on iOS simulator

## 1.4 Auth flow (mobile)

- [ ] Implement `SplashScreen` — check for existing Supabase session on mount;
      route to `Home` if active session found, else route to `FaceProfileSetup`
- [ ] Implement `FaceProfileSetup` screen — email/password sign-up form using
      `supabase.auth.signUp()`; on success, create a row in `profiles` table via API
- [ ] Implement sign-in flow (reachable from `FaceProfileSetup`) using
      `supabase.auth.signInWithPassword()`
- [ ] Persist session: store access token + refresh token in `expo-secure-store`
- [ ] Implement sign-out: clear SecureStore, call `supabase.auth.signOut()`, navigate to Splash

## 1.5 Auth endpoint (backend)

- [ ] `GET /api/v1/auth/me` — verify JWT, return user profile from `profiles` table
- [ ] `POST /api/v1/auth/profile` — create or update profile row (called after sign-up)
- [ ] Unit tests for both endpoints with a mocked JWT

---

**Phase 1 done when**: App boots, user can sign up, sign in, sign out. Backend health check passes. All CI checks green.
