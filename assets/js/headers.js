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
    portalAnchor.textContent = headerContactLink.textContent.trim() || "Client Portal";
    portalItem.appendChild(portalAnchor);
    navLinks.appendChild(portalItem);
  }

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
      if (window.innerWidth > 768) closeMenu();
    });
  }

  const dropdownItems = header.querySelectorAll(".dropdown");
  dropdownItems.forEach((dropdown) => {
    const dropdownToggle = dropdown.querySelector(".dropdown-toggle");
    if (!dropdownToggle) return;

    dropdownToggle.addEventListener("click", (e) => {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      dropdownItems.forEach((item) => {
        if (item !== dropdown) item.classList.remove("active");
      });
      dropdown.classList.toggle("active");
    });
  });
});
