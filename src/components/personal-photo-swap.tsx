/**
 * Component: Personal Photo Swap | Type: Client | Deps: Next Image, Motion
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export function PersonalPhotoSwap() {
  const [showFavorite, setShowFavorite] = useState(false);
  const reduceMotion = useReducedMotion();
  const revealTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.68, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <figure className="order-1 mx-auto flex w-48 max-w-full flex-col items-center sm:w-56 md:order-2 md:ml-auto md:mr-0 md:w-full lg:max-w-56">
      <button
        type="button"
        aria-label={showFavorite ? "Show Alex's photo" : "Reveal a favorite photo"}
        aria-pressed={showFavorite}
        onClick={() => setShowFavorite((visible) => !visible)}
        className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-gray-200/80 bg-gray-100 text-left shadow-[0_1px_0_rgba(0,0,0,0.04),0_18px_48px_-24px_rgba(30,29,27,0.3)] outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background active:translate-y-0 active:scale-[0.99] dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_20px_56px_-24px_rgba(0,0,0,0.72)]"
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: showFavorite ? 0.975 : 1 }}
          transition={revealTransition}
        >
          <Image
            src="/images/portrait.svg"
            alt={showFavorite ? "" : "Original sample portrait illustration"}
            fill
            sizes="(min-width: 1024px) 224px, (min-width: 768px) 192px, (min-width: 640px) 224px, 192px"
            aria-hidden={showFavorite}
            draggable={false}
            className="object-cover object-[center_58%]"
          />
        </motion.div>

        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{
            clipPath: showFavorite
              ? "inset(0% 0% 0% 0%)"
              : "inset(0% 100% 0% 0%)",
          }}
          transition={revealTransition}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: showFavorite ? 1 : 1.06 }}
            transition={revealTransition}
          >
            <Image
              src="/images/landscape.svg"
              alt={showFavorite ? "Original sample landscape illustration" : ""}
              fill
              sizes="(min-width: 1024px) 224px, (min-width: 768px) 192px, (min-width: 640px) 224px, 192px"
              aria-hidden={!showFavorite}
              draggable={false}
              className="object-cover object-[center_58%]"
            />
          </motion.div>
        </motion.div>

        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/70 shadow-[0_0_18px_4px_rgba(255,255,255,0.28)]"
          initial={false}
          animate={{
            left: showFavorite ? "100%" : "0%",
            opacity: reduceMotion ? 0 : [0, 0.85, 0],
          }}
          transition={revealTransition}
        />
      </button>
      <motion.figcaption
        aria-live="polite"
        key={showFavorite ? "favorite" : "portrait"}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.28 }}
        className="type-meta mt-3 min-h-4 text-center text-gray-500 dark:text-gray-400"
      >
        {showFavorite ? "An original sample landscape." : "Reveal a favorite photo"}
      </motion.figcaption>
    </figure>
  );
}
