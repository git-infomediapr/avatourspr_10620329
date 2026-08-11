import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { destinations } from '../data/destinations.js';

const RippleDistortion = lazy(() => import('./RippleDistortion'));

const SLIDE_MS = 11000;
const FADE_MS = 2800;
const RIPPLE_HOLD_MS = 900;

export default function HeroMedia() {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [rippleSrc, setRippleSrc] = useState(destinations[0].image);
  const [rippleReady, setRippleReady] = useState(false);
  const [enableRipple, setEnableRipple] = useState(false);
  const [incomingIn, setIncomingIn] = useState(true);
  const [outgoingOut, setOutgoingOut] = useState(false);
  const timersRef = useRef([]);
  const indexRef = useRef(0);

  const current = destinations[index];
  const previous = prevIndex !== null ? destinations[prevIndex] : null;

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const later = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  // Defer WebGL until idle / first pointer — keeps TBT down on load
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    let cancelled = false;
    const arm = () => {
      if (!cancelled) setEnableRipple(true);
    };

    const onPointer = () => arm();
    window.addEventListener('pointerdown', onPointer, { once: true, passive: true });
    window.addEventListener('mousemove', onPointer, { once: true, passive: true });

    let idleId;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 4000 });
    } else {
      idleId = window.setTimeout(arm, 2500);
    }

    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('mousemove', onPointer);
      if ('cancelIdleCallback' in window && typeof idleId === 'number') {
        window.cancelIdleCallback(idleId);
      } else {
        window.clearTimeout(idleId);
      }
      clearTimers();
    };
  }, []);

  // Prefetch only the next slide (not all destinations)
  useEffect(() => {
    const next = destinations[(index + 1) % destinations.length];
    const img = new Image();
    img.decoding = 'async';
    img.src = next.image;
  }, [index]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const changeTo = (next) => {
    if (next === indexRef.current) return;
    clearTimers();

    const from = indexRef.current;
    setPrevIndex(from);
    setIndex(next);
    indexRef.current = next;
    setIncomingIn(false);
    setOutgoingOut(false);

    setRippleReady(false);

    later(() => {
      setOutgoingOut(true);
      setIncomingIn(true);
    }, 50);

    later(() => {
      setRippleSrc(destinations[next].image);
    }, RIPPLE_HOLD_MS);

    later(() => {
      setPrevIndex(null);
      setOutgoingOut(false);
    }, FADE_MS + 120);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    const id = window.setInterval(() => {
      changeTo((indexRef.current + 1) % destinations.length);
    }, SLIDE_MS);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden bg-cod-gray-950" aria-hidden="true">
        {previous ? (
          <img
            src={previous.image}
            alt=""
            width="1920"
            height="1280"
            sizes="100vw"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-[2800ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
              outgoingOut ? 'scale-[1.03] opacity-0' : 'scale-100 opacity-100'
            }`}
          />
        ) : null}

        <img
          key={current.id}
          src={current.image}
          alt={`${current.country}: ${current.title}`}
          width="1920"
          height="1280"
          sizes="100vw"
          fetchPriority={index === 0 ? 'high' : 'low'}
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-[opacity,transform] duration-[2800ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            incomingIn ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'
          }`}
        />

        {enableRipple ? (
          <div
            className={`absolute inset-0 transition-opacity duration-[1200ms] ease-out ${
              rippleReady ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Suspense fallback={null}>
              <RippleDistortion
                src={rippleSrc}
                brushSize={140}
                strength={0.13}
                swirl={0.6}
                rings={3}
                spread={4}
                fade={2.6}
                spacing={22}
                dispersion={0}
                glint={0.12}
                tint="#d31224"
                tintAmount={0.08}
                grayscale={false}
                highlightColor="#ffffff"
                trigger="hover"
                quality="low"
                className="absolute inset-0 h-full w-full"
                onTextureLoad={() => setRippleReady(true)}
                onTextureError={() => setRippleReady(false)}
              />
            </Suspense>
          </div>
        ) : null}
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <aside
        className="pointer-events-auto absolute inset-x-4 bottom-4 z-20 sm:inset-x-auto sm:right-6 sm:bottom-8 sm:w-[min(100%-2rem,20rem)] lg:right-10"
        aria-live="polite"
      >
        <div className="rounded-2xl border border-white/25 bg-white/10 p-4 shadow-lg backdrop-blur-md sm:p-5">
          <div
            key={current.id}
            className="animate-[heroCardIn_1.2s_cubic-bezier(0.4,0,0.2,1)]"
          >
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.2em] text-white/75 uppercase">
              <MapPin className="size-3.5 text-monza-600" aria-hidden="true" />
              {current.country}
            </p>
            <p className="mb-1.5 text-lg font-bold text-white sm:text-xl">{current.title}</p>
            <p className="text-sm leading-relaxed text-white/80">{current.subtitle}</p>
          </div>

          <div
            className="mt-3 flex w-full items-center justify-start gap-0"
            role="group"
            aria-label="Destinos del hero"
          >
            {destinations.map((item, i) => {
              const active = i === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  aria-label={`${item.country}: ${item.title}`}
                  onClick={() => changeTo(i)}
                  className="inline-flex h-9 w-4 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:h-10 sm:w-[1.125rem]"
                >
                  <span
                    className={`block rounded-full transition-all duration-500 ease-out ${
                      active
                        ? 'h-1.5 w-3.5 bg-monza-600 sm:w-4'
                        : 'h-1.5 w-1.5 bg-white/45 hover:bg-white/70'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes heroCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
