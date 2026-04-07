const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-button');
  const answer = item.querySelector('.faq-answer');

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    faqItems.forEach((other) => {
      other.classList.remove('open');
      other.querySelector('.faq-button').setAttribute('aria-expanded', 'false');
      other.querySelector('.faq-answer').style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

const sections = [...document.querySelectorAll('section[id]')];
const navLinks = [...document.querySelectorAll('.nav-links a')];

function setActiveLink() {
  const scrollY = window.scrollY + 120;
  let current = sections[0]?.id || '';

  sections.forEach((section) => {
    if (scrollY >= section.offsetTop) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    const match = link.getAttribute('href') === '#' + current;
    link.classList.toggle('active', match);
  });
}

setActiveLink();
window.addEventListener('scroll', setActiveLink);