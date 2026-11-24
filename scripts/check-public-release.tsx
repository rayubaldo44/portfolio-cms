// Run with npm test, which loads the Next.js module shims.
import assert from "node:assert/strict";

function mockModule(path: string, exports: object) {
  const id = require.resolve(path);
  require.cache[id] = { id, filename: id, loaded: true, exports } as NodeModule;
}

async function main() {
  let signedIn = false;
  const writes: object[] = [];
  let transactions = 0;
  const tx = {
    project: {
      findUnique: async () => null,
      upsert: async (data: object) => { writes.push(data); },
    },
  };
  Object.assign(globalThis, {
    prisma: { $transaction: async (work: (value: typeof tx) => Promise<void>) => {
      transactions++;
      return work(tx);
    } },
  });
  mockModule("../src/lib/auth", { requireAuth: async () => {
    if (!signedIn) throw new Error("UNAUTHORIZED");
  } });
  mockModule("next/cache", { revalidatePath: () => {} });
  const { importProjects } = await import("../src/app/(admin)/admin/projects/import-actions");
  const form = new FormData();
  form.set("projects", JSON.stringify([{ title: "Sample", slug: "sample", description: "A sample project" }]));
  await assert.rejects(importProjects({}, form), /UNAUTHORIZED/);
  assert.equal(transactions, 0, "Anonymous requests must not access the database");
  assert.equal(writes.length, 0);
  // Each exported CMS action must reject before reading input or touching data.
  const mutationModules = await Promise.all([
    import("../src/app/(admin)/admin/projects/actions"),
    import("../src/app/(admin)/admin/experience/actions"),
    import("../src/app/(admin)/admin/stack/actions"),
    import("../src/app/(admin)/admin/certifications/actions"),
    import("../src/app/(admin)/admin/resources/actions"),
    import("../src/app/(admin)/admin/settings/actions"),
  ]);
  for (const actions of mutationModules) {
    for (const [name, action] of Object.entries(actions)) {
      if (typeof action !== "function") continue;
      await assert.rejects((action as (...args: unknown[]) => Promise<unknown>)({}, form), /UNAUTHORIZED/, `${name} must require authentication`);
    }
  }
  signedIn = true;
  assert.deepEqual((await importProjects({}, form)).summary, { created: 1, updated: 0, skipped: 0, failed: 0 });
  assert.equal(writes.length, 1);
  form.set("projects", "invalid");
  assert.match((await importProjects({}, form)).error ?? "", /Invalid JSON/);
  assert.equal(writes.length, 1, "Invalid input must not mutate records");

  delete process.env.GITHUB_USERNAME;
  delete process.env.GITHUB_TOKEN;
  const originalFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests++; throw new Error("Unexpected outbound request"); };
  try {
    const { GitHubContributions } = await import("../src/components/sections/github-contributions");
    assert.equal(await GitHubContributions(), null);
    assert.equal(requests, 0, "Unset username must not fetch any account's activity");
    delete process.env.SPOTIFY_CLIENT_ID;
    delete process.env.SPOTIFY_CLIENT_SECRET;
    delete process.env.SPOTIFY_REFRESH_TOKEN;
    const { getSpotifyNowPlaying } = await import("../src/lib/spotify");
    assert.equal(await getSpotifyNowPlaying(), null);
    assert.equal(requests, 0, "Unset Spotify credentials must not call Spotify");
  } finally { globalThis.fetch = originalFetch; }
  delete process.env.GEMINI_API_KEY;
  const { POST } = await import("../src/app/api/chat/route");
  const response = await POST(new Request("http://localhost/api/chat", { method: "POST" }));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "Chat is not configured yet." });
  console.log("Public release checks passed: import authorization/validation and absent GitHub, Spotify, Gemini credentials.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
