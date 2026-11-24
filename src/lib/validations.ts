import { z } from "zod";
import { AVAILABILITY_VALUES } from "@/lib/availability";
import { CERTIFICATION_CATEGORIES } from "@/lib/certification-categories";
import { MAX_PROJECT_SCREENSHOTS, MAX_PROJECT_IMAGE_CHARACTERS } from "@/lib/project-screenshots";

export const MAX_IMAGE_DATA_BYTES = 1.5 * 1024 * 1024;

const imageDataSchema = z
  .string()
  .regex(
    /^data:image\/(png|jpe?g|webp|gif);base64,/,
    "Image must be a valid data URL",
  )
  .refine((value) => {
    const base64 = value.slice(value.indexOf(",") + 1);
    return Buffer.byteLength(base64, "base64") <= MAX_IMAGE_DATA_BYTES;
  }, "Image too large (max 1.5MB).");

export const projectImageDataSchema = imageDataSchema.optional().or(z.literal(""));

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().min(1, "Description is required").max(500),
  content: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageData: projectImageDataSchema,
  screenshots: z.array(z.object({
    src: z.union([
      z.string().url().regex(/^https?:\/\//i, "Use an http or https screenshot URL"),
      imageDataSchema,
    ]),
    caption: z.string().trim().max(200, "Screenshot captions must be 200 characters or fewer.").default(""),
  })).max(MAX_PROJECT_SCREENSHOTS, "Add up to 8 screenshots.").optional(),
  liveUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
}).refine((data) =>
  (data.imageData?.length ?? 0) + (data.screenshots ?? []).reduce((total, image) => total + image.src.length, 0) <= MAX_PROJECT_IMAGE_CHARACTERS,
  "Project images are too large together. Use fewer or smaller screenshots (3MB total).",
);

export const projectCreateSchema = projectSchema;
export const projectUpdateSchema = projectSchema;

export const experienceSchema = z.object({
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  current: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
}).refine(
  ({ startDate, endDate, current }) =>
    current || !endDate || endDate >= startDate,
  { message: "End date must be on or after the start date.", path: ["endDate"] },
);

export const experienceCreateSchema = experienceSchema;
export const experienceUpdateSchema = experienceSchema;

export const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.enum(["frontend", "backend", "tools", "ai_ml"]),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

export const skillCreateSchema = skillSchema;
export const skillUpdateSchema = skillSchema;

export const certificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  issuer: z.string().min(1, "Issuer is required").max(100),
  category: z.enum(CERTIFICATION_CATEGORIES.map((option) => option.value))
    .nullish().or(z.literal("")).transform((value) => value || null),
  date: z.coerce.date(),
  url: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().regex(/^https?:\/\//i, "Use an http or https image URL").optional().or(z.literal("")),
  order: z.number().int().min(0).default(0),
});

export const certificationCreateSchema = certificationSchema;
export const certificationUpdateSchema = certificationSchema;

export const availabilitySchema = z.object({
  availabilityStatus: z.enum(AVAILABILITY_VALUES),
});

export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const sectionVisibilitySchema = z.object({
  showProjects: z.boolean(),
  showExperience: z.boolean(),
  showStack: z.boolean(),
  showAbout: z.boolean(),
  showCertifications: z.boolean(),
  showGithubContributions: z.boolean(),
});

export const resourceSchema = z.object({
  title: z.string().trim().min(1, "Resource title is required").max(180),
  url: z.string().trim().url("Enter a valid resource URL").max(2048).refine(
    value => /^https?:\/\//i.test(value),
    "Resource links must use http or https",
  ),
  description: z.string().trim().max(1000).optional(),
  category: z.enum(["frontend", "backend", "ai_ml", "tools"]),
  order: z.number().int().min(0).default(0),
});
