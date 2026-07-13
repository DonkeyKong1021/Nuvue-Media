from __future__ import annotations

from html import escape

import streamlit as st

from crm_client import DEFAULT_API_KEY, DEFAULT_API_URL, api_request

HUBSPOT_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap');

:root {
  --hs-orange: #ff7a59;
  --hs-orange-dark: #e66a4e;
  --hs-navy: #2d3e50;
  --hs-slate: #33475b;
  --hs-muted: #516f90;
  --hs-border: #cbd6e2;
  --hs-bg: #f5f8fa;
  --hs-card: #ffffff;
  --hs-teal: #00bda5;
}

html, body, [class*="css"] {
  font-family: "Lexend", "Helvetica Neue", Arial, sans-serif;
}

.stApp {
  background: var(--hs-bg);
}

[data-testid="stSidebar"] {
  background: linear-gradient(180deg, #2d3e50 0%, #1f2d3a 100%);
  border-right: 1px solid #1a2430;
}

[data-testid="stSidebar"] * {
  color: #eaf0f6 !important;
}

[data-testid="stSidebar"] .stTextInput input,
[data-testid="stSidebar"] .stTextInput input:focus {
  background: #243447 !important;
  color: #ffffff !important;
  border: 1px solid #3d5166 !important;
  border-radius: 6px !important;
}

[data-testid="stSidebar"] .stButton > button {
  background: var(--hs-orange) !important;
  color: #fff !important;
  border: none !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
}

[data-testid="stSidebarNav"] a {
  border-radius: 6px !important;
  margin: 2px 0 !important;
}

[data-testid="stSidebarNav"] a[aria-current="page"] {
  background: rgba(255, 122, 89, 0.22) !important;
  border-left: 3px solid var(--hs-orange) !important;
}

.hs-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.25rem 0 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  margin-bottom: 1rem;
}

.hs-brand-mark {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9fb3c8 !important;
  font-weight: 500;
}

.hs-brand-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: #ffffff !important;
  line-height: 1.1;
}

.hs-brand-name span {
  color: var(--hs-orange) !important;
}

.hs-page-header {
  margin: 0 0 1.25rem 0;
}

.hs-page-header h1 {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--hs-slate);
}

.hs-page-header p {
  margin: 0.35rem 0 0 0;
  color: var(--hs-muted);
  font-size: 0.95rem;
}

.hs-metric {
  background: var(--hs-card);
  border: 1px solid var(--hs-border);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  box-shadow: 0 1px 2px rgba(45, 62, 80, 0.04);
  margin-bottom: 0.75rem;
  min-height: 96px;
}

.hs-metric .label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--hs-muted);
  font-weight: 600;
}

.hs-metric .value {
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--hs-slate);
  margin-top: 0.25rem;
}

.hs-metric .hint {
  font-size: 0.8rem;
  color: var(--hs-teal);
  margin-top: 0.2rem;
  font-weight: 500;
}

.hs-panel {
  background: var(--hs-card);
  border: 1px solid var(--hs-border);
  border-radius: 10px;
  padding: 1rem 1.15rem 1.15rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(45, 62, 80, 0.04);
}

.hs-panel h3 {
  margin: 0 0 0.85rem 0;
  font-size: 1rem;
  color: var(--hs-slate);
  font-weight: 650;
}

.hs-pill {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: #eaf0f6;
  color: var(--hs-slate);
}

