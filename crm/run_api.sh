#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
# Only watch app code — not .venv (avoids endless reload loops)
# Explicit asyncio loop: do not use uvloop (crashes Streamlit in this venv)
exec uvicorn api.main:app --reload --reload-dir api --loop asyncio --host 127.0.0.1 --port 8000
