# Environment Variables Guide

## Backend (.env in backend/)

```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret          # From Supabase dashboard → Settings → API
SUPABASE_DB_URL=postgresql+asyncpg://postgres:[password]@db.[ref].supabase.co:5432/postgres
                                             # Direct PostgreSQL connection string for SQLAlchemy.
                                             # Find under Supabase dashboard → Settings → Database → Connection string (URI mode).
                                             # Use the asyncpg scheme (not plain postgresql://).

# Cloudflare R2
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET=digital-mirror-images
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# Upstash Redis
UPSTASH_REDIS_URL=redis://:password@your-upstash-endpoint:port

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# RevenueCat
REVENUECAT_SECRET_KEY=sk_...

# App
APP_ENV=development   # or production
```

## Mobile (.env in apps/mobile/)

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000    # or Railway URL in prod
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

Note: `EXPO_PUBLIC_` prefix makes variables available in the JS bundle.
Do NOT prefix secrets (API keys that talk to paid services) with `EXPO_PUBLIC_` —
those belong in the backend only.

## Railway (production backend)

Set all backend env vars via the Railway dashboard → Service → Variables.
Never commit `.env` to git. `.env` is gitignored.

## EAS (production mobile builds)

Set mobile env vars via `eas secret:create`:
```bash
eas secret:create --scope project --name SUPABASE_URL --value "..."
```
Reference in `eas.json` under `env`.

## Model download credentials (for ML models)

```
MODELS_R2_ACCESS_KEY=...   # Read-only key for the models bucket
MODELS_R2_SECRET_KEY=...
MODELS_R2_BUCKET=digital-mirror-models
```

Used only by `scripts/download_models.sh`. Not needed at runtime.
