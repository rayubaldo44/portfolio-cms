/**
 * Motion: Magnetic | Type: Client | Deps: motion/react, cn, useFinePointer
 * Gentle pull-toward-cursor for CTAs and small controls (spring-driven).
 * Disabled on coarse pointers and when prefers-reduced-motion is set.
 */
"use client";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/hooks/use-fine-pointer";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({
  children,
  className,
  strength = 0.3,
}: MagneticProps) {
  const reduce = useReducedMotion();
  const canHover = useFinePointer();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.2 });
  const enabled = canHover && !reduce;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={cn(className)}
      style={{ x: sx, y: sy }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </motion.div>
  );
}