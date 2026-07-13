from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

CRM_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = CRM_ROOT / "data" / "nuvue_crm.db"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(CRM_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    crm_api_key: str = "dev-local-api-key"
    crm_cors_origins: str = "http://localhost:8080,http://127.0.0.1:8080,null"
    crm_database_url: str = f"sqlite:///{DEFAULT_DB_PATH}"
    # Server-side only — never expose in website HTML/JS
    web3forms_access_key: str = ""
    web3forms_subject: str = "New NuVue Media contact form message"
    web3forms_from_name: str = "NuVue Media Website"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.crm_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return Settings()
