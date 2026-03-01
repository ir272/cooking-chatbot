from uuid import uuid4

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="The user's message")
    thread_id: str = Field(
        default_factory=lambda: str(uuid4()),
        description="Thread ID for conversation continuity",
    )

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be blank")
        return v.strip()


class ChatResponse(BaseModel):
    message: str
    thread_id: str


class ErrorResponse(BaseModel):
    error: str
    detail: str = ""
