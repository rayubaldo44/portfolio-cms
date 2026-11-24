/**
 * Section: Hero-extras | Type: Server | Deps: GITHUB_TOKEN (optional)
 * Renders a GitHub-style contribution heatmap for the last year.
 * Primary source: GitHub GraphQL API (exact counts + private repos when a
 * GITHUB_TOKEN with `repo` scope is set). Falls back to scraping the public
 * contributions page when no token is configured.
 */
import type { CSSProperties } from "react";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/reveal";
import { Cascade } from "@/components/motion/cascade";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME?.trim() ?? "";
const GITHUB_API = "https://api.github.com/graphql";
const CONTRIBUTIONS_URL = `https://github.com/users/${GITHUB_USERNAME}/contributions`;

const GITHUB_QUERY = `query {
  user(login: "${GITHUB_USERNAME}") {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

const LEVELS: Record<string, string> = {
  "0": "bg-gray-200 dark:bg-gray-800",
  "1": "bg-gray-300 dark:bg-gray-700",
  "2": "bg-gray-400 dark:bg-gray-600",
  "3": "bg-gray-600 dark:bg-gray-400",
  "4": "bg-gray-800 dark:bg-gray-200",
};

const DAY_LABELS: Record<number, string> = {
  2: "Mon",
  4: "Wed",
  6: "Fri",
};

const LEGEND_COLORS = ["0", "1", "2", "3", "4"];
const GUTTER = 28;
const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubData {
  days: ContributionDay[];
  totalContributions: number;
}

function levelToBucket(level: string | undefined, count: number): number {
  switch (level) {
    case "FIRST_QUARTILE":
      return 1;
    case "SECOND_QUARTILE":
      return 2;
    case "THIRD_QUARTILE":
      return 3;
    case "FOURTH_QUARTILE":
      return 4;
    default:
      return count === 0 ? 0 : Math.min(count, 4);
  }
}

async function fetchApiData(): Promise<GitHubData | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let json: {
    errors?: Array<unknown>;
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions?: number;
            weeks?: Array<{
              contributionDays?: Array<{
                date: string;
                contributionCount: number;
                contributionLevel?: string;
              }>;
            }>;
          };
        };
      };
    };
  };
  try {
    const res = await fetch(GITHUB_API, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ query: GITHUB_QUERY }),
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    json = await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (json?.errors || !json?.data?.user) return null;

  const calendar = json.data.user.contributionsCollection?.contributionCalendar;
  const days: ContributionDay[] =
    calendar?.weeks?.flatMap((week) =>
      (week.contributionDays ?? []).map((day) => ({
        date: day.date,
        count: day.contributionCount ?? 0,
        level: levelToBucket(day.contributionLevel, day.contributionCount ?? 0),
      })),
    ) ?? [];

  return {
    days,
    totalContributions: calendar?.totalContributions ?? 0,
  };
}

async function fetchScrapedLevels(): Promise<Map<string, string>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(CONTRIBUTIONS_URL, {
      headers: { accept: "text/html" },
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    if (!res.ok) return new Map();

    const html = await res.text();
    const levels = new Map<string, string>();
    const rectRe =
      /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
    let match: RegExpExecArray | null;
    while ((match = rectRe.exec(html)) !== null) {
      levels.set(match[1], match[2]);
    }
    return levels;
  } catch {
    return new Map();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchFallbackData(): Promise<GitHubData> {
  const levels = await fetchScrapedLevels();
  const days: ContributionDay[] = [];
  let totalContributions = 0;
  for (const [date, rawLevel] of levels) {
    const level = Number(rawLevel);
    days.push({ date, count: level, level });
    if (level > 0) totalContributions++;
  }
  return { days, totalContributions };
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export async function GitHubContributions() {
  if (!GITHUB_USERNAME) return null;
  const data: GitHubData = (await fetchApiData()) ?? (await fetchFallbackData());

  if (data.days.length === 0) return null;

  const lookup = new Map(data.days.map((day) => [day.date, day]));

  const today = new Date();
  const lastDateTs = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const firstDateTs = lastDateTs - 364 * 24 * 60 * 60 * 1000;
  const firstDate = new Date(firstDateTs).toISOString().slice(0, 10);
  const lastDate = today.toISOString().slice(0, 10);

  const firstCol = Math.floor(firstDateTs / (7 * 24 * 60 * 60 * 1000));
  const numWeeks =
    Math.floor((lastDateTs - firstDateTs) / (7 * 24 * 60 * 60 * 1000)) + 1;

  const cells = [];
  const monthStartCol: Record<string, number> = {};
  for (let col = 1; col <= numWeeks; col++) {
    for (let row = 1; row <= 7; row++) {
      const ts = ((firstCol + col - 1) * 7 + (row - 1)) * 86400000;
      const d = new Date(ts);
      const yyyy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      const date = `${yyyy}-${mm}-${dd}`;
      if (date < firstDate || date > lastDate) continue;
      const day = lookup.get(date);
      const level = day?.level ?? 0;
      const count = day?.count ?? 0;
      const monthKey = `${yyyy}-${mm}`;
      if (monthStartCol[monthKey] === undefined) monthStartCol[monthKey] = col;
      cells.push({ date, count, level, col, row });
    }
  }

  const monthLabels = Object.entries(monthStartCol)
    .sort((a, b) => a[1] - b[1])
    .map(([key, col]) => {
      const month = parseInt(key.slice(5, 7), 10) - 1;
      return { label: MONTH_ABBR[month], col };
    });

  return (
    <section id="github-contributions" className="pb-20 md:pb-28">
      <Reveal>
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03),0_8px_24px_-12px_rgba(0,0,0,0.08)] ring-1 ring-gray-950/[0.02] dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_1px_0_rgba(255,255,255,0.03),0_8px_32px_-12px_rgba(0,0,0,0.5)] dark:ring-white/[0.02]">
        <div className="mb-4 flex items-center justify-between">
          <div className="type-ui type-numeric flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <GithubLogo size={18} weight="fill" className="text-accent" />
            {plural(data.totalContributions, "contribution")} in the last year
          </div>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="type-ui text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            @{GITHUB_USERNAME}
          </a>
        </div>

        <div className="overflow-x-auto">
          <div className="w-full">
            <Cascade
              className="grid w-full auto-rows-[10px] gap-[3px]"
              style={{
                gridTemplateColumns: `${GUTTER}px repeat(${numWeeks}, minmax(10px, 1fr))`,
              }}
            >
              {monthLabels.map((m) => (
                <span
                  key={`${m.label}-${m.col}`}
                  className="text-[10px] leading-[10px] text-gray-400 dark:text-gray-500"
                  style={{ gridColumn: m.col + 1, gridRow: 1 }}
                >
                  {m.label}
                </span>
              ))}
              {Array.from({ length: 7 }, (_, i) => i + 1).map((row) =>
                DAY_LABELS[row as keyof typeof DAY_LABELS] ? (
                  <span
                    key={row}
                    className="pr-1 text-right text-[10px] leading-[10px] text-gray-400 dark:text-gray-500"
                    style={{ gridColumn: 1, gridRow: row + 1 }}
                  >
                    {DAY_LABELS[row]}
                  </span>
                ) : null,
              )}
              {cells.map((cell, i) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count === 0 ? "No contributions" : plural(cell.count, "contribution")}`}
                  style={
                    {
                      gridColumn: cell.col + 1,
                      gridRow: cell.row + 1,
                      "--pop-delay": `${Math.min(i, 200) * 4}ms`,
                    } as CSSProperties
                  }
                  className={`cascade-pop h-[10px] w-full rounded-[2px] ${LEVELS[cell.level] ?? LEVELS["0"]}`}
                />
              ))}
            </Cascade>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <a
            href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile#why-are-my-contributions-not-showing-up-on-my-profile"
            target="_blank"
            rel="noopener noreferrer"
            className="type-meta text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
          >
            Learn how we count contributions
          </a>
          <div className="type-meta flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span>Less</span>
            {LEGEND_COLORS.map((level) => (
              <div
                key={level}
                className={`h-[10px] w-[10px] rounded-[2px] ${LEVELS[level]}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
        </div>
      </Reveal>
    </section>
  );
}
