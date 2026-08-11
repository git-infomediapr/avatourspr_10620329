import { motion, useReducedMotion, type Variants } from 'framer-motion';

export interface ImageRevealProps {
  leftImage: string;
  middleImage: string;
  rightImage: string;
  leftAlt?: string;
  middleAlt?: string;
  rightAlt?: string;
}

export default function ImageReveal({
  leftImage,
  middleImage,
  rightImage,
  leftAlt = 'Destino AVA Tours',
  middleAlt = 'Destino AVA Tours',
  rightAlt = 'Destino AVA Tours',
}: ImageRevealProps) {
  const reduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        delay: reduceMotion ? 0 : 0.2,
        staggerChildren: reduceMotion ? 0 : 0.2,
      },
    },
  };

  const leftImageVariants: Variants = {
    initial: { rotate: 0, x: 0, y: 0 },
    animate: {
      rotate: -8,
      x: -145,
      y: 14,
      transition: { type: 'spring', stiffness: 120, damping: 12 },
    },
    hover: {
      rotate: 1,
      x: -152,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  };

  const middleImageVariants: Variants = {
    initial: { rotate: 0, x: 0, y: 0 },
    animate: {
      rotate: 5,
      x: 0,
      y: -4,
      transition: { type: 'spring', stiffness: 120, damping: 12 },
    },
    hover: {
      rotate: 0,
      x: 0,
      y: -16,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  };

  const rightImageVariants: Variants = {
    initial: { rotate: 0, x: 0, y: 0 },
    animate: {
      rotate: -5,
      x: 155,
      y: 18,
      transition: { type: 'spring', stiffness: 120, damping: 12 },
    },
    hover: {
      rotate: 2,
      x: 155,
      y: 6,
      transition: { type: 'spring', stiffness: 200, damping: 15 },
    },
  };

  const desktopTiles = [
    {
      key: 'left',
      src: leftImage,
      alt: leftAlt,
      variants: leftImageVariants,
      z: 30,
      origin: 'origin-bottom-right',
    },
    {
      key: 'middle',
      src: middleImage,
      alt: middleAlt,
      variants: middleImageVariants,
      z: 20,
      origin: 'origin-bottom-left',
    },
    {
      key: 'right',
      src: rightImage,
      alt: rightAlt,
      variants: rightImageVariants,
      z: 10,
      origin: 'origin-bottom-right',
    },
  ] as const;

  const mobileVariants: Variants[] = [
    {
      initial: { opacity: 0, y: 20, rotate: 0 },
      animate: {
        opacity: 1,
        y: 0,
        rotate: -3,
        transition: { type: 'spring', stiffness: 120, damping: 16 },
      },
    },
    {
      initial: { opacity: 0, y: 20, rotate: 0 },
      animate: {
        opacity: 1,
        y: 0,
        rotate: 2.5,
        transition: { type: 'spring', stiffness: 120, damping: 16 },
      },
    },
    {
      initial: { opacity: 0, y: 20, rotate: 0 },
      animate: {
        opacity: 1,
        y: 0,
        rotate: -2,
        transition: { type: 'spring', stiffness: 120, damping: 16 },
      },
    },
  ];

  return (
    <>
      {/* Mobile — smaller, tightly overlapping stack */}
      <motion.div
        className="mx-auto flex w-full max-w-[15rem] flex-col items-center py-1 lg:hidden"
        variants={containerVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
      >
        {desktopTiles.map((tile, i) => (
          <motion.div
            key={`m-${tile.key}`}
            className={`relative w-[min(100%,13.5rem)] overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ${
              i > 0 ? '-mt-14' : ''
            }`}
            style={{ zIndex: 10 + i }}
            variants={mobileVariants[i]}
          >
            <img
              src={tile.src}
              alt={tile.alt}
              width="640"
              height="800"
              loading="lazy"
              decoding="async"
              className="aspect-4/5 w-full rounded-lg object-cover"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Desktop — fan fills column; padding room so rotated left tile is not clipped */}
      <div className="relative mx-auto hidden h-[28rem] w-full min-w-0 items-center justify-center overflow-visible px-3 lg:flex xl:h-[30rem]">
        <motion.div
          className="relative flex h-full w-full max-w-[36rem] items-center justify-center"
          variants={containerVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.35 }}
        >
          {desktopTiles.map((tile) => (
            <motion.div
              key={tile.key}
              className={`absolute h-[19.5rem] w-[15.25rem] overflow-hidden rounded-2xl bg-white p-2 shadow-xl xl:h-[21rem] xl:w-[16.5rem] ${tile.origin}`}
              variants={tile.variants}
              whileHover={reduceMotion ? undefined : 'hover'}
              animate="animate"
              style={{ zIndex: tile.z }}
            >
              <img
                src={tile.src}
                alt={tile.alt}
                width="528"
                height="672"
                loading="lazy"
                decoding="async"
                className="h-full w-full rounded-xl object-cover"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
}
