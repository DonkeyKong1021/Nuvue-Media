from datetime import date

import streamlit as st

from crm_client import PROJECT_STATUSES, SERVICES, api_request
from ui import (
    apply_hubspot_theme,
    deal_card_html,
    page_header,
    render_sidebar,
    status_pill,
)

st.set_page_config(page_title="Deals | NuVue CRM", layout="wide")
apply_hubspot_theme()
render_sidebar()
page_header("Deals", "Job pipeline board — quote to delivery, HubSpot deals style.")

PIPELINE_STAGES = [s for s in PROJECT_STATUSES if s != "cancelled"]

try:
    projects = api_request("GET", "/api/projects")
    clients = api_request("GET", "/api/clients")
except Exception as exc:
    st.error(str(exc))
    st.stop()

client_lookup = {client["id"]: client["name"] for client in clients}

view = st.radio("View", ["Pipeline board", "Table + record"], horizontal=True)

if view == "Pipeline board":
    st.markdown('<div class="hs-panel"><h3>Deal pipeline</h3>', unsafe_allow_html=True)
    cols = st.columns(len(PIPELINE_STAGES))
    for col, stage in zip(cols, PIPELINE_STAGES):
        stage_deals = [p for p in projects if p["status"] == stage]
        with col:
            st.markdown(
                f'<div class="hs-pipeline-col-title">{stage} ({len(stage_deals)})</div>',
                unsafe_allow_html=True,
            )
            if not stage_deals:
                st.markdown('<div class="hs-empty">Empty</div>', unsafe_allow_html=True)
            for deal in stage_deals:
                st.markdown(
                    deal_card_html(
                        deal["title"],
                        client_lookup.get(deal["client_id"], f"Client #{deal['client_id']}"),
                        deal["service"],
                        deal.get("shoot_date"),
                    ),
                    unsafe_allow_html=True,
                )
                with st.popover(f"Move #{deal['id']}"):
                    new_status = st.selectbox(
                        "Stage",
                        PROJECT_STATUSES,
                        index=(
                            PROJECT_STATUSES.index(deal["status"])
                            if deal["status"] in PROJECT_STATUSES
                            else 0
                        ),
                        key=f"move_status_{deal['id']}",
                    )
                    if st.button("Update stage", key=f"move_btn_{deal['id']}", type="primary"):
                        try:
                            api_request(
                                "PATCH",
                                f"/api/projects/{deal['id']}",
                                json={"status": new_status},
                            )
                            st.success("Stage updated.")
                            st.rerun()
                        except Exception as exc:
                            st.error(str(exc))
    st.markdown("</div>", unsafe_allow_html=True)
else:
    status_filter = st.selectbox("Filter stage", ["all", *PROJECT_STATUSES], index=0)
    filtered = (
        projects
        if status_filter == "all"
        else [p for p in projects if p["status"] == status_filter]
    )
    st.caption(f"{len(filtered)} deal(s)")

    st.markdown('<div class="hs-panel"><h3>Deal list</h3>', unsafe_allow_html=True)
    if filtered:
        st.dataframe(
            [
                {
                    "ID": project["id"],
                    "Deal": project["title"],
                    "Company": client_lookup.get(project["client_id"], project["client_id"]),
                    "Service": project["service"],
                    "Stage": project["status"],
                    "Shoot": project.get("shoot_date") or "—",
                    "Pixieset": project.get("pixieset_url") or "—",
                }
                for project in filtered
            ],
            hide_index=True,
            width="stretch",
        )
    else:
        st.markdown('<div class="hs-empty">No deals in this stage.</div>', unsafe_allow_html=True)
    st.markdown("</div>", unsafe_allow_html=True)

    if not filtered:
        st.stop()

    st.markdown('<div class="hs-panel"><h3>Deal record</h3>', unsafe_allow_html=True)
    selected_id = st.selectbox(
        "Open deal",
        [project["id"] for project in filtered],
        format_func=lambda i: next(
            f"{item['title']}  ·  {item['status']}" for item in filtered if item["id"] == i
        ),
    )
    project = next(item for item in filtered if item["id"] == selected_id)

    st.markdown(
        f"**{project['title']}** &nbsp; {status_pill(project['status'])}",
        unsafe_allow_html=True,
    )

    with st.form("update_project"):
        c1, c2 = st.columns(2)
        with c1:
            title = st.text_input("Deal name", value=project["title"])
            service = st.selectbox(
                "Service",
                SERVICES,
                index=SERVICES.index(project["service"]) if project["service"] in SERVICES else 0,
            )
            status = st.selectbox(
                "Pipeline stage",
                PROJECT_STATUSES,
                index=(
                    PROJECT_STATUSES.index(project["status"])
                    if project["status"] in PROJECT_STATUSES
                    else 0
                ),
            )
        with c2:
            shoot_date_value = (
                date.fromisoformat(project["shoot_date"]) if project.get("shoot_date") else None
            )
            shoot_date = st.date_input("Shoot date", value=shoot_date_value)
            pixieset_url = st.text_input(
                "Pixieset URL", value=project.get("pixieset_url") or ""
            )
            notes = st.text_area("Notes", value=project.get("notes") or "")
        saved = st.form_submit_button("Save deal", type="primary")

    if saved:
        try:
            api_request(
                "PATCH",
                f"/api/projects/{selected_id}",
                json={
                    "title": title,
                    "service": service,
                    "status": status,
                    "shoot_date": shoot_date.isoformat() if shoot_date else None,
                    "pixieset_url": pixieset_url.strip() or None,
                    "notes": notes or None,
                },
            )
            st.success("Deal updated.")
            st.rerun()
        except Exception as exc:
            st.error(str(exc))
    st.markdown("</div>", unsafe_allow_html=True)

st.markdown('<div class="hs-panel"><h3>Create deal</h3>', unsafe_allow_html=True)
if not clients:
    st.warning("Create a company before adding a deal.")
else:
    with st.form("create_project"):
        c1, c2 = st.columns(2)
        with c1:
            client_id = st.selectbox(
                "Company",
                [client["id"] for client in clients],
                format_func=lambda i: f"{client_lookup[i]}",
            )
            p_title = st.text_input("Deal name")
            p_service = st.selectbox("Service", SERVICES, key="new_project_service")
        with c2:
            p_status = st.selectbox("Stage", PROJECT_STATUSES, index=0)
            p_shoot = st.date_input("Shoot date", value=None)
            p_pixieset = st.text_input("Pixieset URL")
            p_notes = st.text_area("Notes", key="new_project_notes")
        created = st.form_submit_button("Create deal", type="primary")

    if created:
        if not p_title.strip():
            st.error("Deal name is required.")
        else:
            try:
                api_request(
                    "POST",
                    "/api/projects",
                    json={
                        "title": p_title.strip(),
                        "service": p_service,
                        "status": p_status,
                        "shoot_date": p_shoot.isoformat() if p_shoot else None,
                        "pixieset_url": p_pixieset.strip() or None,
                        "notes": p_notes.strip() or None,
                        "client_id": client_id,
                    },
                )
                st.success("Deal created.")
                st.rerun()
            except Exception as exc:
                st.error(str(exc))
st.markdown("</div>", unsafe_allow_html=True)
