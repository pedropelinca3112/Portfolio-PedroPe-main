/* NAV MOBILE TOGGLE */
const navToggle = document.getElementById('navToggle');
const navList   = document.getElementById('navList');

navToggle?.addEventListener('click', () => {
  navList.classList.toggle('open');
  const icon = navToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-xmark');
});

// Fecha menu ao clicar em link
navList?.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    const icon = navToggle.querySelector('i');
    icon.classList.add('fa-bars');
    icon.classList.remove('fa-xmark');
  });
});

/* CONTAGEM ANIMADA STATS (INDEX) */
function animateCounters() {
  const counters = document.querySelectorAll('.stat__number');

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target, 10);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;

    const update = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(update);
      } else {
        counter.textContent = target;
      }
    };

    update();
  });
}

const aboutSection = document.querySelector('.about');
if (aboutSection) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(aboutSection);
}

/* FAQ (contact.html) */
const faqItems = document.querySelectorAll('.faq__item');

faqItems.forEach(item => {
  const btn = item.querySelector('.faq__question');
  btn?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    // fecha outros
    faqItems.forEach(i => {
      i.classList.remove('open');
      const b = i.querySelector('.faq__question');
      b?.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});