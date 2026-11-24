import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env.local", quiet: true });
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  // Stable identities and empty updates preserve edits and unrelated records.
  await db.$transaction(async (tx) => {
    await tx.siteSettings.upsert({
      where: { id: "singleton" }, update: {},
      create: {
        id: "singleton",
        bio: "Hi, I'm Alex Morgan, a fictional developer used to demonstrate this portfolio CMS.\n\nAll projects, experience, and credentials shown here are illustrative examples. Replace this sample content before publishing your own portfolio.",
        email: "alex@example.com", availabilityStatus: "AVAILABLE",
      },
    });
    const projects = [
      { slug: "sample-portfolio-cms", title: "Sample Portfolio CMS", description: "An illustrative case study for a portfolio with an admin dashboard.", tags: ["Next.js", "Prisma", "PostgreSQL"] },
      { slug: "sample-team-planner", title: "Sample Team Planner", description: "A fictional planning tool used to demonstrate project descriptions and tags.", tags: ["React", "TypeScript"] },
      { slug: "sample-knowledge-search", title: "Sample Knowledge Search", description: "A fictional AI search interface used as an example project, not a shipped product.", tags: ["AI", "TypeScript"] },
    ];
    for (const [order, project] of projects.entries()) {
      await tx.project.upsert({
        where: { slug: project.slug }, update: {},
        create: {
          ...project, tags: JSON.stringify(project.tags), featured: true, order,
          content: "This is fictional sample content. Describe the real problem, your contribution, implementation choices, and evidence of results when replacing this case study.",
        },
      });
    }
    await tx.experience.upsert({
      where: { id: "sample-experience" }, update: {},
      create: {
        id: "sample-experience", company: "Example Studio (fictional)", role: "Sample Developer Role",
        description: "Illustrative experience only. Replace with an accurate account of your work and responsibilities.",
        location: "Remote", startDate: new Date("2025-01-01T00:00:00Z"), current: true,
      },
    });
    const skills = [
      ["React", "frontend"], ["Next.js", "frontend"], ["TypeScript", "frontend"],
      ["PostgreSQL", "backend"], ["Prisma", "backend"],
      ["Gemini", "ai_ml"], ["AI SDK", "ai_ml"],
      ["Git", "tools"], ["Docker", "tools"],
    ];
    for (const [order, [name, category]] of skills.entries()) {
      await tx.skill.upsert({ where: { name }, update: {}, create: { name, category, order } });
    }
    await tx.certification.upsert({
      where: { id: "sample-certification" }, update: {},
      create: {
        id: "sample-certification", name: "Sample Learning Certificate (fictional)",
        issuer: "Example Academy (fictional)", category: "software_development", date: new Date("2025-06-01T00:00:00Z"),
      },
    });
    await tx.resource.upsert({
      where: { id: "sample-resource" }, update: {},
      create: {
        id: "sample-resource", title: "Next.js documentation", url: "https://nextjs.org/docs",
        description: "Official framework documentation.", category: "frontend",
      },
    });
  });
  console.log("Sample seed complete. Existing records and edits were preserved.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
