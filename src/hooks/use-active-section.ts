/**
 * Hook: useActiveSection | Type: Client
 * Tracks which scroll section is currently in view on the homepage.
 * Uses IntersectionObserver with a narrow band in the middle of the viewport.
 * Returns the active section id, or "" when nothing is intersecting.
 */
"use client";
import { useEffect, useState } from "react";

const ROOT_MARGIN = "-40% 0px -55% 0px";

export function useActiveSection(
  isHome: boolean,
  sectionIds: readonly string[],
): string {
  const [active, setActive] = useState("");
  const key = sectionIds.join("");

  useEffect(() => {
    if (!isHome) return;

    const sections = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome, key]);

  return isHome ? active : "";
}
