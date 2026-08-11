import { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  Map,
  Marker,
  Popup,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Phone, Mail, X } from 'lucide-react';
import { agencies } from '../data/agencies.js';

setWorkerUrl(maplibreWorkerUrl);

const MONZA_600 = '#d31224';
const COD_GRAY_600 = '#545454';
const PR_CENTER = { lng: -66.45, lat: 18.22 };

const MAP_STYLE = {
  version: 8,
  name: 'AVA Carto Positron',
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: 'carto-tiles',
      type: 'raster',
      source: 'carto',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
};

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
  // MapLibre CSS uses .maplibregl-marker { position:absolute; top:0; left:0 }.
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

function addAgencyMarkers(map, markersRef, setActiveId) {
  Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
  markersRef.current = {};

  agencies.forEach((agency) => {
    const el = createMarkerElement();
    el.addEventListener('click', (event) => {
      event.stopPropagation();
      setActiveId(agency.id);
    });

    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; min-width: 160px;">
        <strong style="display:block;margin-bottom:4px;">${agency.name}</strong>
        <span style="display:block;color:${COD_GRAY_600};font-size:12px;margin-bottom:6px;">${agency.municipality}</span>
        ${agency.phone ? `<div style="font-size:13px;margin-bottom:2px;"><a href="tel:${agency.phone.replace(/-/g, '')}">${agency.phone}</a></div>` : ''}
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
                {agency.phone ? (
                  <p className="flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                    <a
                      href={`tel:${agency.phone.replace(/-/g, '')}`}
                      className="hover:text-monza-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {agency.phone}
                    </a>
                  </p>
                ) : null}
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
  const [activeId, setActiveId] = useState(agencies[0]?.id ?? null);
  const [mapReady, setMapReady] = useState(false);
  const [mapUnlocked, setMapUnlocked] = useState(false);

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

    const mobile = isMobileViewport();

    const map = new Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [PR_CENTER.lng, PR_CENTER.lat],
      zoom: 8.4,
      attributionControl: true,
      // Ctrl/⌘ + wheel on desktop (Google Maps style). Disabled on mobile for tap-to-unlock.
      cooperativeGestures: true,
      locale: {
        'CooperativeGesturesHandler.WindowsHelpText':
          'Mantén Ctrl y desplázate para hacer zoom en el mapa',
        'CooperativeGesturesHandler.MacHelpText':
          'Mantén ⌘ y desplázate para hacer zoom en el mapa',
        'CooperativeGesturesHandler.MobileHelpText': 'Usa dos dedos para mover el mapa',
      },
    });

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;

    if (mobile) {
      map.cooperativeGestures.disable();
      setMapInteractions(map, false);
      map.getCanvas().style.touchAction = 'pan-y';
    }

    const onReady = () => {
      addAgencyMarkers(map, markersRef, setActiveId);
      map.resize();
      setMapReady(true);
    };

    map.on('load', onReady);
    map.on('error', (event) => {
      console.error('[AgenciesMap]', event?.error ?? event);
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    const mq = window.matchMedia('(max-width: 1023px)');
    const onViewportChange = () => {
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
    };
    mq.addEventListener('change', onViewportChange);

    const resizeTimers = [100, 400, 1000].map((ms) =>
      window.setTimeout(() => map.resize(), ms),
    );

    return () => {
      mq.removeEventListener('change', onViewportChange);
      resizeTimers.forEach((id) => window.clearTimeout(id));
      resizeObserver.disconnect();
      Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
      setMapReady(false);
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
      // Scale the inner dot only — never el.style.transform (MapLibre owns it).
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
      />

      {/* Soft bottom fade — compact on mobile so the map stays dominant */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-linear-to-b from-transparent to-white max-lg:h-44 sm:h-48 lg:h-36"
        aria-hidden="true"
      />

      {/* Mobile: tap to unlock map (above carousel bar); pins remain clickable */}
      {!mapUnlocked && (
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
      {mapUnlocked && (
        <button
          type="button"
          className="absolute top-24 right-3 z-30 flex size-11 items-center justify-center rounded-full border border-alabaster-200/60 bg-white/80 text-cod-gray-900 backdrop-blur-sm lg:hidden"
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
        .ava-agencies-map .maplibregl-ctrl-top-right {
          top: 6.5rem;
          right: 0.75rem;
        }
        @media (max-width: 1023px) {
          .ava-agencies-map .maplibregl-ctrl-top-right {
            top: 5.5rem;
            right: 0.5rem;
          }
          .ava-agencies-map .maplibregl-ctrl-bottom-right,
          .ava-agencies-map .maplibregl-ctrl-bottom-left {
            margin-bottom: 11.5rem;
          }
          .ava-agencies-map .maplibregl-popup {
            max-width: min(260px, calc(100vw - 2rem)) !important;
          }
        }
        .ava-agencies-map .maplibregl-cooperative-gesture-screen {
          /* Full hit-area stays, but no full-bleed dim — only the centered chip is dark */
          background: transparent !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .ava-agencies-map .maplibregl-cooperative-gesture-screen .maplibregl-desktop-message,
        .ava-agencies-map .maplibregl-cooperative-gesture-screen .maplibregl-mobile-message {
          color: #fff;
          background: rgba(10, 10, 10, 0.8);
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1.35;
          text-align: center;
          max-width: min(22rem, calc(100% - 2rem));
          padding: 0.85rem 1.25rem;
          border-radius: 9999px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
        }
      `}</style>
    </section>
  );
}
