import { useEffect, useEffectEvent, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { services as defaultServices } from '../data/services.js';

export type ServiceCta = {
  label: string;
  href: string;
};

export type ServiceItem = {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  ctas?: ServiceCta[];
};

type ServicesPanelProps = {
  services?: ServiceItem[];
};

const AUTOPLAY_MS = 5500;

export default function ServicesPanel({ services = defaultServices }: ServicesPanelProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = services.length;
  const fadeMs = reduceMotion ? 0 : 0.7;

  const goTo = useEffectEvent((index: number) => {
    setActive(((index % count) + count) % count);
  });

  const advance = useEffectEvent(() => {
    setActive((i) => (i + 1) % count);
  });

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const id = window.setInterval(() => advance(), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused, count]);

  return (
    <div
      className="relative min-h-svh bg-cod-gray-950 text-alabaster-50"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {/* Desktop: full-bleed crossfade backgrounds */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        {services.map((service, i) => (
          <motion.img
            key={service.id}
            src={service.image}
            alt=""
            decoding={i === 0 ? 'sync' : 'async'}
            fetchPriority={i === 0 ? 'high' : 'low'}
            width={1600}
            height={900}
            sizes="100vw"
            className="absolute inset-0 h-full w-full object-cover"
            initial={false}
            animate={{ opacity: i === active ? 1 : 0 }}
            transition={{ duration: fadeMs, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-r from-cod-gray-950 via-cod-gray-950/80 to-cod-gray-950/15" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-cod-gray-950/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <header className="mb-10 max-w-xl lg:mb-14">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            Servicios
          </h2>
          <p className="mt-2 text-xs font-semibold tracking-[0.28em] text-white/45 uppercase sm:text-[0.8rem]">
            Lo que ofrecemos
          </p>
        </header>

        {/* Desktop accordion (avoids invalid tablist nesting) */}
        <div className="hidden max-w-xl lg:block" aria-label="Servicios AVA Tours">
          {services.map((service, i) => {
            const isActive = i === active;
            return (
              <div key={service.id} className="border-t border-white/10 last:border-b">
                <button
                  type="button"
                  id={`service-tab-${service.id}`}
                  aria-expanded={isActive}
                  aria-controls={`service-panel-${service.id}`}
                  onClick={() => goTo(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                      e.preventDefault();
                      goTo(i + 1);
                      document.getElementById(`service-tab-${services[(i + 1) % count].id}`)?.focus();
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      goTo(i - 1);
                      document
                        .getElementById(`service-tab-${services[(i - 1 + count) % count].id}`)
                        ?.focus();
                    } else if (e.key === 'Home') {
                      e.preventDefault();
                      goTo(0);
                      document.getElementById(`service-tab-${services[0].id}`)?.focus();
                    } else if (e.key === 'End') {
                      e.preventDefault();
                      goTo(count - 1);
                      document.getElementById(`service-tab-${services[count - 1].id}`)?.focus();
                    }
                  }}
                  className="group flex min-h-11 w-full items-start gap-4 py-5 text-left transition-colors"
                >
                  <span
                    className={`mt-1.5 h-10 w-1 shrink-0 rounded-full transition-colors ${
                      isActive ? 'bg-monza-600' : 'bg-transparent'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`flex min-w-0 flex-1 items-baseline gap-3 text-xl font-bold tracking-tight sm:text-2xl ${
                      isActive ? 'text-white' : 'text-white/35 group-hover:text-white/55'
                    }`}
                  >
                    <span className="font-medium text-[0.85em] opacity-70">/{service.number}</span>
                    {service.title}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="desc"
                      id={`service-panel-${service.id}`}
                      role="region"
                      aria-labelledby={`service-tab-${service.id}`}
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pb-5 pl-5">
                        <p className="text-base leading-relaxed text-white/70">
                          {service.description}
                        </p>
                        {service.ctas?.length ? (
                          <div className="flex flex-wrap gap-3">
                            {service.ctas.map((cta) => (
                              <a
                                key={cta.href}
                                href={cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-monza-600 px-5 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-monza-700"
                              >
                                {cta.label}
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Mobile accordion */}
        <div className="flex flex-col lg:hidden">
          {services.map((service, i) => {
            const isOpen = i === active;
            return (
              <div key={service.id} className="border-t border-white/10 last:border-b">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`service-acc-${service.id}`}
                  id={`service-acc-btn-${service.id}`}
                  onClick={() => goTo(i)}
                  className="flex min-h-11 w-full items-start gap-3 py-5 text-left"
                >
                  <span
                    className={`mt-1.5 h-8 w-1 shrink-0 rounded-full ${
                      isOpen ? 'bg-monza-600' : 'bg-transparent'
                    }`}
                    aria-hidden="true"
                  />
                  <span
                    className={`flex items-baseline gap-2 text-lg font-bold tracking-tight sm:text-xl ${
                      isOpen ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    <span className="font-medium text-[0.85em] opacity-70">/{service.number}</span>
                    {service.title}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`service-acc-${service.id}`}
                      role="region"
                      aria-labelledby={`service-acc-btn-${service.id}`}
                      initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pb-6 pl-4">
                        <img
                          src={service.image}
                          alt={service.imageAlt}
                          decoding="async"
                          className="aspect-video w-full rounded-2xl object-cover"
                        />
                        <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                          {service.description}
                        </p>
                        {service.ctas?.length ? (
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {service.ctas.map((cta) => (
                              <a
                                key={cta.href}
                                href={cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center rounded-full bg-monza-600 px-5 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-monza-700"
                              >
                                {cta.label}
                              </a>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
