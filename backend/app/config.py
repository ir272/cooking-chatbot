from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    tavily_api_key: str = ""
    model_name: str = "gpt-4o-mini"
    model_temperature: float = 0.7

    model_config = {"env_file": "../.env", "env_file_encoding": "utf-8"}


settings = Settings()
