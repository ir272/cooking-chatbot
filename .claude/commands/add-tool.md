Add a new LangChain tool to the cooking chatbot.

When adding a new tool:
1. Create the tool file in `backend/app/tools/`
2. Use the `@tool` decorator from `langchain_core.tools`
3. Export it from `backend/app/tools/__init__.py`
4. Add it to the tools list in `backend/app/graphs/cooking.py` (in `build_graph()`)
5. Write tests in `backend/tests/test_tools.py`
6. Run tests to verify: `cd backend && uv run pytest -v`

Follow the pattern established by `cookware.py` for the tool implementation.
