# Security reporting

Do not publish credentials, private data, or exploit details in a public issue.

After this repository is published, use GitHub's private vulnerability reporting: the repository's Security tab → Report a vulnerability. The maintainer must enable private reporting in repository settings before publication. If the option is unavailable, request a private contact channel in a public issue without disclosing the vulnerability.

Include affected routes, reproduction steps using sample data, expected behavior, and impact. Do not test against the author's live portfolio or anyone else's deployment without authorization. There is no guaranteed response time or paid bounty.

This is a single-owner CMS. It uses a configured admin password, signed HTTP-only session cookies, and per-process rate limiting. Counters are not shared across serverless instances. Deployers who need stronger abuse protection must configure it at their hosting boundary or use shared counters. Keep dependencies current and generate unique admin credentials per deployment.
