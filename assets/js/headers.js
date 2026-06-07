document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".secondary-header");
  if (!header) return;

  const hamburger = header.querySelector(".hamburger");
  const navLinks = header.querySelector(".nav-links");

  if (hamburger && navLinks) {
    let overlay = document.querySelector(".menu-overlay");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "menu-overlay";
      document.body.appendChild(overlay);

      overlay.addEventListener("click", () => {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
        overlay.classList.remove("active");
        document.body.classList.remove("menu-open");
      });
    }

    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.classList.toggle("menu-open");
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

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      dropdownItems.forEach((dropdown) => dropdown.classList.remove("active"));
    }
  });
});
