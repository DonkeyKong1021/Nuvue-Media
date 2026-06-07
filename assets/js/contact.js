document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      question.parentElement.classList.toggle('active');

      const icon = question.querySelector('.faq-toggle i');
      if (icon) {
        if (question.parentElement.classList.contains('active')) {
          icon.classList.replace('fa-plus', 'fa-minus');
        } else {
          icon.classList.replace('fa-minus', 'fa-plus');
        }
      }

      const answer = question.nextElementSibling;
      if (answer) {
        answer.style.maxHeight = question.parentElement.classList.contains('active')
          ? `${answer.scrollHeight}px`
          : '0';
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
        text: "Thank you for reaching out. I'll get back to you as soon as possible from Richmond, VA.",
        icon: 'success',
        confirmButtonText: 'Great!',
      });

      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }, 1500);
  });
});
