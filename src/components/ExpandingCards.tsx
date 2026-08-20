import * as React from 'react';
import { cn } from '../lib/utils';

export type ExpandingCardItem = {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  imgAlt?: string;
  icon: React.ReactNode;
  pdfHref: string;
};

type ExpandingCardsProps = React.HTMLAttributes<HTMLUListElement> & {
  items: ExpandingCardItem[];
  defaultActiveIndex?: number;
  onOpenPdf?: (item: ExpandingCardItem) => void;
  ctaLabel?: string;
};

export const ExpandingCards = React.forwardRef<HTMLUListElement, ExpandingCardsProps>(
  (
    {
      className,
      items,
      defaultActiveIndex = 0,
      onOpenPdf,
      ctaLabel = 'Ver itinerario',
      ...props
    },
    ref,
  ) => {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(defaultActiveIndex);
    const [isDesktop, setIsDesktop] = React.useState(false);

    React.useEffect(() => {
      const handleResize = () => {
        setIsDesktop(window.matchMedia('(min-width: 768px)').matches);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const gridStyle = React.useMemo(() => {
      if (activeIndex === null) return {};

      if (isDesktop) {
        const columns = items.map((_, index) => (index === activeIndex ? '5fr' : '1fr')).join(' ');
        return { gridTemplateColumns: columns };
      }

      const rows = items.map((_, index) => (index === activeIndex ? '5fr' : '1fr')).join(' ');
      return { gridTemplateRows: rows };
    }, [activeIndex, items, isDesktop]);

    const handleInteraction = (index: number) => {
      setActiveIndex(index);
    };

    return (
      <ul
        ref={ref}
        role="list"
        className={cn(
          'grid w-full max-w-6xl gap-2',
          'h-[min(70svh,600px)] md:h-[500px]',
          'transition-[grid-template-columns,grid-template-rows] duration-500 ease-out',
          className,
        )}
        style={{
          ...gridStyle,
          ...(isDesktop ? { gridTemplateRows: '1fr' } : { gridTemplateColumns: '1fr' }),
        }}
        {...props}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={item.id}
              className={cn(
                'group relative min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-cod-gray-950 shadow-sm',
                'md:min-w-[4.5rem]',
                'focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-monza-600',
              )}
              onMouseEnter={() => handleInteraction(index)}
              onFocus={() => handleInteraction(index)}
              onClick={() => handleInteraction(index)}
              tabIndex={0}
              data-active={isActive}
              aria-current={isActive ? 'true' : undefined}
            >
              <img
                src={item.imgSrc}
                alt={item.imgAlt ?? item.title}
                width={1200}
                height={800}
                decoding="async"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out',
                  isActive ? 'scale-100 grayscale-0' : 'scale-110 grayscale',
                )}
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-cod-gray-950/90 via-cod-gray-950/45 to-transparent"
                aria-hidden="true"
              />

              <article className="absolute inset-0 flex flex-col justify-end gap-2 p-4 sm:p-5">
                <h3
                  className={cn(
                    'hidden origin-left rotate-90 text-xs font-semibold tracking-[0.18em] text-white/75 uppercase transition-opacity duration-300 ease-out md:block',
                    isActive ? 'opacity-0' : 'opacity-100',
                  )}
                >
                  {item.title}
                </h3>

                <div
                  className={cn(
                    'text-monza-400 transition-opacity duration-300 ease-out delay-75',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {item.icon}
                </div>

                <h3
                  className={cn(
                    'text-xl font-extrabold tracking-tight text-white transition-opacity duration-300 ease-out delay-150 sm:text-2xl',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {item.title}
                </h3>

                <p
                  className={cn(
                    'max-w-xs text-sm leading-relaxed text-white/80 transition-opacity duration-300 ease-out delay-200',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                >
                  {item.description}
                </p>

                {onOpenPdf ? (
                  <button
                    type="button"
                    className={cn(
                      'mt-1 inline-flex min-h-11 w-fit items-center justify-center rounded-full bg-monza-600 px-5 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-monza-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                      'duration-300 ease-out delay-300',
                      isActive
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0',
                    )}
                    tabIndex={isActive ? 0 : -1}
                    aria-hidden={!isActive}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenPdf(item);
                    }}
                  >
                    {ctaLabel}
                  </button>
                ) : null}
              </article>
            </li>
          );
        })}
      </ul>
    );
  },
);

ExpandingCards.displayName = 'ExpandingCards';
