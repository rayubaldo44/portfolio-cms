"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface StackPreviewProps {
  skills: { id: string; name: string }[];
  hasMore: boolean;
}

export function StackPreview({ skills, hasMore }: StackPreviewProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const [visibleCount, setVisibleCount] = useState(skills.length);
  const showMore = hasMore || visibleCount < skills.length;

  useLayoutEffect(() => {
    const list = listRef.current;
    const more = moreRef.current;
    if (!list || !more) return;

    function fitTwoRows() {
      if (!list || !more) return;
      const width = list.clientWidth;
      if (!width) return;
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      const widths = Array.from(list.children)
        .slice(0, skills.length)
        .map((item) => item.getBoundingClientRect().width);
      const moreWidth = more.getBoundingClientRect().width;

      for (let count = skills.length; count >= 0; count--) {
        const items = widths.slice(0, count);
        if (hasMore || count < skills.length) items.push(moreWidth);
        let rows = 1;
        let used = 0;
        for (const itemWidth of items) {
          const nextWidth = used ? used + gap + itemWidth : itemWidth;
          if (nextWidth > width && used) {
            rows++;
            used = itemWidth;
          } else {
            used = nextWidth;
          }
        }
        if (rows <= 2) {
          setVisibleCount(count);
          break;
        }
      }
    }

    const observer = new ResizeObserver(fitTwoRows);
    observer.observe(list);
    fitTwoRows();
    // Recalculate after the site's monospace font has loaded.
    let active = true;
    void document.fonts.ready.then(() => { if (active) fitTwoRows(); });
    return () => { active = false; observer.disconnect(); };
  }, [skills, hasMore]);

  return (
    <ul ref={listRef} aria-label="Technologies I work with" className="relative mt-5 flex flex-wrap gap-2.5">
      {skills.map((skill, index) => (
        <li key={skill.id} aria-hidden={index >= visibleCount ? true : undefined} className={`max-w-full shrink-0 ${index >= visibleCount ? "pointer-events-none invisible absolute" : ""}`}>
          <Badge variant="outline" className="max-w-full whitespace-nowrap rounded-md border-gray-300 px-3 py-1.5 font-mono text-sm font-normal leading-5 tracking-normal text-gray-600 dark:border-gray-800 dark:text-gray-300">
            {skill.name}
          </Badge>
        </li>
      ))}
      <li ref={moreRef} aria-hidden={!showMore ? true : undefined} className={`shrink-0 ${!showMore ? "pointer-events-none invisible absolute" : ""}`}>
        <Link href="/stack" tabIndex={showMore ? undefined : -1} aria-label="View more technologies" className="inline-flex whitespace-nowrap rounded-md border border-dashed border-gray-300 px-3 py-1.5 font-mono text-sm leading-5 text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-50">
          + more
        </Link>
      </li>
    </ul>
  );
}
