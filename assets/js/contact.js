document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = contactForm?.querySelector('button[type="submit"]');

  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = question.nextElementSibling;
      const icon = question.querySelector('.faq-toggle i');
      const isOpening = !item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach((otherItem) => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = '0';
        const otherIcon = otherItem.querySelector('.faq-toggle i');
        if (otherIcon) {
          otherIcon.classList.remove('fa-minus');
          otherIcon.classList.add('fa-plus');
        }
      });

      if (isOpening) {
        item.classList.add('active');
        if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
        if (icon) {
          icon.classList.remove('fa-plus');
          icon.classList.add('fa-minus');
        }
      }
    });
  });

  if (!contactForm || !submitBtn) return;

  async function sendToCrm(payload) {
    const config = window.NUVUE_CRM_CONFIG || {};
    if (!config.enabled || !config.crmApiUrl) return;

    const response = await fetch(`${config.crmApiUrl.replace(/\/$/, '')}/api/leads`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `CRM intake failed (${response.status})`);
    }
  }

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    let isValid = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const service = document.getElementById('service');
    const message = document.getElementById('message');

    document.querySelectorAll('.error-message').forEach((el) => {
      el.textContent = '';
    });

    if (!name.value.trim()) {
      document.getElementById('name-error').textContent = 'Please enter your name';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
      document.getElementById('email-error').textContent = 'Please enter a valid email address';
      isValid = false;
    }

    if (!service.value) {
      document.getElementById('service-error').textContent = 'Please select an interest';
      isValid = false;
    }

    if (!message.value.trim()) {
      document.getElementById('message-error').textContent = 'Please enter your message';
      isValid = false;
    }

    if (!isValid) return;

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const crmPayload = {
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone?.value?.trim() || null,
      service: service.value,
      message: message.value.trim(),
      source: 'website',
    };

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Form submission failed');
      }

      try {
        await sendToCrm(crmPayload);
      } catch (crmError) {
        console.warn('CRM intake failed (email still sent):', crmError);
      }

      await Swal.fire({
        title: 'Message Sent!',
        text: "Thank you for reaching out. We'll get back to you as soon as possible from Richmond, VA.",
        icon: 'success',
        confirmButtonText: 'Great!',
      });

      contactForm.reset();
    } catch (error) {
      await Swal.fire({
        title: 'Something went wrong',
        text: 'Unable to send your message right now. Please try again or email nuvuetech@gmail.com.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
});
