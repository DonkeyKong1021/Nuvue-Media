/**
 * CRM intake config for the website contact form.
 *
 * Local (localhost / LAN / file): uses LOCAL_CRM_API_URL (default 127.0.0.1:8000).
 * Production (public host): set PRODUCTION_CRM_API_URL to your deployed API origin.
 * Loopback API URLs are refused on public hostnames so intake cannot silently no-op.
 */
(function () {
  const LOCAL_DEFAULT = "http://127.0.0.1:8000";

  // Set this before deploying the public site (e.g. "https://crm-api.example.com").
  const PRODUCTION_CRM_API_URL = "";

  // Optional override for local testing against a non-default API origin.
  const LOCAL_CRM_API_URL = LOCAL_DEFAULT;

  function isPrivateIpv4(hostname) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
    if (!m) return false;
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 10) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    return false;
  }

  function isLocalHostname(hostname) {
    const host = (hostname || "").replace(/^\[|\]$/g, "").toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return true;
    }
    if (host.endsWith(".local")) return true;
    return isPrivateIpv4(host);
  }

  function isLoopbackUrl(url) {
    try {
      const host = new URL(url).hostname.replace(/^\[|\]$/g, "").toLowerCase();
      return host === "localhost" || host === "127.0.0.1" || host === "::1";
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
    console.info(
      "[NUVUE_CRM] Intake off for this host (" +
        (window.location.hostname || "unknown") +
        "). Email still works via Web3Forms; set PRODUCTION_CRM_API_URL when the API is deployed."
    );
  }

  window.NUVUE_CRM_CONFIG = {
    crmApiUrl,
    enabled,
  };
})();
