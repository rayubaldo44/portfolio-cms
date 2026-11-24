export interface ProjectScreenshot {
  src: string;
  caption: string;
}

export const MAX_PROJECT_SCREENSHOTS = 8;
export const MAX_PROJECT_IMAGE_CHARACTERS = 3 * 1024 * 1024;

export function parseProjectScreenshots(value: unknown): ProjectScreenshot[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) =>
    item && typeof item === "object" && typeof item.src === "string"
      ? [{ src: item.src, caption: typeof item.caption === "string" ? item.caption : "" }]
      : [],
  );
}
