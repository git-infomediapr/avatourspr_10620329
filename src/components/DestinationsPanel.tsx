import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DottedMap from 'dotted-map';
import { ChevronRight, X } from 'lucide-react';
import { originPoint, upcomingDestinations } from '../data/upcomingDestinations.js';

type Destination = (typeof upcomingDestinations)[number];

type Placement = {
  xPct: number;
  yPct: number;
  align: 'left' | 'center' | 'right';
  vertical: 'above' | 'below';
};

function project(lat: number, lng: number) {
  const xPct = ((lng + 180) / 360) * 100;
  const yPct = ((90 - lat) / 180) * 100;
  return { xPct, yPct };
}

function placementFor(lat: number, lng: number): Placement {
  const { xPct, yPct } = project(lat, lng);
  const align = xPct < 22 ? 'left' : xPct > 78 ? 'right' : 'center';
  const vertical = yPct < 30 ? 'below' : 'above';
  return { xPct, yPct, align, vertical };
}

function curvedPath(start: { xPct: number; yPct: number }, end: { xPct: number; yPct: number }) {
  const midX = (start.xPct + end.xPct) / 2;
  const midY = Math.min(start.yPct, end.yPct) - 9;
  return `M ${start.xPct} ${start.yPct / 2} Q ${midX} ${midY / 2} ${end.xPct} ${end.yPct / 2}`;
}

const cardAlignClasses: Record<Placement['align'], string> = {
  left: 'left-0 translate-x-0',
  center: 'left-1/2 -translate-x-1/2',
  right: 'right-0 left-auto translate-x-0',
};

