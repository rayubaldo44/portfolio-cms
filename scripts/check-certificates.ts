import assert from "node:assert/strict";
import { certificationSchema } from "../src/lib/validations";
import { MAX_CERTIFICATE_BYTES, certificateFileError, certificateSignatureMatches } from "../src/lib/certificate-file";
import { certificationFilters } from "../src/lib/certification-categories";

const certification = { name: "Incident Response", issuer: "DSS", date: "2026-11-13" };
assert.equal(certificationSchema.safeParse({ ...certification, imageUrl: "javascript:alert(1)" }).success, false);
assert.equal(certificationSchema.safeParse({ ...certification, imageUrl: "https://example.com/certificate.png" }).success, true);
assert.equal(certificationSchema.safeParse(certification).success, true);
assert.equal(certificationSchema.safeParse({ ...certification, category: "unknown" }).success, false);
for (const category of ["cybersecurity", "system_design", "software_development", "cloud_devops", "ai_ml"]) {
  const parsed = certificationSchema.parse({ ...certification, category });
  assert.equal(parsed.category, category);
}
assert.equal(certificationSchema.parse({ ...certification, category: "" }).category, null);
assert.equal(certificationSchema.parse(certification).category, null);
assert.deepEqual(certificationFilters(["cybersecurity", "ai_ml", null]), []);
assert.deepEqual(certificationFilters(Array(6).fill("cybersecurity")), []);
assert.deepEqual(certificationFilters(["cybersecurity", "cybersecurity", "cybersecurity", "ai_ml", "ai_ml", null]).map((filter) => filter.value), ["cybersecurity", "ai_ml", "uncategorized"]);
const signatures: Record<string, number[]> = {
  "image/png": [137, 80, 78, 71, 13, 10, 26, 10],
  "image/jpeg": [255, 216, 255],
  "image/webp": [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80],
  "image/gif": [71, 73, 70, 56, 57, 97],
  "application/pdf": [37, 80, 68, 70, 45],
};
for (const [type, signature] of Object.entries(signatures)) {
  assert.equal(certificateFileError({ type, size: 100 }), null);
  assert.equal(certificateSignatureMatches(Uint8Array.from(signature), type), true);
  assert.equal(certificateSignatureMatches(new TextEncoder().encode("<html>fake file</html>"), type), false);
  assert.equal(certificateSignatureMatches(new Uint8Array(), type), false);
}
assert.match(certificateFileError({ type: "image/svg+xml", size: 100 })!, /Choose/);
assert.match(certificateFileError({ type: "text/html", size: 100 })!, /Choose/);
assert.match(certificateFileError({ type: "application/pdf", size: 0 })!, /empty/);
assert.match(certificateFileError({ type: "application/pdf", size: MAX_CERTIFICATE_BYTES + 1 })!, /too large/);
assert.equal(certificateFileError({ type: "application/pdf", size: MAX_CERTIFICATE_BYTES }), null);
console.log("Certificate validation checks passed: allowed formats, signatures, empty/oversized files, and URLs.");
