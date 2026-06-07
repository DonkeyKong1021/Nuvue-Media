document.addEventListener('DOMContentLoaded', () => {
  const config = window.PORTAL_CONFIG || {};
  const galleryBtn = document.getElementById('pixieset-gallery-btn');
  const setupNotice = document.getElementById('portal-setup-notice');
  const supportEmail = document.getElementById('portal-support-email');
  const supportPhone = document.getElementById('portal-support-phone');

  const galleryUrl = (config.pixiesetGalleryUrl || '').trim();
  const isConfigured = galleryUrl && !isDefaultPixiesetUrl(galleryUrl);

  if (galleryBtn && galleryUrl) {
    galleryBtn.href = galleryUrl;
  }

  if (setupNotice) {
    setupNotice.classList.toggle('hidden', isConfigured);
  }

  if (supportEmail && config.supportEmail) {
    supportEmail.href = `mailto:${config.supportEmail}`;
    supportEmail.textContent = config.supportEmail;
  }

  if (supportPhone && config.supportPhone) {
    const digits = config.supportPhone.replace(/\D/g, '');
    supportPhone.href = digits ? `tel:${digits}` : '#';
    supportPhone.textContent = config.supportPhone;
  }
});

function isDefaultPixiesetUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return host === 'pixieset.com';
  } catch {
    return true;
  }
}
