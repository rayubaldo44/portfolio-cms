import assert from "node:assert/strict";
import { projectSchema } from "../src/lib/validations";

const base = { title: "Example", slug: "example", description: "Example project" };
const screenshots = [{ src: "https://example.com/dashboard.png", caption: "Dashboard" }, { src: "data:image/webp;base64,UklGRg==", caption: "Mobile" }];
const valid = projectSchema.parse({ ...base, screenshots });
assert.deepEqual(valid.screenshots, screenshots, "Ordered screenshots and captions survive validation");
assert.equal(projectSchema.safeParse({ ...base, screenshots: [{ src: "javascript:alert(1)" }] }).success, false);
assert.equal(projectSchema.safeParse({ ...base, screenshots: [{ src: "data:text/html;base64,WA==" }] }).success, false);
assert.equal(projectSchema.safeParse({ ...base, screenshots: [{ src: "https://example.com/a.png", caption: "x".repeat(201) }] }).success, false);
assert.equal(projectSchema.safeParse({ ...base, screenshots: Array.from({ length: 9 }, () => screenshots[0]) }).success, false);
assert.equal(projectSchema.safeParse({ ...base, screenshots: [{ src: `data:image/webp;base64,${"A".repeat(3 * 1024 * 1024)}` }] }).success, false);
assert.equal(projectSchema.parse(base).screenshots, undefined, "Omitted galleries remain omitted for legacy updates");
assert.deepEqual(projectSchema.parse({ ...base, screenshots: [] }).screenshots, [], "Empty galleries explicitly clear screenshots");
console.log("Screenshot validation passed: ordered data, URLs, captions, count/size limits and legacy omission.");
