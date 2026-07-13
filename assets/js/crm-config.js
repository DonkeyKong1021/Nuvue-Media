/**
 * CRM intake config for the website contact form.
 * Dev: run the CRM API locally (uvicorn on port 8000).
 * Production: set crmApiUrl to your deployed API origin.
 */
window.NUVUE_CRM_CONFIG = {
  crmApiUrl: "http://127.0.0.1:8000",
  enabled: true,
};
