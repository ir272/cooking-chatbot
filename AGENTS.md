# Agent Guidelines for `cooking-chatbot`

These instructions define how AI agents (GitHub Copilot, Claude, Cursor, etc.) should behave
when assigned an issue, task, or multi-step problem in this repository.

Behave like a senior contributor: precise, efficient, aligned with the project's
architecture, and focused on clean, minimal implementations.

---

## 1. Before You Code

- Read the task/issue thoroughly before acting.
- Identify missing information; ask **one targeted clarification question** if needed.
- Outline a step-by-step plan before making changes.
- Check whether the feature or fix already exists under a different name.
- Review the relevant parts of the codebase before proposing changes:
  - Backend: `backend/app/` — FastAPI + LangGraph
  - Frontend: `frontend/src/` — Next.js 16 + Tailwind CSS 4
- Read `CLAUDE.md` for project-specific context and technical decisions.

---

## 2. Architecture Overview

```
cooking-chatbot/
├── backend/              # Python — FastAPI + LangGraph
│   ├── app/
│   │   ├── config.py     # Pydantic Settings (.env loading)
│   │   ├── main.py       # FastAPI app, SSE chat endpoint
│   │   ├── graphs/
│   │   │   └── cooking.py  # LangGraph StateGraph (classify → agent/reject)
│   │   ├── prompts/
│   │   │   └── system.py   # System prompt
│   │   ├── schemas/
│   │   │   └── chat.py     # Pydantic request/response models
│   │   └── tools/
│   │       ├── cookware.py # Hardcoded cookware lookup
│   │       └── search.py   # Web search (Tavily → DuckDuckGo fallback)
│   ├── tests/
│   │   ├── conftest.py     # Fixtures (test client, mock settings)
│   │   ├── test_api.py     # API endpoint tests
│   │   └── test_tools.py   # Tool unit tests
│   ├── Dockerfile
│   └── pyproject.toml      # uv project config
├── frontend/             # TypeScript — Next.js 16 + React 19
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css       # Design system (warm cream/orange/sage palette)
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Home page (renders ChatContainer)
│   │   │   └── api/chat/route.ts # Proxy to backend SSE endpoint
│   │   ├── components/chat/
│   │   │   ├── chat-container.tsx  # Layout orchestrator (header, scroll, typing)
│   │   │   ├── chat-input.tsx      # Auto-growing textarea + send button
│   │   │   ├── chat-message.tsx    # Markdown-rendered messages + copy button
│   │   │   └── suggested-prompts.tsx # Welcome state with prompt cards
│   │   ├── hooks/
│   │   │   └── use-chat.ts        # Streaming chat hook (SSE client)
│   │   ├── lib/
│   │   │   └── api.ts             # SSE fetch + ReadableStream client
│   │   └── types/
│   │       └── chat.ts            # Message interface
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml    # Full-stack orchestration
├── CLAUDE.md             # Project context for AI agents
└── .github/workflows/
    └── ci.yml            # GitHub Actions (backend, frontend, docker jobs)
```

### Graph Flow (Backend Core Logic)

```
START → classify_query → (cooking)   → agent ⇄ tools → END
                       → (off_topic) → reject_query  → END
```

The classification node output is **never** streamed to the frontend — only the agent or rejection response is.

---

## 3. Repository Conventions

### Branching & Commits

- Branch from `main` for features/fixes.
- Use **conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`, `chore:`.
- Keep PRs focused — one concern per PR.

### Backend (Python)

- **Package manager**: `uv` (not pip, not poetry)
- **Code style**: `ruff` for linting + formatting
- **Type hints**: Required on all new code
- **Naming**: `snake_case` for functions/variables, PascalCase for classes
- **Models**: Pydantic v2 (`BaseModel`, `BaseSettings`)
- **No unnecessary abstractions** — keep it simple

### Frontend (TypeScript)

- **Package manager**: `pnpm` (not npm, not yarn)
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS 4 with `@theme inline` design tokens
- **Components**: Functional React components, `"use client"` where needed
- **Naming**: `camelCase` for variables/functions, PascalCase for components
- **State**: React hooks only — no external state management library
- **Icons**: `lucide-react` for all icons

### Design System

The frontend uses a warm cooking theme defined in `globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `cream-50` | `#FFFBF5` | Page background |
| `cream-100` | `#FFF5E6` | Card backgrounds, assistant bubbles |
| `cream-200` | `#FFE8C8` | Borders, subtle accents |
| `bark-600` | `#44362B` | Secondary text |
| `bark-800` | `#2D221A` | Primary text, user bubbles |
| `orange-500` | `#F97316` | Accent (typing dots, list markers) |
| `orange-600` | `#EA580C` | Primary action (buttons, avatars) |
| `sage-500` | `#6B8F5E` | Secondary accent (list markers) |

