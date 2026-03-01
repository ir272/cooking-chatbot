Test the end-to-end flow of the cooking chatbot.

1. Verify backend is running on port 8001:
```bash
curl -s http://localhost:8001/health
```

2. Test a cooking query (should classify as cooking, search, check cookware, respond):
```bash
curl -s -X POST http://localhost:8001/chat -H "Content-Type: application/json" -d '{"message": "How do I make scrambled eggs?", "thread_id": "e2e-test-1"}'
```

3. Test an off-topic query (should reject):
```bash
curl -s -X POST http://localhost:8001/chat -H "Content-Type: application/json" -d '{"message": "What is the capital of France?", "thread_id": "e2e-test-2"}'
```

4. Test SSE streaming:
```bash
curl -s -N -X POST http://localhost:8001/chat/stream -H "Content-Type: application/json" -d '{"message": "Give me a simple pasta recipe", "thread_id": "e2e-test-3"}' | head -20
```

5. Test the frontend proxy:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
```

Report the results of each test.
