// Against a running, seeded instance; never submits credentials or writes data.
import assert from "node:assert/strict";
const origin = process.env.SITE_URL || "http://localhost:3000";
for (const path of ["/", "/about", "/projects", "/projects/sample-portfolio-cms", "/experience", "/stack", "/certifications", "/resources", "/privacy", "/admin-login", "/sitemap.xml", "/robots.txt", "/opengraph-image", "/images/portrait.svg", "/images/landscape.svg"]) {
  const response = await fetch(new URL(path, origin));
  assert.equal(response.status, 200, `${path} must load`);
}
for (const path of ["/dashboard", "/admin/projects", "/admin/projects/import"]) {
  const response = await fetch(new URL(path, origin), { redirect: "manual" });
  assert.ok([303, 307, 308].includes(response.status), `${path} must redirect anonymous visitors`);
  assert.ok(response.headers.get("location")?.includes("/admin-login"));
}
if (!process.env.GEMINI_API_KEY) {
  assert.equal((await fetch(new URL("/api/chat", origin), { method: "POST" })).status, 503);
}
console.log("HTTP checks passed: public pages/assets/metadata, admin redirects, optional chat.");
