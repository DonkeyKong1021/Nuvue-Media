function initCopyrightYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = year;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove("menu-open");
  initCopyrightYear();

  const header = document.querySelector(".secondary-header");
  if (!header) return;

  const hamburger = header.querySelector(".hamburger");
  const navLinks = header.querySelector(".nav-links");
  const headerContactLink = header.querySelector(".header-contact a");

  if (navLinks && headerContactLink && !navLinks.querySelector(".nav-portal-link")) {
    const portalItem = document.createElement("li");
    portalItem.className = "nav-portal-link";
    const portalAnchor = document.createElement("a");
    portalAnchor.href = headerContactLink.getAttribute("href") || "portal.html";
    portalAnchor.textContent =
      headerContactLink.getAttribute("aria-label") ||
      headerContactLink.dataset.fullLabel ||
      headerContactLink.textContent.trim() ||
      "Client Portal";
    portalItem.appendChild(portalAnchor);
    navLinks.insertBefore(portalItem, navLinks.firstChild);
  }

  const MOBILE_NAV_QUERY = window.matchMedia("(max-width: 1100px)");
  const COMPACT_PORTAL_QUERY = window.matchMedia("(max-width: 600px)");
  const isMobileNav = () => MOBILE_NAV_QUERY.matches;

  const syncPortalLabel = () => {
    if (!headerContactLink) return;
    if (!headerContactLink.dataset.fullLabel) {
      headerContactLink.dataset.fullLabel = headerContactLink.textContent.trim();
    }
    headerContactLink.textContent = COMPACT_PORTAL_QUERY.matches
      ? "Portal"
      : headerContactLink.dataset.fullLabel;
  };

  syncPortalLabel();
  COMPACT_PORTAL_QUERY.addEventListener("change", syncPortalLabel);

  if (hamburger && navLinks) {
    const closeMenu = () => {
      navLinks.classList.remove("active");
      hamburger.classList.remove("active");
      document.body.classList.remove("menu-open");
    };

    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("active");
      document.body.classList.toggle("menu-open");
    });

    navLinks.querySelectorAll("a:not(.dropdown-toggle)").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      syncPortalLabel();
      if (!isMobileNav()) closeMenu();
    });
  }

  const dropdownItems = header.querySelectorAll(".dropdown");
  dropdownItems.forEach((dropdown) => {
    const dropdownToggle = dropdown.querySelector(".dropdown-toggle");
    if (!dropdownToggle) return;

    dropdownToggle.addEventListener("click", (e) => {
      if (!isMobileNav()) return;
      e.preventDefault();
      dropdownItems.forEach((item) => {
        if (item !== dropdown) item.classList.remove("active");
      });
      dropdown.classList.toggle("active");
    });
  });
});
