// Integration check: run only against a disposable database, after db:push.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { config as loadEnv } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

loadEnv({ path: ".env.local", quiet: true });
if (process.env.SEED_TEST_DATABASE !== "disposable") throw new Error("Set SEED_TEST_DATABASE=disposable only for a disposable database");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
function seed() {
  const result = spawnSync(process.execPath, ["--import", "tsx", "prisma/seed.ts"], { stdio: "inherit" });
  assert.equal(result.status, 0, "Sample seed must succeed");
}
async function main() {
  seed();
  assert.equal(await db.project.count({ where: { featured: true } }), 3);
  assert.deepEqual((await db.skill.findMany({ distinct: ["category"], select: { category: true } })).map(s => s.category).sort(), ["ai_ml", "backend", "frontend", "tools"]);
  const counts = await Promise.all([db.project.count(), db.experience.count(), db.certification.count(), db.skill.count(), db.resource.count()]);
  seed();
  assert.deepEqual(await Promise.all([db.project.count(), db.experience.count(), db.certification.count(), db.skill.count(), db.resource.count()]), counts);
  await db.project.update({ where: { slug: "sample-portfolio-cms" }, data: { title: "My edited title" } });
  await db.experience.create({ data: { id: "seed-check-custom", company: "My company", role: "My role", startDate: new Date("2024-01-01T00:00:00Z") } });
  try {
    seed();
    assert.equal((await db.project.findUniqueOrThrow({ where: { slug: "sample-portfolio-cms" } })).title, "My edited title");
    assert.equal((await db.experience.findUniqueOrThrow({ where: { id: "seed-check-custom" } })).company, "My company");
  } finally {
    await db.project.update({ where: { slug: "sample-portfolio-cms" }, data: { title: "Sample Portfolio CMS" } });
    await db.experience.delete({ where: { id: "seed-check-custom" } });
  }
  console.log("Seed integration passed: three featured projects, four categories, repeatable inserts, preserved edits and unrelated records.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