export default function DestinationsPanel() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [openItem, setOpenItem] = useState<Destination | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const origin = useMemo(() => project(originPoint.lat, originPoint.lng), []);

  const points = useMemo(
    () =>
      upcomingDestinations.map((item) => ({
        item,
        placement: placementFor(item.lat, item.lng),
      })),
    [],
  );

  const continents = useMemo(() => {
    const order: string[] = [];
    const groups = new Map<string, Destination[]>();
    for (const item of upcomingDestinations) {
      if (!groups.has(item.continent)) {
        groups.set(item.continent, []);
        order.push(item.continent);
      }
      groups.get(item.continent)!.push(item);
    }
    return order.map((continent) => ({ continent, items: groups.get(continent)! }));
  }, []);

  const mapSvg = useMemo(() => {
    const map = new DottedMap({
      height: 150,
      grid: 'diagonal',
      projection: { name: 'equirectangular' },
    });
    return map.getSVG({
      radius: 0.22,
      color: '#a9a9a9',
      shape: 'circle',
      backgroundColor: '#ffffff',
    });
  }, []);

  const mapDataUri = useMemo(
    () => `data:image/svg+xml;utf8,${encodeURIComponent(mapSvg)}`,
    [mapSvg],
  );

  const setScrollLocked = useCallback((locked: boolean) => {
    document.body.classList.toggle('overflow-hidden', locked);
    document.documentElement.classList.toggle('overflow-hidden', locked);
  }, []);

  const closeDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    if (frameRef.current) frameRef.current.src = '';
    setOpenItem(null);
    setScrollLocked(false);
  }, [setScrollLocked]);

  const openPdf = useCallback(
    (item: Destination) => {
      const pdfHref = encodeURI(item.pdf);
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        window.open(pdfHref, '_blank', 'noopener,noreferrer');
        return;
      }
      setOpenItem(item);
      setScrollLocked(true);
    },
    [setScrollLocked],
  );

  useEffect(() => {
    if (!openItem) return;
    const dialog = dialogRef.current;
    const frame = frameRef.current;
    if (!dialog || !frame) return;
    frame.src = encodeURI(openItem.pdf);
    if (!dialog.open) dialog.showModal();
  }, [openItem]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClose = () => {
      if (frameRef.current) frameRef.current.src = '';
      setOpenItem(null);
      setScrollLocked(false);
    };

    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, [setScrollLocked]);

  useEffect(() => {
    return () => setScrollLocked(false);
  }, [setScrollLocked]);

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div className="relative h-svh min-h-160 w-full overflow-hidden bg-alabaster-50 lg:h-[min(88svh,780px)] lg:min-h-130">
        {/* Map layer: kept at its true 2:1 ratio; right-aligned so it hugs the right edge and any leftover
            letterbox gap falls on the left, behind the floating panel, instead of splitting both sides */}
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="relative aspect-2/1 h-full w-auto max-w-full">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={mapDataUri}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover mask-[linear-gradient(to_bottom,transparent,white_8%,white_92%,transparent)]"
              />

              <svg
                viewBox="0 0 100 50"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {points.map(({ item, placement }, index) => (
                  <motion.path
                    key={item.id}
                    d={curvedPath(origin, placement)}
                    fill="none"
                    stroke="#d31224"
                    strokeOpacity="0.85"
                    strokeWidth="0.22"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, delay: 0.15 + index * 0.12, ease: 'easeOut' }}
                  />
                ))}
              </svg>
            </div>

            {/* Origin marker: San Juan, PR */}
            <div
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${origin.xPct}%`, top: `${origin.yPct}%` }}
            >
              <span className="block size-2.5 rounded-full border-2 border-white bg-cod-gray-950 shadow-sm" />
              <span className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 rounded-full bg-cod-gray-950 px-2 py-0.5 text-[10px] font-bold tracking-wide whitespace-nowrap text-white uppercase shadow-sm">
                {originPoint.label}
              </span>
            </div>

            {points.map(({ item, placement }) => {
              const isActive = activeId === item.id;
              return (
                <div
                  key={item.id}
                  className={`absolute ${isActive ? 'z-40' : 'z-20'}`}
                  style={{ left: `${placement.xPct}%`, top: `${placement.yPct}%` }}
                  onMouseLeave={() => setActiveId((current) => (current === item.id ? null : current))}
                >
                  <button
                    type="button"
                    className="relative -translate-x-1/2 -translate-y-1/2 rounded-full outline-offset-4 focus-visible:outline-2 focus-visible:outline-monza-600"
                    onMouseEnter={() => setActiveId(item.id)}
                    onFocus={() => setActiveId(item.id)}
                    onClick={() => setActiveId(item.id)}
                    aria-expanded={isActive}
                    aria-label={`${item.title} — ${item.subtitle}`}
                  >
                    <span
                      className={`block rounded-full border-2 border-white bg-monza-600 shadow-sm transition-transform duration-200 ${
                        isActive ? 'size-3.5 scale-125' : 'size-3'
                      }`}
                    />
                    <span className="absolute inset-0 -m-1.5 animate-ping rounded-full bg-monza-600/40" />
                  </button>

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: placement.vertical === 'above' ? 6 : -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        className={`absolute z-40 w-56 ${cardAlignClasses[placement.align]} ${
                          placement.vertical === 'above'
                            ? 'bottom-[calc(100%+0.75rem)]'
                            : 'top-[calc(100%+0.75rem)]'
                        }`}
                      >
                        <div className="overflow-hidden rounded-xl border border-alabaster-200 bg-white shadow-[0_12px_30px_rgba(10,10,10,0.18)]">
                          <img
                            src={item.image}
                            alt={item.imageAlt}
                            width={400}
                            height={240}
                            className="h-24 w-full object-cover"
                          />
                          <div className="p-3">
                            <p className="text-[10px] font-bold tracking-wide text-monza-600 uppercase">
                              {item.continent}
                            </p>
                            <h3 className="mt-0.5 text-sm font-extrabold tracking-tight text-cod-gray-950">
                              {item.title}
                            </h3>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-cod-gray-600">
                              {item.subtitle}
                            </p>
                            <button
                              type="button"
                              onClick={() => openPdf(item)}
                              className="mt-2.5 inline-flex min-h-8 w-full items-center justify-center rounded-full bg-monza-600 px-3 text-[11px] font-bold tracking-wide text-white uppercase transition hover:bg-monza-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-monza-600"
                            >
                              Ver itinerario
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Soft fade so the floating panel reads as anchored to the map, not just stacked on top */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-linear-to-b from-transparent to-alabaster-50 max-lg:h-[55%] lg:h-36"
          aria-hidden="true"
        />

        {/* Floating panel: continent list, mirrors the "Red de Agencias Aliadas" layout */}
        <aside
          className="absolute z-50 flex flex-col overflow-hidden border border-white/40 bg-white/85 backdrop-blur-sm max-lg:inset-x-0 max-lg:bottom-0 max-lg:max-h-[60%] max-lg:rounded-t-2xl max-lg:border-b-0 max-lg:px-3 max-lg:pt-3 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:top-8 lg:bottom-8 lg:left-8 lg:w-[min(22rem,calc(100%-4rem))] lg:rounded-2xl lg:bg-white/80 lg:p-5"
          aria-label="Destinos por continente"
        >
          <div
            data-lenis-prevent
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-3 pb-1 touch-pan-x overscroll-x-contain scrollbar-none lg:min-h-0 lg:flex-1 lg:flex-col lg:gap-5 lg:overflow-x-visible lg:overflow-y-auto lg:px-0 lg:pb-0"
            role="list"
          >
            {continents.map(({ continent, items }) => (
              <div
                key={continent}
                className="w-[min(85vw,19rem)] shrink-0 snap-start rounded-xl border border-alabaster-200/70 bg-white/90 p-4 lg:w-full lg:shrink"
              >
                <h3 className="mb-2.5 text-xs font-bold tracking-[0.14em] text-cod-gray-500 uppercase">
                  {continent}
                </h3>
                <ul className="space-y-1" role="list">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => openPdf(item)}
                        onMouseEnter={() => setActiveId(item.id)}
                        onMouseLeave={() =>
                          setActiveId((current) => (current === item.id ? null : current))
                        }
                        className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition hover:border-alabaster-200 hover:bg-alabaster-50"
                      >
                        <img
                          src={item.image}
                          alt=""
                          aria-hidden="true"
                          width={96}
                          height={96}
                          className="size-12 shrink-0 rounded-lg object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-cod-gray-950">
                            {item.title}
                          </span>
                          <span className="block truncate text-xs text-cod-gray-600">
                            {item.subtitle}
                          </span>
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-monza-600 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-modal="true"
        data-lenis-prevent
        className="fixed inset-0 z-70 m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-transparent p-0 open:flex open:items-center open:justify-center"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
      >
        <div className="relative flex h-[min(94dvh,1000px)] w-[min(98vw,1200px)] flex-col overflow-hidden rounded-2xl border border-alabaster-200 bg-white shadow-[0_20px_60px_rgba(10,10,10,0.28)]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-alabaster-200 px-4 py-3 sm:px-5">
            <h2
              id={titleId}
              className="truncate text-lg font-extrabold tracking-tight text-cod-gray-950 sm:text-xl"
            >
              {openItem?.title ?? 'Destino'}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={openItem ? encodeURI(openItem.pdf) : '#'}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-alabaster-200 bg-white px-4 text-xs font-bold tracking-wide text-cod-gray-900 uppercase transition hover:border-monza-600 hover:text-monza-600 sm:text-sm"
              >
                Descargar PDF
              </a>
              <button
                type="button"
                onClick={closeDialog}
                className="inline-flex size-10 items-center justify-center rounded-full border border-alabaster-200 text-cod-gray-800 transition hover:border-monza-600 hover:text-monza-600"
                aria-label="Cerrar itinerario"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 bg-cod-gray-100">
            <iframe
              ref={frameRef}
              title={openItem ? `Itinerario ${openItem.title}` : 'Itinerario PDF'}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </dialog>
    </div>
  );
}
