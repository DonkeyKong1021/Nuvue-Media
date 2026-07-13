import streamlit as st

from crm_client import LEAD_STATUSES, SERVICES, api_request
from ui import apply_hubspot_theme, page_header, records_table, render_sidebar, status_pill

st.set_page_config(page_title="Contacts | NuVue CRM", layout="wide")
apply_hubspot_theme()
render_sidebar()
page_header("Contacts", "Website inquiries and manual leads — HubSpot-style contact records.")

filter_col, search_col, _ = st.columns([1, 2, 1])
with filter_col:
    status_filter = st.selectbox("Lifecycle stage", ["all", *LEAD_STATUSES], index=0)
with search_col:
    query = st.text_input("Search contacts", placeholder="Name, email, or message", value="")

params: dict = {}
if status_filter != "all":
    params["status"] = status_filter
if query.strip():
    params["q"] = query.strip()

try:
    leads = api_request("GET", "/api/leads", params=params or None)
except Exception as exc:
    st.error(str(exc))
    st.stop()

st.caption(f"{len(leads)} contact(s)")

st.markdown('<div class="hs-panel"><h3>Contact list</h3>', unsafe_allow_html=True)
if leads:
    records_table(
        [
            {
                "ID": lead["id"],
                "Name": lead["name"],
                "Email": lead["email"],
                "Phone": lead.get("phone") or "—",
                "Interest": lead["service"],
                "Stage": lead["status"],
                "Created": lead["created_at"],
            }
            for lead in leads
        ]
    )
else:
    st.markdown(
        '<div class="hs-empty">No contacts yet. Website form submissions land here automatically.</div>',
        unsafe_allow_html=True,
    )
st.markdown("</div>", unsafe_allow_html=True)

if not leads:
    st.stop()

st.markdown('<div class="hs-panel"><h3>Record</h3>', unsafe_allow_html=True)

lead_ids = [lead["id"] for lead in leads]
selected_id = st.selectbox(
    "Open contact",
    lead_ids,
    format_func=lambda i: next(
        f"{item['name']}  ·  {item['email']}" for item in leads if item["id"] == i
    ),
)
lead = next(item for item in leads if item["id"] == selected_id)

st.markdown(
    f"**{lead['name']}** &nbsp; {status_pill(lead['status'])}",
    unsafe_allow_html=True,
)
st.markdown(f"_{lead['email']}_ · {lead.get('phone') or 'No phone'}")
st.markdown("**Inquiry**")
st.write(lead["message"])

with st.form("update_lead"):
    c1, c2 = st.columns(2)
    with c1:
        name = st.text_input("Name", value=lead["name"])
        email = st.text_input("Email", value=lead["email"])
        phone = st.text_input("Phone", value=lead.get("phone") or "")
    with c2:
        service = st.selectbox(
            "Interest",
            SERVICES,
            index=SERVICES.index(lead["service"]) if lead["service"] in SERVICES else 0,
        )
        status = st.selectbox(
            "Lifecycle stage",
            LEAD_STATUSES,
            index=LEAD_STATUSES.index(lead["status"]) if lead["status"] in LEAD_STATUSES else 0,
        )
        notes = st.text_area("Internal notes", value=lead.get("notes") or "")
    saved = st.form_submit_button("Save contact", type="primary")

if saved:
    try:
        api_request(
            "PATCH",
            f"/api/leads/{selected_id}",
            json={
                "name": name,
                "email": email,
                "phone": phone or None,
                "service": service,
                "status": status,
                "notes": notes or None,
            },
        )
        st.success("Contact updated.")
        st.rerun()
    except Exception as exc:
        st.error(str(exc))

st.markdown("</div>", unsafe_allow_html=True)

st.markdown('<div class="hs-panel"><h3>Create company + deal</h3>', unsafe_allow_html=True)
if lead["status"] == "converted":
    st.info("This contact is already converted.")
else:
    with st.form("convert_lead"):
        create_project = st.checkbox("Create deal", value=True)
        project_title = st.text_input(
            "Deal name", value=f"{lead['service']} — {lead['name']}"
        )
        client_notes = st.text_area("Company notes", value=lead.get("notes") or "")
        converted = st.form_submit_button("Convert contact", type="primary")

    if converted:
        try:
            result = api_request(
                "POST",
                f"/api/leads/{selected_id}/convert",
                json={
                    "create_project": create_project,
                    "project_title": project_title or None,
                    "client_notes": client_notes or None,
                },
            )
            st.success(
                f"Created company #{result['client_id']}"
                + (f" and deal #{result['project_id']}" if result.get("project_id") else "")
            )
            st.rerun()
        except Exception as exc:
            st.error(str(exc))
st.markdown("</div>", unsafe_allow_html=True)

st.markdown('<div class="hs-panel"><h3>Create contact</h3>', unsafe_allow_html=True)
with st.form("create_lead"):
    m1, m2 = st.columns(2)
    with m1:
        m_name = st.text_input("Name")
        m_email = st.text_input("Email")
        m_phone = st.text_input("Phone (optional)")
    with m2:
        m_service = st.selectbox("Interest", SERVICES)
        m_message = st.text_area("Message")
    created = st.form_submit_button("Create contact", type="primary")

if created:
    if not (m_name.strip() and m_email.strip() and m_message.strip()):
        st.error("Name, email, and message are required.")
    else:
        try:
            api_request(
                "POST",
                "/api/leads",
                json={
                    "name": m_name.strip(),
                    "email": m_email.strip(),
                    "phone": m_phone.strip() or None,
                    "service": m_service,
                    "message": m_message.strip(),
                    "source": "manual",
                },
            )
            st.success("Contact created.")
            st.rerun()
        except Exception as exc:
            st.error(str(exc))
st.markdown("</div>", unsafe_allow_html=True)
