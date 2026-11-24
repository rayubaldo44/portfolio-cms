// Run: node --import tsx scripts/check-resources.mjs (Node.js 22.15+).
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";

async function main() {
  const { resourceSchema } = await import("../src/lib/validations");
  assert.ok(resourceSchema, "Resources validation must be implemented");
  const valid = { title: "Learning reference", url: "https://example.com/learn", category: "frontend", description: "What I learned", order: 0 };
  assert.equal(resourceSchema.safeParse(valid).success, true);
  for (const url of ["javascript:alert(1)", "data:text/html,test", "ftp://example.com", "not a url"]) {
    assert.equal(resourceSchema.safeParse({ ...valid, url }).success, false);
  }
  assert.equal(resourceSchema.safeParse({ ...valid, title: " " }).success, false);
  assert.equal(resourceSchema.safeParse({ ...valid, category: "unknown" }).success, false);
  assert.equal(resourceSchema.safeParse({ ...valid, order: -1 }).success, false);

  let authed = true, failRead = false, failWrite = false;
  let rows = [], writes = 0;
  const invalidated = [];
  Object.assign(globalThis, {
    resourcesAuth: () => { if (!authed) throw new Error("Unauthorized"); },
    resourcesRevalidate: path => invalidated.push(path),
    prisma: { resource: {
      findMany: async () => { if (failRead) throw new Error("Unavailable"); return rows; },
      create: async ({ data }) => { if (failWrite) throw new Error("Unavailable"); writes++; rows.push({ id: "resource-1", ...data }); },
      update: async ({ where, data }) => { if (failWrite) throw new Error("Unavailable"); writes++; rows = rows.map(row => row.id === where.id ? { ...row, ...data } : row); },
      delete: async ({ where }) => { writes++; rows = rows.filter(row => row.id !== where.id); },
    } },
  });
  registerHooks({
    resolve(specifier, context, next) {
      const source = specifier === "@/lib/auth" ? "exports.requireAuth=async()=>globalThis.resourcesAuth();"
        : specifier === "next/cache" ? "exports.revalidatePath=path=>globalThis.resourcesRevalidate(path);"
        : specifier === "next/navigation" ? "exports.redirect=path=>{throw new Error('Redirect:'+path)};"
        : null;
      return source === null ? next(specifier, context) : { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
    },
    load(url, context, next) {
      if (url.startsWith("data:text/javascript,")) return { format: "commonjs", source: decodeURIComponent(url.slice("data:text/javascript,".length)), shortCircuit: true };
      return next(url, context);
    },
  });
  const { default: Page } = await import("../src/app/(public)/resources/page");
  const { createResource, updateResource, deleteResource } = await import("../src/app/(admin)/admin/resources/actions");
  const form = data => { const result = new FormData(); for (const [key, value] of Object.entries(data)) result.set(key, String(value)); return result; };
  assert.match(renderToStaticMarkup(await Page()), /resources.*soon/i);
  failRead = true;
  assert.match(renderToStaticMarkup(await Page()), /unavailable/i);
  failRead = false;
  authed = false;
  await assert.rejects(createResource({}, form(valid)), /Unauthorized/);
  await assert.rejects(updateResource({}, form({ id: "resource-1", ...valid })), /Unauthorized/);
  await assert.rejects(deleteResource(form({ id: "resource-1" })), /Unauthorized/);
  assert.equal(writes, 0);
  authed = true;
  assert.ok((await createResource({}, form({ ...valid, url: "javascript:alert(1)" }))).error);
  assert.equal(writes, 0);
  failWrite = true;
  assert.ok((await createResource({}, form(valid))).error);
  failWrite = false;
  await assert.rejects(createResource({}, form(valid)), /Redirect:\/admin\/resources/);
  let html = renderToStaticMarkup(await Page());
  assert.match(html, /Learning reference/);
  assert.match(html, /What I learned/);
  assert.match(html, /href="https:\/\/example.com\/learn"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.match(html, /Frontend/);
  await assert.rejects(updateResource({}, form({ id: "resource-1", ...valid, title: "Updated reference", category: "ai_ml" })), /Redirect:\/admin\/resources/);
  html = renderToStaticMarkup(await Page());
  assert.match(html, /Updated reference/);
  assert.match(html, /AI &amp; Machine Learning/);
  assert.ok(!html.includes("Learning reference"));
  await deleteResource(form({ id: "resource-1" }));
  assert.equal(rows.length, 0);
  assert.ok(invalidated.includes("/resources"));
  assert.ok(invalidated.includes("/admin/resources"));
  assert.ok(!invalidated.includes("/"), "Resource edits must not introduce homepage content");
  console.log("Resources checks passed: URL validation, empty/unavailable states, safe links, categories, authenticated create/update/delete and revalidation.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
