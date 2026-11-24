# Release verification

Verified locally on 2026-11-24 using Node.js 22.23.1, npm 10.9.8, PostgreSQL 17 in a disposable container, Next.js 16.3.4, and Chromium through Playwright. No production database or third-party account credentials were used.

Passed:

- Clean `npm ci`, including the Prisma generation install hook, using the documented environment configuration.
- Fresh PostgreSQL schema creation and repeated sample seeding. Checks verified three featured projects, four skill categories, no duplicate samples, preservation of edited sample content, and preservation of unrelated records.
- ESLint, TypeScript, all seven focused check scripts, and a production build.
- Production HTTP checks for public pages, sample project detail, sitemap, robots, social image, placeholders, anonymous admin redirects, and disabled chat.
- Browser checks for sample images, no résumé download, clear unavailable chat state, no external integration requests by default, and no Spotify polling when unconfigured.
- Equal-size three-column project cards and four-card stack layout on desktop; no horizontal overflow on representative pages at 390px and 768px widths.
- Browser admin login, authenticated project import, edit, delete, and signed-out import-page protection. Focused checks verify every CMS mutation rejects anonymous callers.
- Read-only independent review of setup, licensing, sanitization, seeding, authentication, optional integrations, and CI, with identified issues corrected.
- Gitleaks 8.30.1 scan of the prepared release: no secrets detected. Manual inspection excluded personal photos, résumé, local credentials, old development documents, and original Git history.

Regression checks were observed failing before the import-auth and unconfigured-GitHub fixes. Browser verification also caught unconfigured Spotify polling; its configuration guard was verified after the fix.

The GitHub Actions workflow is prepared but has not run on GitHub yet. Real Gemini responses, GitHub-token data, Spotify OAuth/playback, hosting-provider configuration, and production deployment were not verified. The automated checks and secret scan do not guarantee absence of all bugs or sensitive material; review your own changes before publishing.
