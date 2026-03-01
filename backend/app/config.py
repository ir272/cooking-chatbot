from pathlib import Path

from pydantic_settings import BaseSettings

# Find .env relative to this file: backend/app/config.py -> ../../.env
_env_file = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    openai_api_key: str
    tavily_api_key: str = ""
    model_name: str = "gpt-4o-mini"
    model_temperature: float = 0.7

    model_config = {"env_file": str(_env_file), "env_file_encoding": "utf-8"}


settings = Settings()
