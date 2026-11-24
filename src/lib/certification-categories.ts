export const CERTIFICATION_CATEGORIES = [
  { value: "cybersecurity", label: "Cybersecurity" },
  { value: "system_design", label: "System Design & Architecture" },
  { value: "software_development", label: "Software Development" },
  { value: "cloud_devops", label: "Cloud & DevOps" },
  { value: "ai_ml", label: "AI & Machine Learning" },
] as const;

export function certificationCategoryLabel(category: string | null | undefined): string {
  return CERTIFICATION_CATEGORIES.find((option) => option.value === category)?.label ?? "Uncategorized";
}

export function certificationFilters(categories: (string | null)[]) {
  const present = new Set(categories.map((category) => category ?? "uncategorized"));
  if (categories.length < 6 || present.size < 2) return [];
  return [
    ...CERTIFICATION_CATEGORIES.filter((option) => present.has(option.value)),
    ...(present.has("uncategorized") ? [{ value: "uncategorized", label: "Uncategorized" }] : []),
  ];
}
