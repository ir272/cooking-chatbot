import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import AIMessage, HumanMessage
from sse_starlette.sse import EventSourceResponse

from app.graphs.cooking import build_graph
from app.schemas.chat import ChatRequest, ChatResponse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Build the LangGraph agent on startup."""
    app.state.graph = build_graph()
    yield


app = FastAPI(
    title="Cooking Chatbot API",
    description="LLM-powered cooking & recipe Q&A",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Non-streaming chat endpoint."""
    try:
        config = {"configurable": {"thread_id": request.thread_id}}
        result = await app.state.graph.ainvoke(
            {"messages": [HumanMessage(content=request.message)]},
            config=config,
        )
        last_message = result["messages"][-1]
        return ChatResponse(message=last_message.content, thread_id=request.thread_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """SSE streaming chat endpoint."""
    config = {"configurable": {"thread_id": request.thread_id}}

    async def event_generator():
        try:
            async for chunk, metadata in app.state.graph.astream(
                {"messages": [HumanMessage(content=request.message)]},
                config=config,
                stream_mode="messages",
            ):
                # Only stream content from agent and reject nodes, not classify
                node = metadata.get("langgraph_node", "")
                if node == "classify":
                    continue
                if hasattr(chunk, "content") and chunk.content and isinstance(chunk, AIMessage):
                    yield json.dumps({"token": chunk.content, "thread_id": request.thread_id})
        except Exception as e:
            yield json.dumps({"error": str(e)})
        finally:
            yield "[DONE]"

    return EventSourceResponse(event_generator())
