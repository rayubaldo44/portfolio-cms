/**
 * Motion: RevealStagger + RevealItem | Type: Client | Deps: motion/react, cn
 * Orchestrates a staggered whileInView reveal for a list / grid of items.
 * Children must be wrapped in <RevealItem> to inherit the stagger variants.
 * Honors prefers-reduced-motion by rendering the final state directly.
 */
"use client";
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface RevealStaggerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number;
  delayChildren?: number;
  amount?: number;
}

export function RevealStagger({
  children,
  className,
  style,
  stagger = 0.08,
  delayChildren = 0,
  amount = 0.15,
}: RevealStaggerProps) {
  const reduce = useReducedMotion();

  const variants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: EASE,
        staggerChildren: stagger,
        delayChildren,
      },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      style={style}
      variants={variants}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  layout?: boolean | "position" | "size" | "preserve-aspect";
  layoutTransition?: Transition;
}

export function RevealItem({
  children,
  className,
  layout = false,
  layoutTransition,
}: RevealItemProps) {
  return (
    <motion.div
      className={cn(className)}
      layout={layout}
      transition={layoutTransition ? { layout: layoutTransition } : undefined}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}
