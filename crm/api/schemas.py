from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LeadCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = None
    service: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1)
    notes: str | None = None
    source: str = "website"


class LeadUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: str | None = None
    service: str | None = Field(default=None, min_length=1, max_length=100)
    message: str | None = None
    status: str | None = None
    notes: str | None = None


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str | None
    service: str
    message: str
    status: str
    notes: str | None
    source: str
    created_at: datetime
    updated_at: datetime


class ConvertLeadRequest(BaseModel):
    create_project: bool = True
    project_title: str | None = None
    project_status: str = "quoted"
    client_notes: str | None = None


class ConvertLeadResponse(BaseModel):
    lead: LeadOut
    client_id: int
    project_id: int | None = None


class ClientCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = None
    notes: str | None = None


class ClientUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    email: EmailStr | None = None
    phone: str | None = None
    notes: str | None = None


class ClientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: str | None
    notes: str | None
    created_from_lead_id: int | None
    created_at: datetime
    updated_at: datetime


class ProjectCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    service: str = Field(min_length=1, max_length=100)
    status: str = "quoted"
    shoot_date: date | None = None
    pixieset_url: str | None = None
    notes: str | None = None
    client_id: int
    source_lead_id: int | None = None


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    service: str | None = Field(default=None, min_length=1, max_length=100)
    status: str | None = None
    shoot_date: date | None = None
    pixieset_url: str | None = None
    notes: str | None = None
    client_id: int | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    service: str
    status: str
    shoot_date: date | None
    pixieset_url: str | None
    notes: str | None
    client_id: int
    source_lead_id: int | None
    created_at: datetime
    updated_at: datetime


class DashboardStats(BaseModel):
    leads_by_status: dict[str, int]
    projects_by_status: dict[str, int]
    total_leads: int
    total_clients: int
    total_projects: int
