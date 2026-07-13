import streamlit as st

from ui import apply_hubspot_theme, metric_cards, page_header, render_sidebar

st.set_page_config(
    page_title="NuVue CRM",
    page_icon="NV",
    layout="wide",
    initial_sidebar_state="expanded",
)

apply_hubspot_theme()
render_sidebar()
page_header("Home", "Your HubSpot-style sales workspace for NuVue Media.")

from crm_client import api_request

try:
    stats = api_request("GET", "/api/stats")
    open_deals = sum(
        count
        for status, count in stats["projects_by_status"].items()
        if status not in {"delivered", "cancelled"}
    )
    new_leads = stats["leads_by_status"].get("new", 0)
    metric_cards(
        [
            ("Contacts", stats["total_leads"], f"{new_leads} new"),
            ("Companies", stats["total_clients"], "Active accounts"),
            ("Deals", stats["total_projects"], f"{open_deals} open"),
            ("Won", stats["projects_by_status"].get("delivered", 0), "Delivered jobs"),
        ]
    )
except Exception:
    st.info("Connect the API to load live pipeline metrics.")

st.markdown("### Get started")
st.markdown(
    """
1. Open **Contacts** to work website inquiries  
2. Convert a contact into a **Company** + **Deal**  
3. Move deals across the pipeline on **Deals**  
4. Store Pixieset gallery links on each deal when delivered
"""
)

st.caption("Tip: keep the API running with `./run_api.sh` so intake and CRM stay in sync.")