Do not introduce new colors without justification. Do not use raw hex values — use the Tailwind token names (e.g., `bg-cream-100`, `text-bark-800`).

---

## 4. Development Commands

### Backend

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8001   # Dev server
uv run pytest -v                                     # Run tests
uv run ruff check .                                  # Lint
uv run ruff format .                                 # Format
```

### Frontend

```bash
cd frontend
pnpm dev --port 3001                # Dev server
pnpm build                          # Production build (standalone output)
pnpm lint                           # ESLint
pnpm exec tsc --noEmit              # Type check
```

### Docker

```bash
docker compose up --build            # Full stack
```

### Environment

- `.env` at project root — never commit
- Required: `OPENAI_API_KEY`
- Optional: `TAVILY_API_KEY` (DuckDuckGo fallback works without it)

---

## 5. Implementing Features

### Backend Features

1. Determine if the feature is a new tool, a graph modification, or an API change.
2. **New tools** go in `backend/app/tools/` — register them in the graph's tool list in `cooking.py`.
3. **Graph changes** — modify `backend/app/graphs/cooking.py`. Understand the existing StateGraph before changing it.
4. **API changes** — modify `backend/app/main.py` and update schemas in `backend/app/schemas/`.
5. Add tests in `backend/tests/` covering the new functionality.
6. Run `uv run pytest -v` and `uv run ruff check .` before committing.

### Frontend Features

1. Determine if the feature is a new component, a hook change, or a styling update.
2. **New components** go in `frontend/src/components/` — use the existing patterns (functional, `"use client"`, Tailwind).
3. **Chat flow changes** — the streaming logic lives in `hooks/use-chat.ts` and `lib/api.ts`. Be careful with SSE parsing.
4. **Styling changes** — use the existing design tokens in `globals.css`. Do not add new CSS frameworks.
5. Run `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build` before committing.

### Cross-Stack Features

When a feature spans backend + frontend:
1. Implement and test the backend change first.
2. Update the frontend to consume the new API.
3. Test the full flow with both servers running.

---

## 6. Fixing Bugs

1. Reproduce and understand the root cause.
2. Write a test that reproduces the bug (it should fail before the fix).
3. Apply a minimal, targeted fix.
4. Verify the test passes and no other components break.
5. Check both backend tests and frontend build — bugs often cascade.

---

## 7. Refactoring

- Preserve behavior and API stability.
- Improve readability or performance.
- Reduce duplication.
- Avoid large, sweeping refactors unless explicitly requested.
- Do not change the design system colors or component structure without approval.

---

## 8. Before You Commit

Always run these checks before committing:

```bash
# Backend
cd backend
uv run ruff check .
uv run ruff format --check .
uv run pytest -v

# Frontend
cd frontend
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

- All checks must pass.
- Fix any issues reported and re-run until clean.
- Use conventional commit messages.
- Do not commit `.env`, `node_modules/`, `.next/`, `.venv/`, or `__pycache__/`.

---

## 9. Key Constraints

- **Classification is internal** — never expose the classify_query node output to the user.
- **Cookware list is static** — it's hardcoded in `backend/app/tools/cookware.py`, not fetched dynamically.
- **SSE streaming** — the frontend uses raw `fetch` + `ReadableStream`, not WebSockets or Vercel AI SDK.
- **InMemorySaver** — dev only. Do not assume state persists across server restarts.
- **Standalone output** — `next.config.ts` has `output: "standalone"` for Docker. Do not remove this.
- **Port assignments** — Backend: 8001, Frontend: 3001. These are non-standard to avoid conflicts.

---

## 10. CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs three jobs:

| Job | Trigger | Steps |
|-----|---------|-------|
| `backend` | Changes in `backend/` | uv sync → ruff check → ruff format → pytest |
| `frontend` | Changes in `frontend/` | pnpm install → tsc → eslint → next build |
| `docker` | Push to main + any code changes | docker compose build |

Path filtering means only relevant jobs run. If your change touches both `backend/` and `frontend/`, both jobs will run.

The backend test step uses a dummy `OPENAI_API_KEY` — tests should not make real API calls. Mock external dependencies in tests.
