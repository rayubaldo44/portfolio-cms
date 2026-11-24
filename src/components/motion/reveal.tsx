/**
 * Motion: Reveal | Type: Client | Deps: motion/react, cn
 * Fades + rises children into view once they enter the viewport.
 * Honors prefers-reduced-motion by rendering the final state directly.
 */
"use client";
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  y?: number;
  amount?: number;
}

export function Reveal({
  children,
  className,
  style,
  delay = 0,
  duration = 0.6,
  y = 16,
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      style={style}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}