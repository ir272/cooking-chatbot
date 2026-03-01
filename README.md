# Cooking Chatbot

An LLM-powered cooking and recipe Q&A application built with LangGraph, FastAPI, and Next.js.

## Quick Start

```bash
# 1. Clone and set up environment
git clone https://github.com/ir272/cooking-chatbot.git
cd cooking-chatbot
cp .env.example .env
# Edit .env → add your OPENAI_API_KEY (required)

# 2. Start backend
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8001

# 3. Start frontend (in a new terminal)
cd frontend
pnpm install
pnpm dev --port 3001

# 4. Open http://localhost:3001
```

**Prerequisites:** Python 3.12+, Node.js 22+, [uv](https://docs.astral.sh/uv/) (`curl -LsSf https://astral.sh/uv/install.sh | sh`), pnpm (`corepack enable`)

**Docker alternative:**
```bash
docker compose up --build
# Backend: http://localhost:8001 | Frontend: http://localhost:3001
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4o-mini |
| `TAVILY_API_KEY` | No | Tavily search API key (DuckDuckGo is used as fallback) |

## Architecture

```
User → Next.js (React) → POST /api/chat → FastAPI → LangGraph Agent
                                                         │
                                    ┌────────────────────┤
                                    ▼                    ▼
                             classify_query         (if cooking)
                                    │                    │
                              off_topic?            agent node
                                    │            (LLM + tools)
                                    ▼                    │
                             reject_query     ┌──────────┼──────────┐
                                    │         ▼          ▼          ▼
                                   END    Tavily    DuckDuckGo   Cookware
                                          Search     Search      Check
                                             │          │          │
                                             └────┬─────┘──────────┘
                                                  ▼
                                            SSE stream back
                                            to frontend
```

### Monorepo Structure

```
cooking-chatbot/
├── backend/                  # Python — FastAPI + LangGraph
│   ├── app/
│   │   ├── config.py         # Pydantic Settings (env loading)
│   │   ├── main.py           # FastAPI app + SSE/REST endpoints
│   │   ├── graphs/cooking.py # LangGraph StateGraph (classify → agent/reject)
│   │   ├── prompts/system.py # System prompts
│   │   ├── schemas/chat.py   # Pydantic request/response models
│   │   └── tools/            # cookware.py (lookup), search.py (web search)
│   ├── tests/                # pytest test suite
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/                 # TypeScript — Next.js 16 + Tailwind CSS 4
│   ├── src/
│   │   ├── app/              # Pages, API proxy route, global styles
│   │   ├── components/chat/  # ChatContainer, ChatMessage, ChatInput, SuggestedPrompts
│   │   ├── hooks/use-chat.ts # SSE streaming hook
│   │   ├── lib/api.ts        # Raw fetch + ReadableStream client
│   │   └── types/chat.ts     # Message interface
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml        # Full-stack orchestration
├── .github/workflows/ci.yml  # CI pipeline (lint, test, build, docker)
├── CLAUDE.md                 # AI agent project context
└── AGENTS.md                 # AI agent contribution guidelines
```

### Graph Flow

1. **classify_query** — A lightweight LLM call determines if the user's question is cooking-related or off-topic (~200ms)
2. **reject_query** — Off-topic queries receive a polite redirect message (no agent loop cost)
3. **agent** — The main LLM node with bound tools processes cooking queries
4. **tools** — LangGraph's `ToolNode` executes tool calls (web search, cookware check)
5. The agent loops with tools until it has a final answer, then streams it back via SSE

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| LLM Orchestration | LangGraph (custom StateGraph) | 0.3+ |
| LLM | GPT-4o-mini via LangChain | — |
| Backend | FastAPI + Uvicorn | 0.115+ |
| Streaming | SSE via sse-starlette | 2.2+ |
| Frontend | Next.js (App Router) | 16.x |
| Styling | Tailwind CSS | 4.x |
| Language | Python 3.13 / TypeScript 5.x | — |
| Package Mgmt | uv (Python) / pnpm (Node) | — |
| Containerization | Docker + Docker Compose | — |

## Design Decisions & Trade-offs

### Custom StateGraph over `create_react_agent`

The classification gate (cooking vs. off-topic) requires routing *before* the agent loop. A custom `StateGraph` makes this control flow explicit and auditable. `create_react_agent` has no concept of pre-loop classification, so we'd need to embed topic filtering into the system prompt — making it invisible, untestable, and harder to debug.

**Trade-off:** More boilerplate to set up the graph, but full control over the execution path.

### GPT-4o-mini as the LLM

At $0.15/$0.60 per 1M input/output tokens, it's 30x cheaper than GPT-4o with excellent tool-calling reliability. A cooking Q&A bot doesn't need frontier reasoning — the tools (search, cookware check) do the heavy lifting. The model is easily swappable via the `MODEL_NAME` config.

**Trade-off:** Less creative/nuanced responses than GPT-4o, but the cost savings are enormous for a Q&A use case.

### Separate Classification Node

A dedicated async LLM call for classification enables fail-fast rejection of off-topic queries (~200ms) instead of running the full agent loop (1-5s with tool calls). It uses structured output for deterministic routing and is independently testable.

**Trade-off:** Adds one extra LLM call per request. At $0.15/1M tokens for a ~20-token classification, this costs <$0.01 per 1000 requests — negligible vs. the savings from not running the full agent on off-topic queries.

### SSE over WebSockets

Chat streaming is unidirectional (server→client). SSE works over standard HTTP, plays nicely with load balancers/proxies, auto-reconnects, and requires ~10 lines of frontend code vs. WebSocket lifecycle management. Next.js API routes proxy the SSE stream transparently.

**Trade-off:** No bidirectional communication, but chat doesn't need it — user messages are standard POST requests.

### Tavily + DuckDuckGo Fallback Search

Tavily is purpose-built for LLM applications with pre-extracted, citation-ready content. DuckDuckGo serves as a zero-config fallback requiring no API key, ensuring the bot always has search capability even without a Tavily key.

**Trade-off:** DuckDuckGo results are less structured than Tavily's, but functional. Only one is active at a time (not both) to avoid duplicate results and latency.

### Next.js API Route Proxy

The frontend calls its own `/api/chat` route, which proxies to FastAPI. This keeps the backend URL server-side only, eliminates CORS for the browser, and enables future middleware (rate limiting, auth, logging) without modifying the backend.

**Trade-off:** Adds a hop, but it's in-process so latency is negligible.

### Raw fetch + ReadableStream (no Vercel AI SDK)

Zero additional dependencies for consuming SSE on the frontend. The data flow from backend to UI is fully transparent — no SDK magic to debug. The `streamChat` function is ~60 lines of explicit, readable code.

**Trade-off:** More code than `useChat()` from Vercel AI SDK, but no vendor lock-in and full control over parsing behavior.

### uv for Python Packaging

10-100x faster than pip, deterministic lockfile (`uv.lock`), Docker cache-friendly. Rapidly becoming the standard Python tooling choice.

**Trade-off:** Newer tool, less community content than pip/poetry, but the developer experience improvement is substantial.

## API Reference

### `GET /health`
Health check endpoint. Returns `{"status": "ok"}`.

### `POST /chat`
Non-streaming chat endpoint.

```
Request:  {"message": "How do I make scrambled eggs?", "thread_id": "optional-uuid"}
Response: {"message": "Here's how to make scrambled eggs...", "thread_id": "uuid"}
```

### `POST /chat/stream`
SSE streaming chat endpoint. Same request format as `/chat`.

```
data: {"token": "Here's", "thread_id": "uuid"}
data: {"token": " how", "thread_id": "uuid"}
...
data: [DONE]
```

## Deployment Plan (AWS)

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Containers | ECS Fargate | Serverless container orchestration for backend + frontend |
| Routing | Application Load Balancer | Path-based routing: `/api/*` → backend, `/*` → frontend |
| Registry | ECR | Docker image storage |
| CDN | CloudFront | Edge caching for static frontend assets |
| Secrets | Secrets Manager | API keys (OPENAI_API_KEY, TAVILY_API_KEY) injected via ECS task definition `valueFrom` |
| Config | SSM Parameter Store | Non-sensitive config (model name, temperature) |
| Networking | VPC | Private subnets for ECS tasks, public subnets for ALB |
| TLS | ACM | HTTPS certificate on ALB, HTTP→HTTPS redirect |
| CI/CD | GitHub Actions | Build → test → push to ECR → deploy to ECS (blue/green rolling updates) |

### Security

- **CORS** restricted to frontend origin only
- **HTTPS** enforced via ALB with ACM certificate
- **Input validation** via Pydantic v2 (max 2000 chars, whitespace rejection)
- **Classification gate** rejects non-cooking queries before they reach the agent
- **Sanitized errors** — raw exception details are logged server-side, never exposed to clients
- **Non-root containers** — both Dockerfiles use unprivileged `USER` directives
- **`.dockerignore`** prevents `.env` secrets from being baked into images
- **Rate limiting** (planned) — `slowapi` middleware at 30 req/min per IP

### Auth (Planned)

- **Phase 1:** API key authentication via `X-API-Key` header + FastAPI middleware
- **Phase 2:** JWT tokens for user-specific sessions and conversation history persistence
- **Phase 3:** OAuth 2.0 integration for third-party login

## Edge Cases

| Edge Case | How It's Handled |
|-----------|-----------------|
| Off-topic queries | Classification gate rejects with friendly redirect |
| Missing cookware | Tool returns available alternatives; agent suggests modifications |
| Empty/whitespace message | Pydantic validation rejects (`min_length=1` + whitespace strip) |
| Very long message | Pydantic validation rejects (`max_length=2000`) |
| Tavily rate limits | DuckDuckGo search serves as automatic fallback |
| LLM hallucination | Search tools ground responses in real web results |
| Streaming disconnect | Frontend handles incomplete streams; error state displayed |
| Concurrent conversations | Thread-isolated via `thread_id` with `MemorySaver` (swap to PostgresSaver for production) |
| Ambiguous classification | Defaults to "cooking" — better to attempt an answer than reject incorrectly |
| Backend unavailable | Frontend API proxy returns 502 with user-friendly message |

## Testing

```bash
# Backend
cd backend
uv run pytest -v          # Run tests
uv run ruff check .       # Lint
uv run ruff format .      # Format

# Frontend
cd frontend
pnpm exec tsc --noEmit    # Type check
pnpm lint                 # ESLint
pnpm build                # Production build
```

Tests cover tool behavior (cookware lookup, case sensitivity, edge cases), API endpoints (health, validation), and graph classification routing.

## OpenAPI Schema

Interactive docs at `GET /docs` when backend is running. Export static schema:

```bash
cd backend && uv run python scripts/export_openapi.py   # → backend/openapi.json
```
