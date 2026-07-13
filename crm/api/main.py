import logging

import httpx
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from api.auth import require_api_key
from api.config import get_settings
from api.database import get_db, init_db
from api.models import LEAD_STATUSES, PROJECT_STATUSES, Client, Lead, Project
from api.schemas import (
    ClientCreate,
    ClientOut,
    ClientUpdate,
    ConvertLeadRequest,
    ConvertLeadResponse,
    DashboardStats,
    LeadCreate,
    LeadOut,
    LeadUpdate,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
)

logger = logging.getLogger(__name__)

settings = get_settings()

app = FastAPI(title="NuVue CRM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    # Local website previews: IPv6 localhost, Live Server, LAN IPs
    allow_origin_regex=(
        r"https?://("
        r"localhost|127\.0\.0\.1|\[::1\]|"
        r"192\.168\.\d{1,3}\.\d{1,3}|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
        r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}"
        r")(:\d+)?"
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _notify_web3forms(lead: Lead) -> None:
    """Send email via Web3Forms using the server-side access key."""
    key = (settings.web3forms_access_key or "").strip()
    if not key:
        logger.warning("WEB3FORMS_ACCESS_KEY not set; skipping email notification")
        return

    body = {
        "access_key": key,
        "subject": settings.web3forms_subject,
        "from_name": settings.web3forms_from_name,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone or "",
        "service": lead.service,
        "message": lead.message,
    }
    try:
        response = httpx.post(
            "https://api.web3forms.com/submit",
            json=body,
            timeout=15.0,
        )
        if response.status_code >= 400:
            logger.error(
                "Web3Forms notify failed (%s): %s",
                response.status_code,
                response.text[:500],
            )
    except httpx.HTTPError as exc:
        logger.error("Web3Forms notify error: %s", exc)


@app.post("/api/leads", response_model=LeadOut, status_code=status.HTTP_201_CREATED)
def create_lead_public(payload: LeadCreate, db: Session = Depends(get_db)) -> Lead:
    """Public website intake — no API key required. Emails via Web3Forms server-side."""
    lead = Lead(
        name=payload.name.strip(),
        email=str(payload.email).strip().lower(),
        phone=(payload.phone or "").strip() or None,
        service=payload.service.strip(),
        message=payload.message.strip(),
        notes=payload.notes,
        source=payload.source or "website",
        status="new",
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    # Website form already emails via client-side Web3Forms (GitHub Pages).
    # Only notify for other sources (e.g. manual CRM entry) to avoid duplicates.
    if (lead.source or "") != "website":
        _notify_web3forms(lead)
    return lead


@app.get("/api/leads", response_model=list[LeadOut], dependencies=[Depends(require_api_key)])
def list_leads(
    status_filter: str | None = Query(default=None, alias="status"),
    q: str | None = None,
    db: Session = Depends(get_db),
) -> list[Lead]:
    stmt = select(Lead).order_by(Lead.created_at.desc())
    if status_filter:
        stmt = stmt.where(Lead.status == status_filter)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            (Lead.name.ilike(like)) | (Lead.email.ilike(like)) | (Lead.message.ilike(like))
        )
    return list(db.scalars(stmt).all())


@app.get("/api/leads/{lead_id}", response_model=LeadOut, dependencies=[Depends(require_api_key)])
def get_lead(lead_id: int, db: Session = Depends(get_db)) -> Lead:
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@app.patch("/api/leads/{lead_id}", response_model=LeadOut, dependencies=[Depends(require_api_key)])
def update_lead(lead_id: int, payload: LeadUpdate, db: Session = Depends(get_db)) -> Lead:
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in LEAD_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {LEAD_STATUSES}")
    if "email" in data and data["email"] is not None:
        data["email"] = str(data["email"]).strip().lower()

    for key, value in data.items():
        setattr(lead, key, value)

    db.commit()
    db.refresh(lead)
    return lead


@app.post(
    "/api/leads/{lead_id}/convert",
    response_model=ConvertLeadResponse,
    dependencies=[Depends(require_api_key)],
)
def convert_lead(
    lead_id: int,
    payload: ConvertLeadRequest,
    db: Session = Depends(get_db),
) -> ConvertLeadResponse:
    lead = db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.status == "converted" and lead.client is not None:
        raise HTTPException(status_code=400, detail="Lead already converted")

    client = Client(
        name=lead.name,
        email=lead.email,
        phone=lead.phone,
        notes=payload.client_notes or lead.notes,
        created_from_lead_id=lead.id,
    )
    db.add(client)
    db.flush()

    project_id = None
    if payload.create_project:
        if payload.project_status not in PROJECT_STATUSES:
            raise HTTPException(
                status_code=400, detail=f"Invalid project status. Allowed: {PROJECT_STATUSES}"
            )
        title = payload.project_title or f"{lead.service} — {lead.name}"
        project = Project(
            title=title,
            service=lead.service,
            status=payload.project_status,
            notes=lead.message,
            client_id=client.id,
            source_lead_id=lead.id,
        )
        db.add(project)
        db.flush()
        project_id = project.id

    lead.status = "converted"
    db.commit()
    db.refresh(lead)

    return ConvertLeadResponse(lead=lead, client_id=client.id, project_id=project_id)


@app.get("/api/clients", response_model=list[ClientOut], dependencies=[Depends(require_api_key)])
def list_clients(q: str | None = None, db: Session = Depends(get_db)) -> list[Client]:
    stmt = select(Client).order_by(Client.created_at.desc())
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where((Client.name.ilike(like)) | (Client.email.ilike(like)))
    return list(db.scalars(stmt).all())


@app.post(
    "/api/clients",
    response_model=ClientOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_api_key)],
)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)) -> Client:
    client = Client(
        name=payload.name.strip(),
        email=str(payload.email).strip().lower(),
        phone=(payload.phone or "").strip() or None,
        notes=payload.notes,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


@app.get("/api/clients/{client_id}", response_model=ClientOut, dependencies=[Depends(require_api_key)])
def get_client(client_id: int, db: Session = Depends(get_db)) -> Client:
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@app.patch(
    "/api/clients/{client_id}",
    response_model=ClientOut,
    dependencies=[Depends(require_api_key)],
)
def update_client(client_id: int, payload: ClientUpdate, db: Session = Depends(get_db)) -> Client:
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    data = payload.model_dump(exclude_unset=True)
    if "email" in data and data["email"] is not None:
        data["email"] = str(data["email"]).strip().lower()
    for key, value in data.items():
        setattr(client, key, value)

    db.commit()
    db.refresh(client)
    return client


@app.get(
    "/api/clients/{client_id}/projects",
    response_model=list[ProjectOut],
    dependencies=[Depends(require_api_key)],
)
def list_client_projects(client_id: int, db: Session = Depends(get_db)) -> list[Project]:
    client = db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    stmt = select(Project).where(Project.client_id == client_id).order_by(Project.created_at.desc())
    return list(db.scalars(stmt).all())


@app.get("/api/projects", response_model=list[ProjectOut], dependencies=[Depends(require_api_key)])
def list_projects(
    status_filter: str | None = Query(default=None, alias="status"),
    client_id: int | None = None,
    db: Session = Depends(get_db),
) -> list[Project]:
    stmt = select(Project).order_by(Project.created_at.desc())
    if status_filter:
        stmt = stmt.where(Project.status == status_filter)
    if client_id is not None:
        stmt = stmt.where(Project.client_id == client_id)
    return list(db.scalars(stmt).all())


@app.post(
    "/api/projects",
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_api_key)],
)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)) -> Project:
    if payload.status not in PROJECT_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {PROJECT_STATUSES}")
    client = db.get(Client, payload.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    project = Project(
        title=payload.title.strip(),
        service=payload.service.strip(),
        status=payload.status,
        shoot_date=payload.shoot_date,
        pixieset_url=payload.pixieset_url,
        notes=payload.notes,
        client_id=payload.client_id,
        source_lead_id=payload.source_lead_id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.get(
    "/api/projects/{project_id}",
    response_model=ProjectOut,
    dependencies=[Depends(require_api_key)],
)
def get_project(project_id: int, db: Session = Depends(get_db)) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.patch(
    "/api/projects/{project_id}",
    response_model=ProjectOut,
    dependencies=[Depends(require_api_key)],
)
def update_project(
    project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)
) -> Project:
    project = db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    data = payload.model_dump(exclude_unset=True)
    if "status" in data and data["status"] not in PROJECT_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {PROJECT_STATUSES}")
    if "client_id" in data and data["client_id"] is not None:
        if not db.get(Client, data["client_id"]):
            raise HTTPException(status_code=404, detail="Client not found")

    for key, value in data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project


@app.get("/api/stats", response_model=DashboardStats, dependencies=[Depends(require_api_key)])
def dashboard_stats(db: Session = Depends(get_db)) -> DashboardStats:
    leads_by_status = {status: 0 for status in LEAD_STATUSES}
    for status_name, count in db.execute(
        select(Lead.status, func.count()).group_by(Lead.status)
    ):
        leads_by_status[status_name] = count

    projects_by_status = {status: 0 for status in PROJECT_STATUSES}
    for status_name, count in db.execute(
        select(Project.status, func.count()).group_by(Project.status)
    ):
        projects_by_status[status_name] = count

    return DashboardStats(
        leads_by_status=leads_by_status,
        projects_by_status=projects_by_status,
        total_leads=db.scalar(select(func.count()).select_from(Lead)) or 0,
        total_clients=db.scalar(select(func.count()).select_from(Client)) or 0,
        total_projects=db.scalar(select(func.count()).select_from(Project)) or 0,
    )
