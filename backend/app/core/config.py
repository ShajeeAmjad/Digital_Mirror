from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Supabase
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_JWT_SECRET: str
    SUPABASE_DB_URL: str  # postgresql+asyncpg://... (direct DB connection, not the HTTP URL)

    # Cloudflare R2
    R2_ACCOUNT_ID: str
    R2_ACCESS_KEY: str
    R2_SECRET_KEY: str
    R2_BUCKET: str
    R2_ENDPOINT: str  # https://<account-id>.r2.cloudflarestorage.com

    # Upstash Redis
    UPSTASH_REDIS_URL: str

    # Anthropic
    ANTHROPIC_API_KEY: str

    # RevenueCat
    REVENUECAT_SECRET_KEY: str

    # App
    APP_ENV: Literal["development", "production"] = "development"


settings = Settings()
