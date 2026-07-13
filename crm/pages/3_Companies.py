import streamlit as st

from crm_client import api_request
from ui import apply_hubspot_theme, page_header, render_sidebar, status_pill

st.set_page_config(page_title="Companies | NuVue CRM", layout="wide")
apply_hubspot_theme()
render_sidebar()
page_header("Companies", "Accounts converted from contacts — like HubSpot companies.")

query = st.text_input("Search companies", placeholder="Name or email", value="")

try:
    params = {"q": query.strip()} if query.strip() else None
    clients = api_request("GET", "/api/clients", params=params)
except Exception as exc:
    st.error(str(exc))
    st.stop()

st.caption(f"{len(clients)} company(ies)")

st.markdown('<div class="hs-panel"><h3>Company directory</h3>', unsafe_allow_html=True)
if clients:
    st.dataframe(
        [
            {
                "ID": client["id"],
                "Company / Contact": client["name"],
                "Email": client["email"],
                "Phone": client.get("phone") or "—",
                "Source contact": client.get("created_from_lead_id") or "—",
                "Created": client["created_at"],
            }
            for client in clients
        ],
        hide_index=True,
        width="stretch",
    )
else:
    st.markdown(
        '<div class="hs-empty">No companies yet. Convert a contact to create one.</div>',
        unsafe_allow_html=True,
    )
st.markdown("</div>", unsafe_allow_html=True)

if not clients:
    st.stop()

st.markdown('<div class="hs-panel"><h3>Company record</h3>', unsafe_allow_html=True)
selected_id = st.selectbox(
    "Open company",
    [client["id"] for client in clients],
    format_func=lambda i: next(
        f"{item['name']}  ·  {item['email']}" for item in clients if item["id"] == i
    ),
)
client = next(item for item in clients if item["id"] == selected_id)

with st.form("update_client"):
    c1, c2 = st.columns(2)
    with c1:
        name = st.text_input("Name", value=client["name"])
        email = st.text_input("Email", value=client["email"])
    with c2:
        phone = st.text_input("Phone", value=client.get("phone") or "")
        notes = st.text_area("Notes", value=client.get("notes") or "")
    saved = st.form_submit_button("Save company", type="primary")

if saved:
    try:
        api_request(
            "PATCH",
            f"/api/clients/{selected_id}",
            json={
                "name": name,
                "email": email,
                "phone": phone or None,
                "notes": notes or None,
            },
        )
        st.success("Company updated.")
        st.rerun()
    except Exception as exc:
        st.error(str(exc))

st.markdown("#### Associated deals")
try:
    projects = api_request("GET", f"/api/clients/{selected_id}/projects")
except Exception as exc:
    st.error(str(exc))
    projects = []

if projects:
    for project in projects:
        st.markdown(
            f"**{project['title']}** &nbsp; {status_pill(project['status'])}  \n"
            f"{project['service']} · Shoot: {project.get('shoot_date') or 'TBD'}",
            unsafe_allow_html=True,
        )
else:
    st.markdown('<div class="hs-empty">No deals linked yet.</div>', unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)

st.markdown('<div class="hs-panel"><h3>Create company</h3>', unsafe_allow_html=True)
with st.form("create_client"):
    c_name = st.text_input("Name", key="new_client_name")
    c_email = st.text_input("Email", key="new_client_email")
    c_phone = st.text_input("Phone (optional)", key="new_client_phone")
    c_notes = st.text_area("Notes", key="new_client_notes")
    created = st.form_submit_button("Create company", type="primary")

if created:
    if not (c_name.strip() and c_email.strip()):
        st.error("Name and email are required.")
    else:
        try:
            api_request(
                "POST",
                "/api/clients",
                json={
                    "name": c_name.strip(),
                    "email": c_email.strip(),
                    "phone": c_phone.strip() or None,
                    "notes": c_notes.strip() or None,
                },
            )
            st.success("Company created.")
            st.rerun()
        except Exception as exc:
            st.error(str(exc))
st.markdown("</div>", unsafe_allow_html=True)
