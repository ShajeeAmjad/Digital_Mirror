# Data Model

All tables have Row-Level Security enabled. Policies shown below each table.

## users
Managed by Supabase Auth. Extended with a `profiles` table.

## profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | References auth.users(id) |
| display_name | text | |
| skin_tone | text | e.g. "fair", "medium", "deep" |
| face_shape | text | e.g. "oval", "round", "square" |
| goals | text[] | e.g. ["natural", "glam", "editorial"] |
| subscription_status | text | "free" or "premium" — source of truth is RevenueCat |
| created_at | timestamptz | |
| updated_at | timestamptz | |

RLS: users can only SELECT and UPDATE their own row (`auth.uid() = id`).

## looks
Saved makeup looks (before/after pairs).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | References profiles(id) |
| title | text | User-given name |
| original_key | text | R2 object key for original photo |
| result_key | text | R2 object key for result photo |
| layer_config | jsonb | Serialised MakeupLayerStack |
| created_at | timestamptz | |

RLS: users can CRUD only their own looks (`auth.uid() = user_id`).

## layer_config schema (jsonb)
```json
{
  "layers": [
    {
      "type": "lipstick",
      "color": "#C0392B",
      "opacity": 0.75,
      "blendMode": "multiply",
      "enabled": true
    },
    {
      "type": "eyeshadow",
      "color": "#6C3483",
      "opacity": 0.5,
      "blendMode": "screen",
      "enabled": true
    }
  ]
}
```

## products
Curated product catalogue. Read-only from client.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | |
| brand | text | |
| category | text | lipstick, foundation, eyeshadow, etc. |
| shade | text | |
| hex_color | text | For colour matching |
| image_key | text | R2 key |
| price_gbp | numeric | |
| affiliate_url | text | |
| skin_tones | text[] | Compatible skin tones |

RLS: public read access (`true`).

## critique_results
Stores AI critique outputs (paywalled, one per look per request).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| look_id | uuid FK | References looks(id) |
| score | int | 1–10 |
| tips | jsonb | Array of tip objects |
| product_ids | uuid[] | Recommended product ids |
| created_at | timestamptz | |

RLS: users can only SELECT their own critique results.

## tutorials
Authored content. Read-only from client.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| title | text | |
| category | text | |
| difficulty | text | beginner, intermediate, advanced |
| is_premium | boolean | Paywalled tutorials |
| steps | jsonb | Array of step objects |
| thumbnail_key | text | R2 key |

RLS: free tutorials readable by all; premium tutorials only readable if user has subscription.

## Migrations
Run via Alembic: `alembic upgrade head`
Migration files in `backend/alembic/versions/`.
Never edit a migration that has been applied to production — always create a new one.
