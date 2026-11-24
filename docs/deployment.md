# Deploying your own edition

Use a Node.js host with PostgreSQL. The current code includes Vercel-compatible routing and headers, but does not require Vercel. No deployment is created by this repository.

1. Provision your own PostgreSQL database. Use a pooled `DATABASE_URL` and direct `DIRECT_URL` if your provider supplies both.
2. Add the five required variables from `.env.example` to the hosting environment **before dependency installation**, because `npm ci` runs Prisma generation. Use unique admin credentials, your own HTTPS `SITE_URL`, and separate databases/secrets for preview and production.
3. Apply the reviewed schema with `npm run db:push` from a trusted environment connected to the intended database. Do not add schema pushes to every application startup. Existing databases need a backup and a review of any destructive schema change.
4. Optionally run `npm run db:seed` once on a new demo database. Omit it if you want to create real content directly through the dashboard. It inserts missing samples but never clears or overwrites existing rows.
5. Run `npm ci`, `npm run build`, and `npm run start` as appropriate for the hosting platform. Use Node.js 22.15+ within Node 22. Build-time network access to Google Fonts is required.
6. Verify public pages, `/admin-login`, anonymous admin redirects, signed-in edits, `/sitemap.xml`, `/robots.txt`, and `/opengraph-image`. Review canonical URLs and fictional content before sharing.
7. Configure optional integrations only after the core site works. Register your exact Spotify callback, inspect GitHub token-backed output for private metadata, and use your own API quota for chat.

The included CI uses an ephemeral database. It does not deploy or hold production credentials. On GitHub, enable private vulnerability reporting, dependency alerts, secret scanning, and push protection where available for the repository.

Before publishing this source edition, inspect the first commit, screenshots, assets, and workflow files. Set the repository description to “A Next.js developer portfolio with a PostgreSQL-backed CMS and optional AI integrations.” Suggested topics: `portfolio`, `nextjs`, `react`, `typescript`, `prisma`, `postgresql`, `cms`. Add your live personalized portfolio as its website and pin the repository to your profile. No automatic synchronization with a personalized private deployment is configured.
