const LEGAL_CONTENT = {
  privacy: {
    title: "Privacy Policy",
    body: `
      <p><strong>Effective date:</strong> <span data-current-year></span></p>
      <p>NuVue Media LLC ("NuVue," "we," "us," or "our") respects your privacy. This Privacy Policy explains how we collect, use, and protect information when you visit our website or use our aerial photography and videography services.</p>

      <h3>Information We Collect</h3>
      <ul>
        <li><strong>Contact information</strong> you provide, such as your name, email address, phone number, and project details when you request a quote or use our contact form.</li>
        <li><strong>Usage information</strong>, such as pages visited, browser type, device type, and general location derived from IP address.</li>
        <li><strong>Project media</strong> captured during contracted shoots, which may include imagery of people or property as agreed in your service agreement.</li>
      </ul>

      <h3>How We Use Information</h3>
      <ul>
        <li>Respond to inquiries and provide quotes for our services</li>
        <li>Deliver, edit, and share aerial photo and video deliverables</li>
        <li>Improve our website, portfolio, and customer experience</li>
        <li>Send service-related communications you request or reasonably expect</li>
        <li>Comply with legal obligations and protect our business</li>
      </ul>

      <h3>Sharing of Information</h3>
      <p>We do not sell your personal information. We may share information with trusted service providers who help us operate our website, process communications, or deliver files, and only as needed to perform those services. We may also disclose information when required by law.</p>

      <h3>Cookies &amp; Analytics</h3>
      <p>Our website may use basic cookies or similar technologies to support site functionality and understand how visitors use the site. You can adjust cookie settings through your browser.</p>

      <h3>Data Retention</h3>
      <p>We retain contact and project information for as long as needed to provide services, maintain business records, resolve disputes, and meet legal requirements.</p>

      <h3>Your Choices</h3>
      <p>You may request access to, correction of, or deletion of personal information we hold about you, subject to applicable law and ongoing business needs. Contact us using the information below.</p>

      <h3>Children's Privacy</h3>
      <p>Our website and services are not directed to children under 13, and we do not knowingly collect personal information from children.</p>

      <h3>Contact Us</h3>
      <p>If you have questions about this Privacy Policy, contact NuVue Media LLC at <a href="mailto:nuvuetech@gmail.com">nuvuetech@gmail.com</a> or (804) 955-9107.</p>
    `,
  },
  terms: {
    title: "Terms of Service",
    body: `
      <p><strong>Effective date:</strong> <span data-current-year></span></p>
      <p>These Terms of Service ("Terms") govern your use of the NuVue Media LLC website and aerial media services. By using our website or booking our services, you agree to these Terms.</p>

      <h3>Services</h3>
      <p>NuVue Media LLC provides professional drone photography and videography services, including real estate, wedding and event, and commercial aerial media. Specific deliverables, timelines, and pricing are defined in your quote, proposal, or written agreement.</p>

      <h3>Bookings &amp; Payment</h3>
      <ul>
        <li>Project dates are confirmed once agreed in writing and any required deposit is received.</li>
        <li>Final payment terms will be stated in your project agreement.</li>
        <li>Rescheduling may be subject to availability and applicable fees.</li>
      </ul>

      <h3>Client Responsibilities</h3>
      <ul>
        <li>Provide accurate project details, site access, and points of contact.</li>
        <li>Obtain permissions needed for flight operations where applicable.</li>
        <li>Inform us of safety concerns, restricted airspace, or privacy restrictions before the shoot.</li>
      </ul>

      <h3>Flight Operations &amp; Safety</h3>
      <p>All operations are conducted in compliance with applicable FAA regulations and local requirements. Flights may be delayed or rescheduled due to weather, airspace restrictions, equipment issues, or safety concerns without penalty to NuVue beyond reasonable rescheduling.</p>

      <h3>Intellectual Property &amp; Usage Rights</h3>
      <p>Unless otherwise agreed in writing, NuVue Media LLC retains ownership of raw and edited media. Clients receive a license to use delivered files for the purposes specified in the project agreement. NuVue may use completed work in its portfolio, website, and marketing materials unless a confidentiality arrangement is agreed in writing.</p>

      <h3>Limitation of Liability</h3>
      <p>To the fullest extent permitted by law, NuVue Media LLC is not liable for indirect, incidental, or consequential damages arising from use of our website or services. Our total liability for any claim related to a project is limited to the amount paid for that project.</p>

      <h3>Website Use</h3>
      <p>You agree not to misuse our website, attempt unauthorized access, or use site content without permission. All site content, branding, and media displayed remain the property of NuVue Media LLC or respective owners.</p>

      <h3>Changes to These Terms</h3>
      <p>We may update these Terms from time to time. Updated Terms will be posted on this website with a revised effective date.</p>

      <h3>Governing Law</h3>
      <p>These Terms are governed by the laws of the Commonwealth of Virginia, without regard to conflict-of-law principles.</p>

      <h3>Contact</h3>
      <p>Questions about these Terms may be sent to <a href="mailto:nuvuetech@gmail.com">nuvuetech@gmail.com</a> or (804) 955-9107.</p>
    `,
  },
};

function initLegalModals() {
  if (document.getElementById("legalModal")) return;

  const modal = document.createElement("div");
  modal.className = "legal-modal";
  modal.id = "legalModal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="legal-modal-panel" role="document">
      <button type="button" class="legal-modal-close" aria-label="Close">&times;</button>
      <h2 class="legal-modal-title" id="legalModalTitle"></h2>
      <div class="legal-modal-body" id="legalModalBody"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const titleEl = modal.querySelector("#legalModalTitle");
  const bodyEl = modal.querySelector("#legalModalBody");
  const closeBtn = modal.querySelector(".legal-modal-close");
  let lastFocusedElement = null;

  const setYearInBody = () => {
    const year = new Date().getFullYear();
    bodyEl.querySelectorAll("[data-current-year]").forEach((el) => {
      el.textContent = year;
    });
  };

  const closeModal = () => {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("legal-modal-open");
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const openModal = (type) => {
    const content = LEGAL_CONTENT[type];
    if (!content) return;

    lastFocusedElement = document.activeElement;
    titleEl.textContent = content.title;
    bodyEl.innerHTML = content.body;
    setYearInBody();
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("legal-modal-open");
    closeBtn.focus();
  };

  document.querySelectorAll("[data-legal-modal]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(trigger.dataset.legalModal);
    });
  });

  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", initLegalModals);
