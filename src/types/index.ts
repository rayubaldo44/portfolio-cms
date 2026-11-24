import type { SectionVisibilitySettings } from "@/lib/section-visibility";
import type { AvailabilityStatus } from "@/lib/availability";

export type SkillCategory =
  | "frontend"
  | "backend"
  | "tools"
  | "ai_ml";

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  imageUrl: string | null;
  imageData: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  tags: string[];
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  description: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string | null;
  order: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  category: string | null;
  date: Date;
  url: string | null;
  imageUrl: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteSettings extends SectionVisibilitySettings {
  id: string;
  bio: string | null;
  email: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  availabilityStatus: AvailabilityStatus;
}

export type { AvailabilityStatus } from "@/lib/availability";
