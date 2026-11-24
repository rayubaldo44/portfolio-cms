// Requires Node.js 22.15+ for synchronous module hooks.
// Run: node --import tsx scripts/check-visibility.mjs
// Mock only external boundaries: database, authentication and Next cache invalidation.
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
async function main() {
    let authed = true;
    let writes = 0;
    let failRead = false;
    let failWrite = false;
    let queried = [];
    const invalidated = [];
    let settings = null;
    Object.assign(globalThis, {
        visibilityAuth: () => { if (!authed)
            throw new Error("Unauthorized"); },
        visibilityRevalidate: (path) => invalidated.push(path),
        prisma: {
            siteSettings: {
                findUnique: async () => { if (failRead)
                    throw new Error("Unavailable"); return settings; },
                upsert: async ({ create, update }) => {
                    if (failWrite)
                        throw new Error("Unavailable");
                    writes++;
                    settings = settings ? { ...settings, ...update } : create;
                    return settings;
                },
            },
            ...Object.fromEntries(["project", "experience", "skill", "certification"].map((name) => [name, {
                    findMany: async () => {
                        queried.push(name);
                        if (name === "project")
                            return [{ title: "Secret project", slug: "secret", tags: "[]", description: "Project details", updatedAt: new Date() }];
                        if (name === "experience")
                            return [{ role: "Secret role", company: "Secret company", startDate: new Date(), endDate: null, current: true }];
                        if (name === "skill")
                            return [{ name: "Secret skill", category: "frontend" }];
                        return [{ name: "Secret certificate", issuer: "Issuer", date: new Date() }];
                    },
                    findUnique: async () => { queried.push(name); return null; },
                }])),
        },
    });
    registerHooks({ resolve(specifier, context, nextResolve) {
            const source = specifier === "server-only" ? "module.exports = {};"
                : specifier === "@/lib/auth" ? "exports.requireAuth = async () => globalThis.visibilityAuth();"
                    : specifier === "next/cache" ? "exports.revalidatePath = path => globalThis.visibilityRevalidate(path);"
                        : null;
            return source === null ? nextResolve(specifier, context) : { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
        }, load(url, context, nextLoad) {
            if (url.startsWith("data:text/javascript,"))
                return { format: "commonjs", source: decodeURIComponent(url.slice("data:text/javascript,".length)), shortCircuit: true };
            return nextLoad(url, context);
        } });
    const { SECTION_OPTIONS, DEFAULT_SECTION_VISIBILITY, HIDDEN_SECTION_VISIBILITY, getSectionVisibility } = await import("../src/lib/section-visibility");
    const { getPublicSectionVisibility, requireVisibleSection } = await import("../src/lib/section-visibility-server");
    const { updateSectionVisibility } = await import("../src/app/(admin)/admin/settings/actions");
    const { buildPortfolioContext } = await import("../src/lib/portfolio-context");
    const { default: sitemap } = await import("../src/app/sitemap");
    assert.equal(SECTION_OPTIONS.length, 6);
    assert.deepEqual(getSectionVisibility(null), DEFAULT_SECTION_VISIBILITY);
    assert.deepEqual(await getPublicSectionVisibility(), DEFAULT_SECTION_VISIBILITY);
    failRead = true;
    assert.deepEqual(await getPublicSectionVisibility(), HIDDEN_SECTION_VISIBILITY);
    failRead = false;
    const form = (enabled) => {
        const data = new FormData();
        for (const section of SECTION_OPTIONS)
            data.set(section.field, String(enabled));
        return data;
    };
    settings = { id: "singleton", bio: "Secret biography", availabilityStatus: "AVAILABLE", email: "contact@example.com", ...Object.fromEntries(SECTION_OPTIONS.map(s => [s.field, true])) };
    assert.ok((await updateSectionVisibility({}, form(false))).success);
    assert.equal(settings.email, "contact@example.com");
    assert.equal(settings.availabilityStatus, "AVAILABLE");
    assert.deepEqual(getSectionVisibility(settings), HIDDEN_SECTION_VISIBILITY);
    assert.ok(invalidated.includes("/(public)"));
    assert.ok(invalidated.includes("/sitemap.xml"));
    assert.ok(invalidated.includes("/admin/settings"));
    for (const section of SECTION_OPTIONS) {
        settings[section.field] = false;
        await assert.rejects(requireVisibleSection(section.key), /404/);
        settings[section.field] = true;
        await requireVisibleSection(section.key);
        settings[section.field] = false;
    }
    queried = [];
    const hiddenContext = await buildPortfolioContext();
    assert.ok(!hiddenContext.includes("Secret"));
    assert.ok(hiddenContext.includes("contact@example.com"));
    assert.ok(hiddenContext.includes("Availability"));
    assert.deepEqual(queried, []);
    const hiddenSitemap = await sitemap();
    assert.equal(hiddenSitemap.length, 3); // Home, Privacy and Resources.
    assert.ok(!hiddenSitemap.some(e => e.url.includes("secret")));
    assert.deepEqual(queried, []);
    const pages = ["about", "projects", "experience", "stack", "certifications"];
    for (const page of pages) {
        const { default: render } = await import(`../src/app/(public)/${page}/page`);
        await assert.rejects(render(), /404/);
    }
    const details = await import("../src/app/(public)/projects/[slug]/page");
    const params = Promise.resolve({ slug: "secret" });
    await assert.rejects(details.default({ params }), /404/);
    const metadata = await details.generateMetadata({ params });
    assert.deepEqual(metadata.robots, { index: false, follow: false });
    assert.deepEqual(queried, []);
    // Invalid or incomplete submissions cannot silently change saved flags.
    const savedWrites = writes;
    const invalid = form(true);
    invalid.set("showProjects", "yes");
    assert.ok((await updateSectionVisibility({}, invalid)).error);
    assert.ok((await updateSectionVisibility({}, new FormData())).error);
    assert.equal(writes, savedWrites);
    authed = false;
    await assert.rejects(updateSectionVisibility({}, form(true)), /Unauthorized/);
    assert.equal(writes, savedWrites);
    authed = true;
    failWrite = true;
    assert.ok((await updateSectionVisibility({}, form(true))).error);
    assert.equal(writes, savedWrites);
    failWrite = false;
    await updateSectionVisibility({}, form(true));
    const visibleContext = await buildPortfolioContext();
    for (const text of ["Secret biography", "Secret project", "Secret role", "Secret skill", "Secret certificate"])
        assert.ok(visibleContext.includes(text), text);
    assert.equal((await sitemap()).length, 9);
    settings = null;
    await updateSectionVisibility({}, form(false));
    assert.equal(settings.id, "singleton");
    assert.deepEqual(await getPublicSectionVisibility(), HIDDEN_SECTION_VISIBILITY);
    console.log("Visibility checks passed: defaults, failure policy, save/auth/validation, route guards, sitemap, assistant filtering and restoration.");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
