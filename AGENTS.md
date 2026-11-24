<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Projects section

- The projects section may feature a maximum of 3 projects. Keep `take: 3` and `featured: true` in the `db.project.findMany` query in `src/components/sections/projects.tsx`.
- Project cards are horizontally stacked in a single row of 3. Use an equal-width column layout on desktop (`grid-cols-3` / `md:grid-cols-3`).
- Cards must stay equal size at all times: equal widths via equal-width columns and equal heights via the `h-full` chain (`RevealItem` → `TiltCard` → `Link` → `Card`). Never give individual cards different heights or widths.

## Stack section

- The stack section may feature exactly 4 categories: Frontend, Backend, Dev Tools, AI & Machine Learning. Keep only these categories — `frontend`, `backend`, `tools`, `ai_ml` — in the `SkillCategory` type in `src/types/index.ts`, `CATEGORY_LABELS`/`CATEGORY_ORDER` in `src/components/sections/stack.tsx`, `CATEGORY_OPTIONS` in `src/components/admin/skill-form.tsx`, and `categoryLabels` in `src/app/(admin)/admin/stack/page.tsx`.
- Display order is fixed: Frontend, Backend, AI & Machine Learning, Dev Tools. Do not sort by skill count.
- Stack cards sit in an equal 2x2 grid on desktop (`md:grid-cols-2`). No card may span the full row and no card may be styled as a hero — all 4 cards are identical in width and height (via the `h-full` chain `RevealItem` → `TiltCard`) with `variant="outline"` badges.
