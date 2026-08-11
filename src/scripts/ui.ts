/** Critical UI — no GSAP/Lenis. Runs immediately for nav/header interactivity. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const onScroll = () => {
    header.dataset.scrolled = window.scrollY > 40 ? 'true' : 'false';
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initMobileNav() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const toggle = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-nav-panel]');
  if (!toggle || !panel) return;

  const setOpen = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    panel.dataset.open = String(open);
    if (header) header.dataset.menuOpen = String(open);
    document.body.classList.toggle('overflow-hidden', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function initBackToTop() {
  const btn = document.querySelector<HTMLButtonElement>('[data-back-to-top]');
  if (!btn) return;

  const onScroll = () => {
    btn.dataset.visible = window.scrollY > 480 ? 'true' : 'false';
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

function initActiveNav() {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');
  const sections = [...links]
    .map((link) => {
      const id = link.getAttribute('href')?.replace('#', '');
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean) as HTMLElement[];

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((link) => {
          const active = link.getAttribute('href') === `#${id}`;
          link.dataset.active = String(active);
        });
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
}

initHeader();
initMobileNav();
initBackToTop();
initActiveNav();
