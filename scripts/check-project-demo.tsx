// Run with: node --import tsx scripts/check-project-demo.tsx
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

function mockModule(path: string, exports: object) {
  const id = require.resolve(path);
  require.cache[id] = { id, filename: id, loaded: true, exports } as NodeModule;
}

async function main() {
  const saves: { liveUrl: string | null; githubUrl: string | null; screenshots?: { src: string; caption: string }[] }[] = [];
  let publicLiveUrl: string | null = null;
  Object.assign(globalThis, {
    prisma: {
      project: {
        create: async ({ data }: { data: typeof saves[number] }) => { saves.push(data); },
        update: async ({ data }: { data: typeof saves[number] }) => { saves.push(data); },
        findUnique: async () => ({
          title: "Example", slug: "example", description: "Example project",
          content: null, imageUrl: null, imageData: null, tags: "[]",
          liveUrl: publicLiveUrl, githubUrl: "https://github.com/example/project",
        }),
      },
    },
  });
  mockModule("../src/lib/auth", { requireAuth: async () => ({}) });
  mockModule("../src/lib/section-visibility-server", { requireVisibleSection: async () => {} });
  mockModule("next/cache", { revalidatePath: () => {} });
  mockModule("../src/components/project-image", { ProjectImage: () => null });
  mockModule("next/navigation", {
    redirect: () => { throw new Error("TEST_REDIRECT"); },
    notFound: () => { throw new Error("Unexpected missing project"); },
  });

  const { createProject, updateProject } = await import("../src/app/(admin)/admin/projects/actions");
  for (const action of [createProject, updateProject]) {
    const form = new FormData();
    for (const [key, value] of Object.entries({
      id: "example", title: "Example", slug: "example", description: "Example project",
      githubUrl: "https://github.com/example/project", liveUrl: "https://example.com",
    })) form.set(key, value);

    // Off ignores stale URL values and persists an offline project.
    await assert.rejects(action({}, form), /TEST_REDIRECT/);
    assert.equal(saves.at(-1)?.liveUrl, null);
    assert.equal(saves.at(-1)?.githubUrl, "https://github.com/example/project");

    form.set("hasLiveDemo", "on");
    await assert.rejects(action({}, form), /TEST_REDIRECT/);
    assert.equal(saves.at(-1)?.liveUrl, "https://example.com");

    const saveCount = saves.length;
    form.set("liveUrl", " ");
    assert.match((await action({}, form)).error ?? "", /Live URL is required/);
    form.set("liveUrl", "invalid-url");
    assert.ok((await action({}, form)).error);
    assert.equal(saves.length, saveCount, "Invalid live URLs must never be saved");

    form.delete("hasLiveDemo");
    const screenshots = [{ src: "https://example.com/dashboard.png", caption: "Dashboard" }, { src: "https://example.com/mobile.png", caption: "Mobile" }];
    form.set("screenshots", JSON.stringify(screenshots));
    await assert.rejects(action({}, form), /TEST_REDIRECT/);
    assert.deepEqual(saves.at(-1)?.screenshots, screenshots, "Save ordered screenshots and captions");
    for (const invalid of ["broken-json", "null", JSON.stringify([{ src: "javascript:alert(1)" }])]) {
      const count = saves.length;
      form.set("screenshots", invalid);
      assert.ok((await action({}, form)).error);
      assert.equal(saves.length, count, "Invalid screenshots never reach persistence");
    }
    form.set("screenshots", "[]");
    await assert.rejects(action({}, form), /TEST_REDIRECT/);
    assert.deepEqual(saves.at(-1)?.screenshots, [], "Removing every screenshot persists an empty gallery");
    form.delete("screenshots");
    await assert.rejects(action({}, form), /TEST_REDIRECT/);
    assert.equal(saves.at(-1)?.screenshots, undefined, "Older forms preserve the gallery");
  }

  const { default: ProjectDetailPage } = await import("../src/app/(public)/projects/[slug]/page");
  const offline = renderToStaticMarkup(await ProjectDetailPage({ params: Promise.resolve({ slug: "example" }), searchParams: Promise.resolve({}) }));
  assert.match(offline, /<span[^>]*>Offline Demo only<\/span>/);
  assert.ok(!offline.includes("Visit live site"));
  assert.match(offline, /View source/);

  publicLiveUrl = "https://example.com";
  const live = renderToStaticMarkup(await ProjectDetailPage({ params: Promise.resolve({ slug: "example" }), searchParams: Promise.resolve({}) }));
  assert.match(live, /href="https:\/\/example.com"/);
  assert.match(live, /Visit live site/);
  assert.ok(!live.includes("Offline Demo only"));
  console.log("Project demo checks passed: create/update on/off, URL validation, offline label, live link, independent source link.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
