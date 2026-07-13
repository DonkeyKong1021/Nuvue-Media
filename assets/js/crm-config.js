/**
 * CRM intake config for the website contact form.
 *
 * Local: leave crmApiUrl empty (or localhost) — used only on localhost/127.0.0.1.
 * Production: set PRODUCTION_CRM_API_URL to your deployed API origin (https://...).
 *            Loopback URLs are refused on public hostnames so intake cannot
 *            silently no-op against an unreachable localhost.
 */
(function () {
  const LOCAL_DEFAULT = "http://127.0.0.1:8000";

  // Set this before deploying the public site (e.g. "https://crm-api.example.com").
  const PRODUCTION_CRM_API_URL = "";

  // Optional override for local testing against a non-default API origin.
  const LOCAL_CRM_API_URL = LOCAL_DEFAULT;

  function isLocalHostname(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "";
  }

  function isLoopbackUrl(url) {
    try {
      const { hostname } = new URL(url);
      return hostname === "localhost" || hostname === "127.0.0.1";
    } catch {
      return false;
    }
  }

  const pageIsLocal = isLocalHostname(window.location.hostname);
  let crmApiUrl = pageIsLocal
    ? (LOCAL_CRM_API_URL || LOCAL_DEFAULT).trim()
    : (PRODUCTION_CRM_API_URL || "").trim();
  let enabled = Boolean(crmApiUrl);

  if (crmApiUrl && isLoopbackUrl(crmApiUrl) && !pageIsLocal) {
    console.error(
      "[NUVUE_CRM] crmApiUrl points to localhost on a public host. " +
        "Set PRODUCTION_CRM_API_URL in assets/js/crm-config.js to your deployed API origin."
    );
    crmApiUrl = "";
    enabled = false;
  }

  if (!enabled) {
    console.warn(
      "[NUVUE_CRM] Intake disabled: no CRM API URL configured for this host."
    );
  }

  window.NUVUE_CRM_CONFIG = {
    crmApiUrl,
    enabled,
  };
})();
