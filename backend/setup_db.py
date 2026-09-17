"""One-time schema setup: runs db/schema.sql against your Supabase project."""
import httpx
from config import get_settings

settings = get_settings()

sql = open("db/schema.sql", encoding="utf-8").read()

resp = httpx.post(
    f"{settings.supabase_url}/pg/query",
    headers={
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "Content-Type": "application/json",
    },
    json={"query": sql},
    timeout=30,
)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.text[:500]}")