.hs-pill.new, .hs-pill.quoted { background: #eaf0f6; color: #516f90; }
.hs-pill.contacted, .hs-pill.booked { background: #dceeff; color: #1d6fb8; }
.hs-pill.qualified, .hs-pill.scheduled { background: #fff1cc; color: #9a6700; }
.hs-pill.converted, .hs-pill.delivered, .hs-pill.shot { background: #d9f6f0; color: #007a6e; }
.hs-pill.editing { background: #f3e8ff; color: #6b3fa0; }
.hs-pill.closed_lost, .hs-pill.cancelled { background: #fde8e6; color: #c0392b; }

.hs-deal-card {
  background: #fff;
  border: 1px solid var(--hs-border);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.65rem;
  box-shadow: 0 1px 2px rgba(45, 62, 80, 0.05);
}

.hs-deal-card .title {
  font-weight: 650;
  color: var(--hs-slate);
  font-size: 0.92rem;
  margin-bottom: 0.25rem;
}

.hs-deal-card .meta {
  font-size: 0.78rem;
  color: var(--hs-muted);
  line-height: 1.35;
}

.hs-pipeline-col-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--hs-muted);
  margin-bottom: 0.65rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid var(--hs-border);
}

.hs-empty {
  color: var(--hs-muted);
  font-size: 0.85rem;
  padding: 0.5rem 0;
}

div[data-testid="stMetric"] {
  background: var(--hs-card);
  border: 1px solid var(--hs-border);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  box-shadow: 0 1px 2px rgba(45, 62, 80, 0.04);
}

div[data-testid="stMetric"] label {
  color: var(--hs-muted) !important;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.75rem !important;
  font-weight: 650 !important;
}

div[data-testid="stMetric"] [data-testid="stMetricValue"] {
  color: var(--hs-slate) !important;
  font-weight: 700 !important;
}

.stButton > button[kind="primary"],
.stFormSubmitButton > button {
  background: var(--hs-orange) !important;
  border: none !important;
  color: white !important;
  border-radius: 6px !important;
  font-weight: 600 !important;
}

.stButton > button[kind="primary"]:hover,
.stFormSubmitButton > button:hover {
  background: var(--hs-orange-dark) !important;
}

@media (max-width: 1100px) {
  .hs-metric { min-height: 88px; }
}
</style>
"""


def apply_hubspot_theme() -> None:
    st.markdown(HUBSPOT_CSS, unsafe_allow_html=True)


def render_sidebar(show_connection: bool = True) -> None:
    with st.sidebar:
        st.markdown(
            """
            <div class="hs-brand">
              <div class="hs-brand-mark">Sales workspace</div>
              <div class="hs-brand-name">NuVue <span>CRM</span></div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        if not show_connection:
            return

        with st.expander("Connection settings", expanded=False):
            st.session_state.setdefault("crm_api_url", DEFAULT_API_URL)
            st.session_state.setdefault("crm_api_key", DEFAULT_API_KEY)
            st.session_state["crm_api_url"] = st.text_input(
                "API URL", value=st.session_state["crm_api_url"]
            )
            st.session_state["crm_api_key"] = st.text_input(
                "API Key", value=st.session_state["crm_api_key"], type="password"
            )
            if st.button("Test connection", use_container_width=True):
                try:
                    health = api_request("GET", "/health")
                    st.success(f"Connected: {health}")
                except Exception as exc:
                    st.error(str(exc))


def page_header(title: str, subtitle: str) -> None:
    st.markdown(
        f"""
        <div class="hs-page-header">
          <h1>{escape(title)}</h1>
          <p>{escape(subtitle)}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def metric_cards(items: list[tuple[str, str | int, str | None]]) -> None:
    cols = st.columns(len(items) or 1)
    for col, (label, value, hint) in zip(cols, items):
        with col:
            st.metric(label=label, value=value, delta=hint)


def status_pill(status: str) -> str:
    safe = escape(status or "")
    css = escape((status or "").replace(" ", "_"))
    return f'<span class="hs-pill {css}">{safe}</span>'


def deal_card_html(title: str, client: str, service: str, shoot_date: str | None) -> str:
    date_line = f"<div>Shoot: {escape(shoot_date)}</div>" if shoot_date else ""
    return f"""
    <div class="hs-deal-card">
      <div class="title">{escape(title)}</div>
      <div class="meta">
        <div>{escape(client)}</div>
        <div>{escape(service)}</div>
        {date_line}
      </div>
    </div>
    """
