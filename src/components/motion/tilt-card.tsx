/**
 * Motion: TiltCard | Type: Client | Deps: motion/react, cn, useFinePointer
 * Subtle pointer-tracking tilt (transform-only, spring-driven).
 * Disabled on coarse pointers and when prefers-reduced-motion is set.
 */
"use client";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/hooks/use-fine-pointer";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({ children, className, maxTilt = 3 }: TiltCardProps) {
  const reduce = useReducedMotion();
  const canHover = useFinePointer();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useTransform(py, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(px, [0, 1], [-maxTilt, maxTilt]);
  const enabled = canHover && !reduce;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!enabled) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  function onPointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      className={cn(className)}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  );
}