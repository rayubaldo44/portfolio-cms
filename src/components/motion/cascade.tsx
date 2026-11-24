/**
 * Motion: Cascade | Type: Client | Deps: cn
 * Toggles `is-in-view` on a container via IntersectionObserver (once) so CSS
 * child stagger animations (gated by prefers-reduced-motion) play on scroll-in.
 */
"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CascadeProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Cascade({ children, className, style }: CascadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <div
      ref={ref}
      className={cn(className, seen && "is-in-view")}
      style={style}
    >
      {children}
    </div>
  );
}