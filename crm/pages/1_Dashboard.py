import streamlit as st

from crm_client import api_request
from ui import apply_hubspot_theme, metric_cards, page_header, records_table, render_sidebar, status_pill

st.set_page_config(page_title="Home | NuVue CRM", layout="wide")
apply_hubspot_theme()
render_sidebar()
page_header("Dashboard", "Pipeline snapshot across contacts, companies, and deals.")

try:
    stats = api_request("GET", "/api/stats")
    leads = api_request("GET", "/api/leads")
    projects = api_request("GET", "/api/projects")
except Exception as exc:
    st.error(str(exc))
    st.stop()

open_deals = sum(
    count
    for status, count in stats["projects_by_status"].items()
    if status not in {"delivered", "cancelled"}
)

metric_cards(
    [
        ("Total contacts", stats["total_leads"], f"{stats['leads_by_status'].get('new', 0)} need follow-up"),
        ("Companies", stats["total_clients"], None),
        ("Open deals", open_deals, f"{stats['total_projects']} total"),
        ("Delivered", stats["projects_by_status"].get("delivered", 0), "Closed won"),
    ]
)

left, right = st.columns(2)

with left:
    st.markdown('<div class="hs-panel"><h3>Contact lifecycle</h3>', unsafe_allow_html=True)
    for status, count in stats["leads_by_status"].items():
        st.markdown(
            f"{status_pill(status)} &nbsp; **{count}**",
            unsafe_allow_html=True,
        )
    st.markdown("</div>", unsafe_allow_html=True)

with right:
    st.markdown('<div class="hs-panel"><h3>Deal stages</h3>', unsafe_allow_html=True)
    for status, count in stats["projects_by_status"].items():
        st.markdown(
            f"{status_pill(status)} &nbsp; **{count}**",
            unsafe_allow_html=True,
        )
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown('<div class="hs-panel"><h3>Recent contacts</h3>', unsafe_allow_html=True)
recent = leads[:5]
if recent:
    records_table(
        [
            {
                "Name": lead["name"],
                "Email": lead["email"],
                "Service": lead["service"],
                "Status": lead["status"],
                "Created": lead["created_at"],
            }
            for lead in recent
        ]
    )
else:
    st.markdown('<div class="hs-empty">No contacts yet.</div>', unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)

st.markdown('<div class="hs-panel"><h3>Recent deals</h3>', unsafe_allow_html=True)
recent_deals = projects[:5]
if recent_deals:
    records_table(
        [
            {
                "Deal": deal["title"],
                "Service": deal["service"],
                "Stage": deal["status"],
                "Shoot": deal.get("shoot_date") or "—",
            }
            for deal in recent_deals
        ]
    )
else:
    st.markdown('<div class="hs-empty">No deals yet.</div>', unsafe_allow_html=True)
st.markdown("</div>", unsafe_allow_html=True)
