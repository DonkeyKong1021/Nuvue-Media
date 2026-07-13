# NuVue CRM

Local-first CRM for NuVue Media: **website inquiry → lead → client → project → Pixieset delivery**.

Full architecture, intake, deployment, and Streamlit→real-app roadmap: [`docs/CRM.md`](../docs/CRM.md).

## Stack

- **FastAPI** — REST API + public lead intake
- **SQLite** — single-file database at `crm/data/nuvue_crm.db`
- **Streamlit** — operator UI (Dashboard, Leads, Clients, Projects)
- **Website** — contact form still emails via Web3Forms, and also POSTs leads to the CRM API

## Setup

```bash
cd crm
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # if you don't already have .env
```

Default local API key in `.env` / `.env.example`:

```
CRM_API_KEY=dev-local-api-key
CRM_CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,null
```

Change `CRM_API_KEY` before any public deployment.

## Run locally (two terminals)

**1. API**

```bash
cd crm
source .venv/bin/activate
uvicorn api.main:app --reload --reload-dir api --host 127.0.0.1 --port 8000
```

Or: `./run_api.sh` (same flags). `--reload-dir api` keeps WatchFiles out of `.venv`, which otherwise causes endless reload spam.
Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)  
Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

**2. Streamlit CRM**

```bash
cd crm
source .venv/bin/activate
streamlit run app.py
```

In the sidebar, confirm Connection settings if needed:

- API URL: `http://127.0.0.1:8000`
- API Key: matches `CRM_API_KEY`

Pages mirror a HubSpot-style workspace: **Home / Dashboard**, **Contacts**, **Companies**, **Deals** (pipeline board).
**3. Website (optional, for intake testing)**

```bash
# from repo root
python3 -m http.server 8080
```

Open [http://localhost:8080/contact.html](http://localhost:8080/contact.html).  
CRM intake URL is set in [`assets/js/crm-config.js`](../assets/js/crm-config.js).

## Contact form behavior

1. Submits to **Web3Forms** (email notification)
2. Soft-posts the same lead to **`POST /api/leads`**
3. If the CRM API is down, the visitor still sees success after email send; the browser console logs a CRM warning

## Production notes

The live website cannot call `localhost`. To enable auto-intake in production:

1. Deploy the FastAPI app (Render / Railway / Fly) with a **persistent disk** for `crm/data/`
2. Set strong `CRM_API_KEY` and lock `CRM_CORS_ORIGINS` to your real site origin(s)
3. Update `window.NUVUE_CRM_CONFIG.crmApiUrl` in `assets/js/crm-config.js` to the deployed API origin
4. Point Streamlit at the same API URL (sidebar or `CRM_API_URL` env var)

## Backup

Copy `crm/data/nuvue_crm.db` regularly. That file is the full CRM database.

## API overview

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/leads` | Public (website intake) |
| GET/PATCH | `/api/leads`, `/api/leads/{id}` | `X-API-Key` |
| POST | `/api/leads/{id}/convert` | `X-API-Key` |
| GET/POST/PATCH | `/api/clients...` | `X-API-Key` |
| GET/POST/PATCH | `/api/projects...` | `X-API-Key` |
| GET | `/api/stats` | `X-API-Key` |
