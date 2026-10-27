from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    )

    # Elexon BMRS API
    ELEXON_BASE_URL: str = "https://data.elexon.co.uk/bmrs/api/v1"
    ELEXON_TIMEOUT_SECONDS: float = 30.0
    ELEXON_MAX_RETRIES: int = 3
    CACHE_DIR: str = "data_cache"

    # Purchasing decision cutoff default
    DEFAULT_DECISION_CUTOFF_HOUR: int = 12
    DEFAULT_DECISION_CUTOFF_MINUTE: int = 0

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]


settings = Settings()
