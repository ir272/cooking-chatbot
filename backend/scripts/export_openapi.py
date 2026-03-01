"""Export the FastAPI OpenAPI schema to backend/openapi.json.

Usage:
    cd backend
    uv run python scripts/export_openapi.py
"""

import json
import sys
from pathlib import Path

# Ensure the backend package is importable when running from the backend/ dir.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: E402


def main() -> None:
    schema = app.openapi()
    out_path = Path(__file__).resolve().parent.parent / "openapi.json"
    out_path.write_text(json.dumps(schema, indent=2) + "\n")
    print(f"OpenAPI schema written to {out_path}")


if __name__ == "__main__":
    main()
