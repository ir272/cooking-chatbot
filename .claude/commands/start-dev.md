Start the development servers for the cooking chatbot.

1. Start the backend:
```bash
cd /Users/ianroybal/cooking-chatbot/backend && uv run uvicorn app.main:app --reload --port 8001 &
```

2. Start the frontend:
```bash
cd /Users/ianroybal/cooking-chatbot/frontend && PORT=3001 pnpm dev &
```

3. Wait for both to be ready and verify:
```bash
sleep 5 && curl -s http://localhost:8001/health && curl -s -o /dev/null -w "Frontend: %{http_code}" http://localhost:3001
```

Report the status of both services.
