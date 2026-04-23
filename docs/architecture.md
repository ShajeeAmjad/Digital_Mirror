# Architecture

## System overview

```
[Mobile Client]  ←──HTTPS/JWT──→  [FastAPI Backend]  ←──→  [Supabase PostgreSQL]
     │                                    │                  [Upstash Redis]
     │  pre-signed URL (direct upload)    │                  [Cloudflare R2]
     └──────────────────────────────→  [R2]
                                          │
                                          └──→  [Claude API]  (paywalled)
                                          └──→  [RevenueCat]
                                          └──→  [Cloudflare CDN]
```

## Mobile client layers

| Layer | Libraries | Responsibility |
|---|---|---|
| UI & navigation | React Navigation, Reanimated 3, Gesture Handler | Screen flow, animations |
| Editor canvas | React Native Skia | GPU-composited makeup layer rendering |
| On-device ML | MediaPipe FaceMesh, TFLite, ONNX Runtime Mobile | Landmark detection, makeup overlay |
| Local storage | MMKV, WatermelonDB | Preferences, offline looks, tutorial state |
| Auth | Supabase Auth SDK, Expo SecureStore | Session, JWT management |
| API client | Custom typed fetch wrapper | Attaches JWT, handles refresh |
| Payments | RevenueCat SDK | IAP, entitlement checks |

## Makeup rendering pipeline (on-device)

1. Camera frame → MediaPipe FaceMesh → 478 normalised landmarks
2. Landmark indices for each region (lips, eyes, brows, cheeks) are extracted
3. Skia `Path` is constructed from landmark points for each active layer
4. Each layer is drawn onto a Skia `Surface` with its blend mode and opacity
5. Surface is composited onto the base photo frame
6. For foundation/full-look: TFLite (BeautyGAN) runs on a resized 256×256 copy,
   result is blended back at full resolution

## Image upload flow (pre-signed URL pattern)

```
Client                 FastAPI              Cloudflare R2
  │── POST /upload/presign ──→│                   │
  │                            │── generate URL ──→│
  │←── {upload_url, key} ──────│                   │
  │──────── PUT (image) ─────────────────────────→ │
  │── POST /looks (key) ───────│                   │
  │                            │── validate key ──→│
  │←── {look_id, ...} ─────────│                   │
```

Backend never receives raw image bytes. Pre-signed URLs expire after 300 seconds.

## AI critique flow (paywalled)

```
Client          FastAPI            RevenueCat       Claude API
  │── POST /critique ──→│                │               │
  │                      │── check sub ─→│               │
  │                      │←── active ────│               │
  │                      │── send image + prompt ────────→│
  │                      │←── critique JSON ──────────────│
  │←── {score, tips} ────│                               │
```

If user has no active subscription, FastAPI returns 403 before calling Claude API.

## Key security decisions

- **RLS at DB level**: PostgreSQL Row-Level Security enforces per-user data isolation.
  Even a buggy API endpoint cannot return another user's data.
- **JWT verification**: Backend verifies Supabase JWTs against Supabase's JWKS endpoint.
  No custom auth implementation.
- **No raw bytes through API**: Pre-signed URL pattern keeps the API server stateless
  and prevents it from being an image proxy attack vector.
- **Secrets**: All credentials via environment variables. No secrets in code or git.
  R2, Redis, Supabase, RevenueCat, Claude API keys are all env-injected on Railway.
- **HTTPS everywhere**: Cloudflare WAF sits in front of the backend on Railway.
  All mobile API calls enforce HTTPS; plain HTTP is rejected.

## Infrastructure

| Service | Purpose | Tier |
|---|---|---|
| Railway | FastAPI hosting, auto-deploy from main branch | Starter → scale as needed |
| Supabase | PostgreSQL + Auth + RLS | Free → Pro |
| Cloudflare R2 | Image object storage | Pay-as-you-go (zero egress) |
| Upstash Redis | Session cache, job queue, rate limiting | Serverless free tier |
| Cloudflare | DNS, WAF, CDN for R2 assets | Free → Pro |
| RevenueCat | IAP management | Free to $172/mo based on revenue |
| EAS Build | Expo Application Services for app builds | Free tier → build credits |

## Scalability path

Phase 1 (0–10k users): Monolith FastAPI on Railway starter. Single Redis instance.
Phase 2 (10k–100k): Extract inference module to GPU Railway instance. Add R2 CDN caching rules.
Phase 3 (100k+): Split inference into microservice. Horizontal scale FastAPI. Consider Supabase Pro with read replicas.
