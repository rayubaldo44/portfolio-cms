/**
 * Component: Hero Portrait | Type: Client | Deps: Next Image, Motion
 */
"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent } from "react";
import { useFinePointer } from "@/hooks/use-fine-pointer";

export function HeroPortrait() {
  const reduceMotion = useReducedMotion();
  const canHover = useFinePointer();
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const imageX = useMotionValue(0);
  const imageY = useMotionValue(0);
  const textureX = useMotionValue(0);
  const textureY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 180, damping: 20, mass: 0.35 });
  const rotateY = useSpring(tiltY, { stiffness: 180, damping: 20, mass: 0.35 });
  const x = useSpring(imageX, { stiffness: 160, damping: 22, mass: 0.4 });
  const y = useSpring(imageY, { stiffness: 160, damping: 22, mass: 0.4 });
  const textureOffsetX = useSpring(textureX, {
    stiffness: 140,
    damping: 24,
    mass: 0.45,
  });
  const textureOffsetY = useSpring(textureY, {
    stiffness: 140,
    damping: 24,
    mass: 0.45,
  });
  const motionEnabled = canHover && !reduceMotion;

  function resetMotion() {
    tiltX.set(0);
    tiltY.set(0);
    imageX.set(0);
    imageY.set(0);
    textureX.set(0);
    textureY.set(0);
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (!motionEnabled) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

    tiltX.set(vertical * -4);
    tiltY.set(horizontal * 4);
    imageX.set(horizontal * 12);
    imageY.set(vertical * 12);
    textureX.set(horizontal * -6);
    textureY.set(vertical * -6);
  }

  return (
    <figure
      data-hero-photo
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMotion}
      onPointerCancel={resetMotion}
      className="relative aspect-[4/5] w-full"
    >
      <motion.div
        aria-hidden="true"
        className="hero-dot-texture pointer-events-none absolute -right-8 -top-9 hidden h-[62%] w-[76%] md:block"
        style={{
          x: motionEnabled ? textureOffsetX : 0,
          y: motionEnabled ? textureOffsetY : 0,
        }}
      />
      <motion.div
        style={{
          rotateX: motionEnabled ? rotateX : 0,
          rotateY: motionEnabled ? rotateY : 0,
          transformPerspective: 900,
        }}
        className="absolute inset-0 z-[1] overflow-hidden rounded-[2rem] border border-gray-200/80 bg-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.04),0_24px_64px_-28px_rgba(30,29,27,0.35)] dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_28px_72px_-28px_rgba(0,0,0,0.78)]"
      >
        <motion.div
          className="h-full w-full"
          initial={reduceMotion ? false : { opacity: 0.72, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            className="h-full w-full scale-[1.04]"
            style={{ x: motionEnabled ? x : 0, y: motionEnabled ? y : 0 }}
          >
            <Image
              src="/images/portrait.svg"
              alt="Original sample portrait illustration"
              width={1086}
              height={1448}
              preload
              sizes="(min-width: 1024px) 384px, (min-width: 768px) 288px, (min-width: 640px) 240px, 192px"
              className="h-full w-full object-cover object-[center_58%]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </figure>
  );
}
