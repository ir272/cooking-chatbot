# Cooking Chatbot

An LLM-powered cooking and recipe Q&A application built with LangGraph, FastAPI, and Next.js.

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

### Graph Flow

1. **classify_query** — A lightweight LLM call determines if the user's question is cooking-related or off-topic
2. **reject_query** — Off-topic queries receive a polite redirect message
3. **agent** — The main LLM node with bound tools processes cooking queries
4. **tools** — LangGraph's `ToolNode` executes tool calls (search, cookware check)
5. The agent loops with tools until it has a final answer, then streams it back via SSE

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| LLM Orchestration | LangGraph | 1.0.10 |
| LLM | GPT-4o-mini (via LangChain) | — |
| Backend | FastAPI + Uvicorn | 0.115+ |
| Streaming | SSE via sse-starlette | 2.2+ |
| Frontend | Next.js (App Router) | 16.x |
| Styling | Tailwind CSS | 4.x |
| Language | Python 3.13 / TypeScript 5.x | — |
| Package Mgmt | uv (Python) / pnpm (Node) | — |
| Containerization | Docker + Docker Compose | — |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 22+
- [uv](https://docs.astral.sh/uv/) (`curl -LsSf https://astral.sh/uv/install.sh | sh`)
- pnpm (`corepack enable`)
- Docker Desktop (for containerized deployment)

### API Keys

Create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env with your keys:
# OPENAI_API_KEY=sk-...
# TAVILY_API_KEY=tvly-...  (optional — DuckDuckGo works without it)
```

### Local Development

**Backend:**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm dev
```

Open http://localhost:3000

### Docker

```bash
docker compose up --build
```

Backend: http://localhost:8000 | Frontend: http://localhost:3000

## API Reference

### `GET /health`
Health check endpoint.

**Response:** `{"status": "ok"}`

### `POST /chat`
Non-streaming chat endpoint.

**Request:**
```json
{
  "message": "How do I make scrambled eggs?",
  "thread_id": "optional-uuid"
}
```

**Response:**
```json
{
  "message": "Here's how to make scrambled eggs...",
  "thread_id": "uuid"
}
```

### `POST /chat/stream`
SSE streaming chat endpoint.

**Request:** Same as `/chat`

**Response:** Server-Sent Events stream:
```
data: {"token": "Here's", "thread_id": "uuid"}
data: {"token": " how", "thread_id": "uuid"}
data: {"token": " to", "thread_id": "uuid"}
...
data: [DONE]
```

## Architecture Decisions

### Custom StateGraph over `create_react_agent`
The classification gate (cooking vs. off-topic) requires routing *before* the agent loop. A custom `StateGraph` makes this control flow explicit and auditable, while `create_react_agent` has no concept of pre-loop classification.

### GPT-4o-mini as the LLM
At $0.15/$0.60 per 1M tokens, it's 30x cheaper than GPT-4o with excellent tool-calling reliability. A cooking Q&A bot doesn't need frontier-level reasoning — the tools (search, cookware check) do the heavy lifting.

### Separate Classification Node
A dedicated LLM call for classification enables fail-fast rejection of off-topic queries (~200ms) instead of running the full agent loop. It's independently testable and uses structured output for deterministic routing.

### SSE over WebSockets
Chat streaming is unidirectional (server→client). SSE works over standard HTTP, plays nicely with load balancers/proxies, and requires ~10 lines of frontend code vs. WebSocket lifecycle management.

### Tavily + DuckDuckGo Dual Search
Tavily is purpose-built for LLM applications with pre-extracted content. DuckDuckGo serves as a zero-config fallback requiring no API key, demonstrating resilience thinking.

### LLM-Decided Cookware Check
The cookware tool is available but not mandatory. The system prompt instructs "when providing a recipe, ALWAYS call check_cookware first." This preserves flexibility — not every cooking query needs a cookware check.

### Next.js API Route Proxy
The frontend calls its own `/api/chat` route, which proxies to FastAPI. This keeps the backend URL server-side, eliminates CORS for the browser, and enables future middleware (rate limiting, auth, logging).

### Raw fetch + ReadableStream
Zero additional dependencies for consuming SSE on the frontend. The data flow from backend to UI is fully transparent — no SDK magic to debug.

### uv for Python Packaging
10-100x faster than pip, deterministic lockfile, Docker cache-friendly. Rapidly becoming the standard Python tooling choice.

## AWS Deployment Plan

### Infrastructure
- **ECS Fargate** — Serverless container orchestration for both backend and frontend services
- **Application Load Balancer (ALB)** — Path-based routing: `/api/*` → backend, `/*` → frontend
- **ECR** — Container registry for Docker images
- **CloudFront** — CDN for static frontend assets with edge caching

### Secrets & Configuration
- **AWS Secrets Manager** — Store API keys (OPENAI_API_KEY, TAVILY_API_KEY)
- **SSM Parameter Store** — Non-sensitive config (model name, temperature)
- **ECS Task Definition** — Reference secrets via `valueFrom` ARN injection

### Networking
- **VPC** — Private subnets for ECS tasks, public subnets for ALB
- **Security Groups** — ALB accepts 80/443, backend only accepts from ALB on 8000
- **HTTPS** — ACM certificate on ALB, HTTP→HTTPS redirect

### CI/CD
- **GitHub Actions** — Build, test, push to ECR, deploy to ECS
- **Blue/Green Deployment** — ECS rolling updates with health check gates

## Auth & Security Plan

### Authentication
- **API Key Authentication** — Custom header (`X-API-Key`) validated by FastAPI middleware
- **JWT Tokens** (future) — For user-specific sessions and conversation history
- **Rate Limiting** — `slowapi` middleware: 30 requests/minute per IP

### Input Validation
- **Pydantic v2** — Strict schema validation on all request bodies
- **Message Length** — Max 2,000 characters per message
- **Content Filtering** — Classification gate rejects non-cooking queries

### Infrastructure Security
- **CORS** — Restricted to frontend origin only
- **HTTPS** — Enforced via ALB with ACM certificate
- **Secrets** — Never in code or environment variables; injected via Secrets Manager
- **Container Scanning** — ECR image scanning for CVEs

## ELT Integration Plan

### Observability Stack
- **OpenTelemetry** — Distributed tracing across FastAPI ↔ LangGraph ↔ LLM calls
- **Structured Logging** — JSON logs via `structlog` for machine-parseable output
- **CloudWatch Logs** — Centralized log aggregation with log group per service
- **CloudWatch Metrics** — Custom metrics: request latency, token usage, tool call frequency

### LLM-Specific Monitoring
- **LangSmith** — LangChain's native tracing platform for debugging agent behavior
- **Token Tracking** — Log input/output tokens per request for cost monitoring
- **Tool Usage Analytics** — Track which tools are called, success/failure rates

### Data Pipeline (Future)
- **Kinesis Data Firehose** — Stream conversation logs to S3
- **Glue Crawler** — Schema discovery on conversation data
- **Athena** — Ad-hoc SQL queries on conversation history
- **QuickSight** — Dashboards for usage patterns, popular queries, error rates

## Edge Cases

| Edge Case | How It's Handled |
|-----------|-----------------|
| Off-topic queries | Classification gate rejects with friendly redirect to cooking topics |
| Missing cookware | Tool returns available alternatives; agent suggests recipe modifications |
| Empty message | Pydantic validation rejects (min_length=1), returns 422 |
| Very long message | Pydantic validation rejects (max_length=2000), returns 422 |
| API rate limits (Tavily) | DuckDuckGo search serves as automatic fallback |
| LLM hallucination | Search tools ground responses in real web results |
| Streaming disconnect | Frontend handles incomplete streams; error state displayed |
| Concurrent conversations | InMemorySaver with thread_id isolation (upgrade to PostgresSaver for production) |
| Ambiguous classification | Defaults to "cooking" — better to attempt an answer than reject incorrectly |
| Network timeout | FastAPI returns structured error; frontend displays error message |

## Testing

```bash
cd backend
uv run pytest -v
```

Tests cover:
- **Tool tests** — Cookware availability, missing items, case sensitivity, edge cases
- **API tests** — Health endpoint, input validation
- **Graph tests** — Classification routing (with mocked LLM)
