import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
gsap.defaults({ ease: 'power3.out', duration: 0.85 });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function initLenis() {
  if (reduceMotion) return null;

  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    anchors: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  const onScroll = () => {
    const scrolled = window.scrollY > 40;
    header.dataset.scrolled = scrolled ? 'true' : 'false';
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

function initHeroMotion() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const els = hero.querySelectorAll<HTMLElement>('[data-hero-el]');

  if (reduceMotion) {
    gsap.set(els, { autoAlpha: 1, clearProps: 'all' });
    return;
  }

  document.documentElement.classList.add('motion-ready');
  gsap.set(els, { autoAlpha: 1 });

  gsap.fromTo(
    els,
    { y: 36, autoAlpha: 0 },
    { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: 'power4.out' },
  );
}

function initScrollReveals() {
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  if (!items.length) return;

  if (reduceMotion) {
    gsap.set(items, { autoAlpha: 1, clearProps: 'all' });
    return;
  }

  document.documentElement.classList.add('motion-ready');

  items.forEach((el) => {
    gsap.set(el, { autoAlpha: 1 });
    gsap.fromTo(
      el,
      { y: 32, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true,
        },
      },
    );
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

/**
 * Sample the SVG path in the container's local pixel space.
 * Needed because preserveAspectRatio="none" stretches the path non-uniformly —
 * MotionPath autoRotate from raw SVG coords then points the wrong way.
 */
function sampleFlightPoints(
  path: SVGPathElement,
  container: HTMLElement,
  samples = 160,
): { x: number; y: number }[] {
  const ctm = path.getScreenCTM();
  if (!ctm) return [];

  const bounds = container.getBoundingClientRect();
  const total = path.getTotalLength();
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= samples; i++) {
    const p = path.getPointAtLength((total * i) / samples);
    const sx = ctm.a * p.x + ctm.c * p.y + ctm.e;
    const sy = ctm.b * p.x + ctm.d * p.y + ctm.f;
    points.push({ x: sx - bounds.left, y: sy - bounds.top });
  }

  return points;
}

function getActiveFlightScope() {
  const desktop = window.matchMedia('(min-width: 1024px)').matches;
  const key = desktop ? 'desktop' : 'mobile';
  const container = document.querySelector<HTMLElement>(`[data-flight-path="${key}"]`);
  if (!container) return null;
  const route = container.querySelector<SVGPathElement>('[data-flight-route]');
  const plane = container.querySelector<HTMLElement>('[data-flight-plane]');
  if (!route || !plane) return null;
  return { container, route, plane };
}

function initFlightPath() {
  const section = document.getElementById('conocenos');
  if (!section) return;

  let tween: gsap.core.Tween | null = null;

  const bind = () => {
    tween?.scrollTrigger?.kill();
    tween?.kill();
    tween = null;

    const scope = getActiveFlightScope();
    if (!scope) return;

    const { container, route, plane } = scope;

    // Reset any leftover transform from the inactive scope's plane
    document.querySelectorAll<HTMLElement>('[data-flight-plane]').forEach((el) => {
      if (el !== plane) gsap.set(el, { clearProps: 'transform' });
    });

    const motionPathVars = (start: number, end: number) => ({
      path: sampleFlightPoints(route, container),
      autoRotate: true as const,
      alignOrigin: [0.5, 0.5] as [number, number],
      relative: false,
      start,
      end,
    });

    if (reduceMotion) {
      gsap.set(plane, { motionPath: motionPathVars(1, 1) });
      return;
    }

    tween = gsap.fromTo(
      plane,
      { motionPath: () => motionPathVars(0, 0) },
      {
        ease: 'none',
        motionPath: () => motionPathVars(0, 1),
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      },
    );
  };

  bind();

  const mq = window.matchMedia('(min-width: 1024px)');
  const onBreakpoint = () => {
    bind();
    ScrollTrigger.refresh();
  };
  mq.addEventListener('change', onBreakpoint);
}

const lenis = initLenis();
initHeader();
initMobileNav();
initHeroMotion();
initScrollReveals();
initFlightPath();
initBackToTop();
initActiveNav();

window.addEventListener('load', () => {
  ScrollTrigger.refresh();
  lenis?.resize();
});
