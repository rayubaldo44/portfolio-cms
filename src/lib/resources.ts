import type { SkillCategory } from "@/types";

export const RESOURCE_CATEGORIES: readonly { value: SkillCategory; label: string }[] = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "ai_ml", label: "AI & Machine Learning" },
  { value: "tools", label: "Dev Tools" },
];

export function getResourceCategoryLabel(category: string): string {
  return RESOURCE_CATEGORIES.find(option => option.value === category)?.label ?? category;
}
