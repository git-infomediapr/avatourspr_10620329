import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { MapPin, Phone, Mail, X } from 'lucide-react';
import { agencies } from '../data/agencies.js';

const MAPBOX_TOKEN =
  'pk.eyJ1IjoibWdvbnphbGV6MjkiLCJhIjoiY210cjhwbmhpMDIxZzJ6cHl1dTkwbWkzdyJ9.VAmnbDMPO-tPdYpaRmhbYw';

const MONZA_600 = '#d31224';
const COD_GRAY_600 = '#545454';
const PR_CENTER = { lng: -66.45, lat: 18.22 };
const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isMobileViewport() {
  return window.matchMedia('(max-width: 1023px)').matches;
}

function setMapInteractions(map, enabled) {
  const handlers = [
    map.dragPan,
    map.scrollZoom,
    map.boxZoom,
    map.dragRotate,
    map.keyboard,
    map.doubleClickZoom,
    map.touchZoomRotate,
  ];
  handlers.forEach((handler) => {
    if (!handler) return;
    if (enabled) handler.enable();
    else handler.disable();
  });
}

function createMarkerElement() {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'ava-map-pin';
  // Mapbox CSS uses .mapboxgl-marker { position:absolute; top:0; left:0 }.
  // Do NOT set position:relative here — it overrides that and stacks markers in flow
  // (each pin ends up offset by ~width * index from the popup/lngLat).
  el.style.cssText = `
    width: 18px;
    height: 18px;
    border: 0;
    background: transparent;
    padding: 0;
    margin: 0;
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  `;
  el.setAttribute('aria-label', 'Ubicación de agencia');

  const dot = document.createElement('span');
  dot.className = 'ava-map-pin-dot';
  dot.setAttribute('aria-hidden', 'true');
  dot.style.cssText = `
    display: block;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    border: 2px solid #fff;
    background: ${MONZA_600};
    box-shadow: 0 2px 8px rgba(0,0,0,.35);
    transition: transform .2s ease;
    transform-origin: center center;
  `;
  el.appendChild(dot);
  return el;
}

