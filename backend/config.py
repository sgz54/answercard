# ─────────────────────────────────────────────────────────────
# Settings loaded from environment variables.
# ─────────────────────────────────────────────────────────────
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:5173"

    # DeepSeek
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"
    deepseek_base_url: str = "https://api.deepseek.com"

    # PayPal (https://developer.paypal.com → Dashboard → API credentials)
    paypal_client_id: str = ""
    paypal_secret: str = ""
    paypal_mode: str = "sandbox"  # "sandbox" or "live"
    paypal_webhook_id: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_service_key: str = ""

    # Frontend
    frontend_url: str = "http://localhost:5173"

    # Pricing (kept in sync with frontend src/lib/pricing.ts)
    unlock_usd: float = 2.99
    monthly_usd: float = 6.99
    followup_pack_usd: float = 0.99
    followup_pack_credits: int = 5
    free_daily_casts: int = 1
    free_followups_per_question: int = 1

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
