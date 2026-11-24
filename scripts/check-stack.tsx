// Run with: npx tsx scripts/check-stack.tsx
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { Skill } from "../src/types";

async function main() {
  let skills: Skill[] = Array.from({ length: 20 }, (_, order) => ({
    id: String(order),
    name: `Frontend-${order}`,
    category: "frontend",
    icon: null,
    order,
  }));
  skills.push({ id: "backend", name: "Backend skill", category: "backend", icon: null, order: 10 });
  let unavailable = false;

  // Keep this check isolated from the real database.
  Object.assign(globalThis, {
    prisma: {
      skill: {
        findMany: async () => {
          if (unavailable) throw new Error("Database unavailable");
          return skills;
        },
      },
    },
  });

  const { StackSection } = await import("../src/components/sections/stack");
  const home = renderToStaticMarkup(await StackSection());
  assert.match(home, /id="stack-heading">Stack<\/h2>/);
  assert.match(home, /View all/);
  assert.match(home, /border-dashed/);
  assert.match(home, /\+ more/);
  assert.match(home, /href="\/stack"/);
  assert.match(home, /Frontend-17/);
  assert.ok(!home.includes("Frontend-18"));
  assert.ok(!home.includes("<h3"));

  const full = renderToStaticMarkup(await StackSection({ standalone: true }));
  const titles = [...full.matchAll(/<h3[^>]*>(.*?)<\/h3>/g)].map((match) => match[1]);
  assert.deepEqual(titles, ["Frontend", "Backend", "AI &amp; Machine Learning", "Dev Tools"]);
  assert.match(full, /20 skills/);
  assert.match(full, /1 skill</);
  assert.match(full, /Frontend-19/);
  assert.ok(!full.includes("+ more"));
  assert.equal(full.split("No skills listed in this category.").length - 1, 2);

  skills = skills.slice(0, 3);
  assert.match(renderToStaticMarkup(await StackSection()), /tabindex="-1" aria-label="View more technologies"/);

  skills = [
    ...skills,
    ...Array.from({ length: 12 }, (_, order): Skill => ({
      id: `extra-${order}`,
      name: `Other-${order}`,
      category: "frontend",
      icon: null,
      order: order + 3,
    })),
    { id: "python", name: "Python", category: "backend", icon: null, order: 30 },
    { id: "react", name: "React", category: "frontend", icon: null, order: 31 },
    { id: "rag", name: "RAG", category: "ai_ml", icon: null, order: 32 },
  ];
  const prioritized = renderToStaticMarkup(await StackSection());
  assert.ok(prioritized.indexOf(">React<") < prioritized.indexOf(">Python<"));
  assert.ok(prioritized.indexOf(">Python<") < prioritized.indexOf(">RAG<"));
  assert.match(prioritized, />RAG</);
  assert.ok(!prioritized.includes(">Docker<"), "Never invent skills absent from the CMS");

  skills = [];
  assert.match(renderToStaticMarkup(await StackSection()), /No skills listed yet\./);
  unavailable = true;
  assert.match(renderToStaticMarkup(await StackSection()), /Stack unavailable right now\./);
  console.log("Stack checks passed: compact preview, overflow link, full category view, empty and unavailable states.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
