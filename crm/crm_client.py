from __future__ import annotations

import os
from typing import Any

import httpx
import streamlit as st

DEFAULT_API_URL = os.getenv("CRM_API_URL", "http://127.0.0.1:8000")
DEFAULT_API_KEY = os.getenv("CRM_API_KEY", "dev-local-api-key")


def get_api_config() -> tuple[str, str]:
    api_url = st.session_state.get("crm_api_url", DEFAULT_API_URL).rstrip("/")
    api_key = st.session_state.get("crm_api_key", DEFAULT_API_KEY)
    return api_url, api_key


def api_request(
    method: str,
    path: str,
    *,
    params: dict[str, Any] | None = None,
    json: dict[str, Any] | None = None,
) -> Any:
    api_url, api_key = get_api_config()
    headers = {"X-API-Key": api_key, "Accept": "application/json"}
    url = f"{api_url}{path}"

    try:
        with httpx.Client(timeout=20.0) as client:
            response = client.request(method, url, params=params, json=json, headers=headers)
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Could not reach CRM API at {api_url}: {exc}") from exc

    if response.status_code >= 400:
        detail = response.text
        try:
            detail = response.json().get("detail", detail)
        except Exception:
            pass
        raise RuntimeError(f"API {response.status_code}: {detail}")

    if response.status_code == 204 or not response.content:
        return None
    return response.json()


LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "closed_lost"]
PROJECT_STATUSES = [
    "quoted",
    "booked",
    "scheduled",
    "shot",
    "editing",
    "delivered",
    "cancelled",
]
SERVICES = ["Real Estate", "Weddings & Events", "Commercial", "Other"]
