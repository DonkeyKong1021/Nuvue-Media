document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

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

  if (!contactForm) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    let isValid = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const subject = document.getElementById('subject');
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

    if (!subject.value) {
      document.getElementById('subject-error').textContent = 'Please select a subject';
      isValid = false;
    }

    if (!message.value.trim()) {
      document.getElementById('message-error').textContent = 'Please enter your message';
      isValid = false;
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    window.setTimeout(() => {
      Swal.fire({
        title: 'Message Sent!',
        text: "Thank you for reaching out. We'll get back to you as soon as possible from Richmond, VA.",
        icon: 'success',
        confirmButtonText: 'Great!',
      });

      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }, 1500);
  });
});
