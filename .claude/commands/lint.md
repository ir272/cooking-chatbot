Run all linters for both backend and frontend.

Backend (Python):
```bash
cd /Users/ianroybal/cooking-chatbot/backend && uv run ruff check . && uv run ruff format --check .
```

Frontend (TypeScript):
```bash
cd /Users/ianroybal/cooking-chatbot/frontend && pnpm lint && pnpm tsc --noEmit
```

Report any issues found and fix them.
