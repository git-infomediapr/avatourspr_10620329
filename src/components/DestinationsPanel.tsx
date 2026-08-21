import { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  Building2,
  Landmark,
  Mountain,
  Pyramid,
  Snowflake,
  Waves,
} from 'lucide-react';
import { ExpandingCards, type ExpandingCardItem } from './ExpandingCards';
import { upcomingDestinations } from '../data/upcomingDestinations.js';

const iconById: Record<string, ExpandingCardItem['icon']> = {
  argentina: <Waves className="size-6" aria-hidden="true" />,
  'italia-croacia': <Landmark className="size-6" aria-hidden="true" />,
  japon: <Mountain className="size-6" aria-hidden="true" />,
  mexico: <Pyramid className="size-6" aria-hidden="true" />,
  polonia: <Building2 className="size-6" aria-hidden="true" />,
  suiza: <Snowflake className="size-6" aria-hidden="true" />,
};

const cardItems: ExpandingCardItem[] = upcomingDestinations.map((item) => ({
  id: item.id,
  title: item.title,
  description: item.subtitle,
  imgSrc: item.image,
  imgAlt: item.imageAlt,
  icon: iconById[item.id] ?? <Mountain className="size-6" aria-hidden="true" />,
  pdfHref: encodeURI(item.pdf),
}));

export default function DestinationsPanel() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [openItem, setOpenItem] = useState<ExpandingCardItem | null>(null);

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
    (item: ExpandingCardItem) => {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        window.open(item.pdfHref, '_blank', 'noopener,noreferrer');
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
    frame.src = openItem.pdfHref;
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
    <div className="flex w-full flex-col items-stretch">
      <ExpandingCards
        items={cardItems}
        defaultActiveIndex={0}
        onOpenPdf={openPdf}
        className="mx-auto"
      />

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
                href={openItem?.pdfHref ?? '#'}
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
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
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