function addAgencyMarkers(mapboxgl, map, markersRef, setActiveId) {
  const { Marker, Popup } = mapboxgl;

  Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
  markersRef.current = {};

  agencies.forEach((agency) => {
    const el = createMarkerElement();
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      setActiveId(agency.id);
    });

    const phones = agency.phones?.length
      ? agency.phones
      : agency.phone
        ? [agency.phone]
        : [];
    const phonesHtml = phones
      .map(
        (phone) =>
          `<div style="font-size:13px;margin-bottom:2px;"><a href="tel:${phone.replace(/-/g, '')}">${phone}</a></div>`,
      )
      .join('');

    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; min-width: 160px;">
        <strong style="display:block;margin-bottom:4px;">${agency.name}</strong>
        <span style="display:block;color:${COD_GRAY_600};font-size:12px;margin-bottom:6px;">${agency.municipality}</span>
        ${phonesHtml}
        ${agency.email ? `<div style="font-size:13px;"><a href="mailto:${agency.email}">${agency.email}</a></div>` : ''}
      </div>
    `;

    const marker = new Marker({ element: el })
      .setLngLat([agency.lng, agency.lat])
      .setPopup(
        new Popup({
          offset: 16,
          closeButton: true,
          maxWidth: '260px',
          focusAfterOpen: false,
        }).setHTML(popupHtml),
      )
      .addTo(map);

    markersRef.current[agency.id] = { marker, el };
  });
}

function AgencyList({ activeId, setActiveId }) {
  return (
    <ul
      className="flex gap-2.5 overflow-x-auto overscroll-x-contain touch-pan-x snap-x snap-mandatory scrollbar-none max-lg:px-0.5 lg:flex-col lg:gap-0 lg:space-y-2 lg:overflow-x-visible lg:overflow-y-visible lg:snap-none lg:pb-0"
      role="list"
    >
      {agencies.map((agency) => {
        const active = agency.id === activeId;
        return (
          <li
            key={agency.id}
            className="w-[min(78vw,16.5rem)] shrink-0 snap-start lg:w-full lg:snap-align-none"
          >
            <button
              type="button"
              data-agency-id={agency.id}
              onClick={() => setActiveId(agency.id)}
              className={`flex h-full w-full flex-col rounded-xl border p-3 text-left transition sm:p-3.5 lg:rounded-lg lg:p-4 ${
                active
                  ? 'border-monza-600 bg-white shadow-sm'
                  : 'border-alabaster-200/70 bg-white/80 hover:border-alabaster-200 hover:bg-white lg:border-transparent lg:bg-white/55 lg:hover:border-alabaster-200/80 lg:hover:bg-white/75'
              }`}
            >
              <div className="mb-1 flex flex-col gap-0.5 lg:mb-0.5 lg:flex-row lg:items-start lg:justify-between lg:gap-3">
                <h3 className="line-clamp-2 text-sm font-bold text-cod-gray-950 sm:text-base">
                  {agency.name}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-monza-600">
                  <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                  {agency.municipality}
                </span>
              </div>
              <div className="mt-auto space-y-1 text-xs text-cod-gray-600 sm:text-sm">
                {(agency.phones?.length
                  ? agency.phones
                  : agency.phone
                    ? [agency.phone]
                    : []
                ).map((phone) => (
                  <p key={phone} className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                    <a
                      href={`tel:${phone.replace(/-/g, '')}`}
                      className="hover:text-monza-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {phone}
                    </a>
                  </p>
                ))}
                {agency.email ? (
                  <p className="flex min-w-0 items-center gap-2">
                    <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                    <a
                      href={`mailto:${agency.email}`}
                      className="truncate hover:text-monza-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {agency.email}
                    </a>
                  </p>
                ) : null}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function AgenciesMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const listRef = useRef(null);
  const cleanupRef = useRef(() => {});
  const [activeId, setActiveId] = useState(agencies[0]?.id ?? null);
  const [mapReady, setMapReady] = useState(false);
  const [mapUnlocked, setMapUnlocked] = useState(false);
  const [mapSupported, setMapSupported] = useState(true);

  const lockMap = useEffectEvent(() => {
    const map = mapRef.current;
    if (!map) return;
    setMapInteractions(map, false);
    map.getCanvas().style.touchAction = 'pan-y';
    setMapUnlocked(false);
  });

  const unlockMap = useEffectEvent(() => {
    const map = mapRef.current;
    if (!map) return;
    setMapInteractions(map, true);
    map.getCanvas().style.touchAction = 'none';
    setMapUnlocked(true);
    map.resize();
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let cancelled = false;

    // Loaded dynamically (instead of a static top-level import) so that if
    // mapbox-gl fails to load or evaluate on a given browser/device, it throws
    // inside this handler — where we can catch it and fall back gracefully —
    // instead of crashing the whole React island during hydration and leaving
    // nothing rendered at all.
    Promise.all([import('mapbox-gl'), import('mapbox-gl/dist/mapbox-gl.css')])
      .then(([mod]) => {
        if (cancelled || !mapContainerRef.current || mapRef.current) return;

        const mapboxgl = mod.default;

        if (!mapboxgl.supported()) {
          setMapSupported(false);
          return;
        }

        mapboxgl.accessToken = MAPBOX_TOKEN;

        const mobile = isMobileViewport();

        let map;
        try {
          map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: MAP_STYLE,
            center: [PR_CENTER.lng, PR_CENTER.lat],
            zoom: 8.4,
            attributionControl: true,
            // Ctrl/⌘ + wheel on desktop (Google Maps style). Disabled on mobile for tap-to-unlock.
            cooperativeGestures: true,
            locale: {
              'ScrollZoomBlocker.CtrlMessage': 'Mantén Ctrl y desplázate para hacer zoom en el mapa',
              'ScrollZoomBlocker.CmdMessage': 'Mantén ⌘ y desplázate para hacer zoom en el mapa',
              'TouchPanBlocker.Message': 'Usa dos dedos para mover el mapa',
            },
          });
        } catch (err) {
          console.error('[AgenciesMap] no se pudo inicializar el mapa', err);
          setMapSupported(false);
          return;
        }

        mapRef.current = map;

        // Everything below is "nice to have" on top of a working map (controls,
        // cooperative-gesture locking, resize wiring). None of it should be able
        // to block markers/flyTo from ever becoming available, so each piece runs
        // in its own try/catch and the ready fallbacks are set up first.
        let readyCalled = false;
        const onReady = () => {
          if (readyCalled) return;
          readyCalled = true;
          window.clearTimeout(readyFallbackTimer);
          try {
            addAgencyMarkers(mapboxgl, map, markersRef, setActiveId);
          } catch (err) {
            console.error('[AgenciesMap] no se pudieron crear los pines', err);
          }
          try {
            map.resize();
          } catch {
            /* ignore */
          }
          setMapReady(true);
        };

        map.on('load', onReady);
        map.once('idle', onReady);
        const readyFallbackTimer = window.setTimeout(onReady, 4000);
        map.on('error', (event) => {
          console.error('[AgenciesMap]', event?.error ?? event);
        });

        try {
          map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
        } catch (err) {
          console.error('[AgenciesMap] no se pudo agregar el control de navegación', err);
        }

        try {
          if (mobile) {
            map.cooperativeGestures.disable();
            setMapInteractions(map, false);
            map.getCanvas().style.touchAction = 'pan-y';
          }
        } catch (err) {
          console.error('[AgenciesMap] no se pudo bloquear el gesto cooperativo', err);
        }

        let resizeObserver;
        try {
          resizeObserver = new ResizeObserver(() => {
            map.resize();
          });
          resizeObserver.observe(mapContainerRef.current);
        } catch (err) {
          console.error('[AgenciesMap] ResizeObserver no disponible', err);
        }

        const mq = window.matchMedia('(max-width: 1023px)');
        const onViewportChange = () => {
          try {
            const nowMobile = mq.matches;
            if (nowMobile) {
              map.cooperativeGestures.disable();
              setMapInteractions(map, false);
              map.getCanvas().style.touchAction = 'pan-y';
              setMapUnlocked(false);
            } else {
              map.cooperativeGestures.enable();
              setMapInteractions(map, true);
              map.getCanvas().style.touchAction = '';
              setMapUnlocked(false);
            }
            map.resize();
          } catch (err) {
            console.error('[AgenciesMap] error al cambiar de viewport', err);
          }
        };
        mq.addEventListener('change', onViewportChange);

        const resizeTimers = [100, 400, 1000].map((ms) =>
          window.setTimeout(() => {
            try {
              map.resize();
            } catch {
              /* ignore */
            }
          }, ms),
        );

        cleanupRef.current = () => {
          mq.removeEventListener('change', onViewportChange);
          window.clearTimeout(readyFallbackTimer);
          resizeTimers.forEach((id) => window.clearTimeout(id));
          resizeObserver?.disconnect();
          Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
          markersRef.current = {};
          map.remove();
          mapRef.current = null;
          setMapReady(false);
        };
      })
      .catch((err) => {
        console.error('[AgenciesMap] no se pudo cargar mapbox-gl', err);
        if (!cancelled) setMapSupported(false);
      });

    return () => {
      cancelled = true;
      cleanupRef.current();
      cleanupRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const agency = agencies.find((item) => item.id === activeId);
    const map = mapRef.current;
    if (!agency || !map) return;

    const duration = prefersReducedMotion() ? 0 : 1100;
    if (duration === 0) {
      map.jumpTo({ center: [agency.lng, agency.lat], zoom: 12 });
    } else {
      map.flyTo({
        center: [agency.lng, agency.lat],
        zoom: 12,
        essential: true,
        duration,
      });
    }

    Object.entries(markersRef.current).forEach(([id, { marker, el }]) => {
      const isActive = id === activeId;
      // Scale the inner dot only — never el.style.transform (Mapbox owns it).
      const dot = el.querySelector('.ava-map-pin-dot');
      if (dot instanceof HTMLElement) {
        dot.style.transform = `scale(${isActive ? 1.35 : 1})`;
      }
      const popup = marker.getPopup();
      if (isActive) {
        if (!popup.isOpen()) marker.togglePopup();
      } else if (popup.isOpen()) {
        marker.togglePopup();
      }
    });

    const list = listRef.current;
    const card = list?.querySelector(`[data-agency-id="${activeId}"]`);
    if (card instanceof HTMLElement && list instanceof HTMLElement) {
      if (isMobileViewport()) {
        card.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      } else {
        const cardRect = card.getBoundingClientRect();
        const listRect = list.getBoundingClientRect();

        if (cardRect.top < listRect.top) {
          list.scrollTop -= listRect.top - cardRect.top + 8;
        } else if (cardRect.bottom > listRect.bottom) {
          list.scrollTop += cardRect.bottom - listRect.bottom + 8;
        }
      }
    }
  }, [activeId, mapReady]);

  return (
    <section
      id="agencias"
      className="ava-agencies-map relative h-svh min-h-160 w-full overflow-hidden bg-alabaster-100 lg:h-[min(88svh,780px)] lg:min-h-130"
    >
      <div
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
        role="region"
        aria-label="Mapa de agencias afiliadas en Puerto Rico"
      >
        {!mapSupported && (
          <div className="flex h-full w-full items-center justify-center bg-alabaster-100 px-6 text-center">
            <p className="max-w-xs text-sm text-cod-gray-600">
              Tu navegador no pudo cargar el mapa interactivo. Encuentra tu agencia en la lista de
              abajo.
            </p>
          </div>
        )}
      </div>

      {/* Soft bottom fade — compact on mobile so the map stays dominant */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-b from-transparent to-white max-lg:h-44 sm:h-48 lg:h-36"
        aria-hidden="true"
      />

      {/* Mobile: tap to unlock map (above carousel bar); pins remain clickable */}
      {mapSupported && !mapUnlocked && (
        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-44 z-10 flex items-center justify-center bg-cod-gray-950/25 px-6 text-center lg:hidden">
          <button
            type="button"
            className="pointer-events-auto rounded-full border border-white/25 bg-cod-gray-950/75 px-5 py-3 text-sm font-semibold tracking-wide text-white"
            onClick={() => unlockMap()}
          >
            Toca para explorar el mapa
          </button>
        </div>
      )}

      {/* Mobile: lock map again */}
      {mapSupported && mapUnlocked && (
        <button
          type="button"
          className="absolute top-24 left-3 z-30 flex size-11 items-center justify-center rounded-full border border-alabaster-200/60 bg-white/80 text-cod-gray-900 shadow-sm backdrop-blur-sm lg:hidden"
          onClick={() => lockMap()}
          aria-label="Desactivar navegación del mapa"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      )}

      {/* Glass panel: compact horizontal carousel on mobile, vertical list on desktop */}
      <aside
        className="absolute z-20 flex flex-col overflow-hidden border border-white/40 bg-white/80 backdrop-blur-sm max-lg:inset-x-0 max-lg:bottom-0 max-lg:h-auto max-lg:max-h-none max-lg:rounded-t-2xl max-lg:border-b-0 max-lg:px-3 max-lg:pt-2 max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:top-24 lg:bottom-6 lg:left-6 lg:h-auto lg:max-h-none lg:w-[min(24rem,calc(100%-3rem))] lg:rounded-2xl lg:bg-white/70 lg:p-4"
        aria-label="Red de agencias aliadas"
      >
        <header className="mb-2 shrink-0 px-0.5 lg:mb-3 lg:border-b lg:border-cod-gray-200/50 lg:pb-3">
          <h2 className="text-base font-extrabold tracking-tight text-cod-gray-950 sm:text-lg lg:mb-2 lg:text-2xl">
            Red de Agencias Aliadas
          </h2>
          <p className="hidden text-sm leading-relaxed text-cod-gray-700 lg:block">
            ¡Contáctate con tu agencia de viajes aliada! Nuestra red de agencias está preparada para
            ayudarte a seleccionar el destino ideal, aprovechar las mejores ofertas de viajes y
            planificar unas vacaciones inolvidables con el respaldo de AVA Tours.
          </p>
        </header>
        <div
          ref={listRef}
          data-agency-list
          data-lenis-prevent
          className="min-h-0 w-full lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-0.5"
        >
          <AgencyList activeId={activeId} setActiveId={setActiveId} />
        </div>
      </aside>

      <style>{`
        .ava-agencies-map .mapboxgl-ctrl-top-right {
          top: 6.5rem;
          right: 0.75rem;
        }
        @media (max-width: 1023px) {
          .ava-agencies-map .mapboxgl-ctrl-top-right {
            top: 5.5rem;
            right: 0.5rem;
          }
          .ava-agencies-map .mapboxgl-ctrl-bottom-right,
          .ava-agencies-map .mapboxgl-ctrl-bottom-left {
            margin-bottom: 11.5rem;
          }
          .ava-agencies-map .mapboxgl-popup {
            max-width: min(260px, calc(100vw - 2rem)) !important;
          }
        }
        .ava-agencies-map .mapboxgl-scroll-zoom-blocker,
        .ava-agencies-map .mapboxgl-touch-pan-blocker {
          background: transparent !important;
          color: #fff;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1.35;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
        }
        .ava-agencies-map .mapboxgl-scroll-zoom-blocker-show,
        .ava-agencies-map .mapboxgl-touch-pan-blocker-show {
          background: rgba(10, 10, 10, 0.55) !important;
        }
      `}</style>
    </section>
  );
}
