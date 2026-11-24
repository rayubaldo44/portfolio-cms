import { spawnSync } from "node:child_process";

const checks = [
  "check-visibility.mjs", "check-resources.mjs", "check-stack.tsx",
  "check-project-demo.tsx", "check-project-screenshots.ts", "check-certificates.ts",
  "check-public-release.tsx",
];
for (const check of checks) {
  const result = spawnSync(process.execPath, ["--import", "./scripts/test-runtime.mjs", "--import", "tsx", `scripts/${check}`], { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
