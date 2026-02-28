import type { Variants } from "framer-motion";

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" as const } },
};

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const, delay: i * 0.06 },
  }),
};

export const heartPop: Variants = {
  idle: { scale: 1 },
  liked: {
    scale: [1, 1.4, 0.9, 1.15, 1],
    transition: { duration: 0.45, times: [0, 0.25, 0.5, 0.75, 1] },
  },
  unliked: { scale: [1, 0.8, 1], transition: { duration: 0.2 } },
};

export const floatAnimation = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
};

export const notificationItem: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const, delay: i * 0.05 },
  }),
};
