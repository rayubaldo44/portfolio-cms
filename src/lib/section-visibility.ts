export const SECTION_OPTIONS = [
  { key: "projects", field: "showProjects", label: "Projects", href: "/projects" },
  { key: "experience", field: "showExperience", label: "Experience", href: "/experience" },
  { key: "stack", field: "showStack", label: "Stack", href: "/stack" },
  { key: "about", field: "showAbout", label: "About", href: "/about" },
  { key: "certifications", field: "showCertifications", label: "Certifications", href: "/certifications" },
  { key: "githubContributions", field: "showGithubContributions", label: "GitHub Contributions", href: null },
] as const;

export type SectionKey = (typeof SECTION_OPTIONS)[number]["key"];
export type VisibilityField = (typeof SECTION_OPTIONS)[number]["field"];
export type SectionVisibility = Record<SectionKey, boolean>;
export type SectionVisibilitySettings = Record<VisibilityField, boolean>;

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  projects: true, experience: true, stack: true, about: true,
  certifications: true, githubContributions: true,
};
export const HIDDEN_SECTION_VISIBILITY: SectionVisibility = {
  projects: false, experience: false, stack: false, about: false,
  certifications: false, githubContributions: false,
};

export function getSectionVisibility(settings: Partial<SectionVisibilitySettings> | null): SectionVisibility {
  return Object.fromEntries(SECTION_OPTIONS.map(({ key, field }) => [key, settings?.[field] ?? true])) as SectionVisibility;
}
