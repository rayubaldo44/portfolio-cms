"use client";

import { useState, type ReactNode } from "react";
import { RevealStagger } from "@/components/motion/reveal-stagger";
import { certificationFilters } from "@/lib/certification-categories";

interface CertificationListProps {
  items: { id: string; category: string | null; content: ReactNode }[];
}

export function CertificationList({ items }: CertificationListProps) {
  const [selected, setSelected] = useState("all");
  const filters = certificationFilters(items.map((item) => item.category));
  const active = filters.some((filter) => filter.value === selected) ? selected : "all";
  const visible = active === "all" ? items : items.filter((item) => (item.category ?? "uncategorized") === active);

  return (
    <div className="mt-10">
      {filters.length > 0 && (
        <div role="group" aria-label="Filter certifications by category" className="mb-8 flex flex-wrap gap-2">
          {[{ value: "all", label: "All" }, ...filters].map((filter) => (
            <button
              key={filter.value}
              type="button"
              aria-pressed={active === filter.value}
              aria-controls="certification-results"
              onClick={() => setSelected(filter.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 aria-pressed:border-gray-900 aria-pressed:bg-gray-900 aria-pressed:text-white dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:aria-pressed:border-gray-100 dark:aria-pressed:bg-gray-100 dark:aria-pressed:text-gray-900"
            >{filter.label}</button>
          ))}
        </div>
      )}
      <div id="certification-results">
        {filters.length > 0 && <p role="status" className="sr-only">{visible.length} {visible.length === 1 ? "certification" : "certifications"} shown</p>}
        <RevealStagger key={active} className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {visible.map((item) => item.content)}
        </RevealStagger>
      </div>
    </div>
  );
}
