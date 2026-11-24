import type { Metadata } from "next";

export const siteOrigin = new URL(
  process.env.SITE_URL || "http://localhost:3000",
).origin;

export const siteDescription =
  "Full-stack developer portfolio. Projects, experience, and technical stack.";

export function publicMetadata(
  path: string,
  title: string,
  description = siteDescription,
): Metadata {
  const socialTitle = path === "/" ? title : `${title} - Alex Morgan`;
  const images = [{
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "Alex Morgan builds useful AI products.",
  }];

  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Alex Morgan",
      title: socialTitle,
      description,
      url: path,
      images,
    },
    twitter: { card: "summary_large_image", title: socialTitle, description, images },
  };
}
