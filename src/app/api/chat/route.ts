/**
 * Chat API | Type: Server (Node) | Deps: ai, @ai-sdk/google, buildPortfolioContext
 *
 * Streams Gemini responses grounded in the live CMS contents. No RAG:
 * the full portfolio context is injected into the system prompt per request,
 * so admin edits are reflected instantly.
 *
 * Free-tier only: the model is resolved from the FREE_MODELS allowlist below
 * (env override via GEMINI_MODEL is clamped to this list), and on a 429
 * rate-limit or 404 unavailable-model error the request retries on the next
 * free model before failing.
 */
import { createGoogle } from "@ai-sdk/google";
import {
  APICallError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { buildPortfolioContext } from "@/lib/portfolio-context";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export const maxDuration = 30;

const CHAT_BURST_WINDOW_MS = 60_000;
const CHAT_BURST_MAX = 5;
const CHAT_BURST_LOCKOUT_MS = 60_000;
const CHAT_SUSTAINED_WINDOW_MS = 15 * 60_000;
const CHAT_SUSTAINED_MAX = 20;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_REQUEST_BYTES = 32_000;

const chatBurstLimiter = createRateLimiter({
  windowMs: CHAT_BURST_WINDOW_MS,
  max: CHAT_BURST_MAX,
  lockoutMs: CHAT_BURST_LOCKOUT_MS,
});

const chatSustainedLimiter = createRateLimiter({
  windowMs: CHAT_SUSTAINED_WINDOW_MS,
  max: CHAT_SUSTAINED_MAX,
});

const FREE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
] as const;

const DEFAULT_MODEL = "gemini-3.5-flash-lite";
const provider = createGoogle({ apiKey: process.env.GEMINI_API_KEY });
const HISTORY_LIMIT = 10;

function sanitizeMessages(rawMessages: unknown): UIMessage[] | null {
  if (!Array.isArray(rawMessages)) return null;

  const recent = (rawMessages as unknown[])
    .filter((m): m is UIMessage => Boolean(m) && typeof m === "object")
    .slice(-HISTORY_LIMIT);

  for (const message of recent) {
    if (!Array.isArray(message.parts)) return null;
    for (const part of message.parts) {
      if (
        (part as { type?: string }).type === "text" &&
        "text" in part &&
        (part as { text: string }).text.length > MAX_MESSAGE_LENGTH
      ) {
        return null;
      }
    }
  }

  return recent;
}

function resolveModel(): string {
  const candidate = process.env.GEMINI_MODEL;
  return (FREE_MODELS as readonly string[]).includes(candidate ?? "")
    ? (candidate as string)
    : DEFAULT_MODEL;
}

function nextFreeModel(current: string): string | undefined {
  const index = FREE_MODELS.indexOf(current as (typeof FREE_MODELS)[number]);
  return index >= 0 ? FREE_MODELS[index + 1] : undefined;
}

function isRetryableModelError(error: unknown): boolean {
  return (
    error instanceof APICallError &&
    (error.statusCode === 429 ||
      (error.statusCode === 404 &&
        typeof error.message === "string" &&
        /model.*(no longer available|not found|unavailable)/i.test(
          error.message,
        )))
  );
}

async function generateResponse(
  recentMessages: UIMessage[],
  instructions: string,
) {
  let model = resolveModel();
  let lastError: unknown;

  for (let attempt = 0; attempt < FREE_MODELS.length; attempt++) {
    try {
      return streamText({
        model: provider(model),
        instructions,
        messages: await convertToModelMessages(recentMessages),
      });
    } catch (error) {
      if (!isRetryableModelError(error)) throw error;
      lastError = error;
      const fallback = nextFreeModel(model);
      if (!fallback) break;
      model = fallback;
    }
  }

  if (lastError instanceof APICallError) throw lastError;
  throw new Error("No free Gemini model available.");
}

function buildInstructions(context: string): string {
  return [
    "You are the portfolio assistant for Alex Morgan, a full-stack developer. Be a friendly, concise concierge for visitors.",
    "Answer ONLY from the PORTFOLIO CONTEXT below. Never invent projects, skills, experience, or facts that are not present in it.",
    "If the answer is not in the context, say you don't have that information yet and suggest asking about projects, skills, experience, or contact details.",
    "Refer to the example owner as Alex, using a first-person-owner tone when writing about the portfolio (e.g. 'Alex built...').",
    "Keep replies short and scannable (2-6 sentences). Use plain text; no markdown headings or bullet spam.",
    "When relevant, surface contact links from the context (GitHub, LinkedIn, email, etc.).",
    "Politely decline off-topic, harmful, or personal questions and steer back to the portfolio.",
    "",
    "===== PORTFOLIO CONTEXT =====",
    context,
    "===== END OF PORTFOLIO CONTEXT =====",
  ].join("\n");
}

function rateLimitResponse(retryAfterSeconds: number) {
  return new Response(
    `Too many messages. Try again in ${retryAfterSeconds} seconds.`,
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(retryAfterSeconds),
      },
    },
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Chat is not configured yet." },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return new Response("Message request is too large.", { status: 413 });
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return new Response("Content-Type must be application/json.", {
      status: 415,
    });
  }

  const clientIp = getClientIp(request);
  const burstLimit = chatBurstLimiter.isLimited(clientIp);
  if (burstLimit.limited) {
    return rateLimitResponse(burstLimit.retryAfterSeconds ?? 60);
  }

  const sustainedLimit = chatSustainedLimiter.isLimited(clientIp);
  if (sustainedLimit.limited) {
    return rateLimitResponse(sustainedLimit.retryAfterSeconds ?? 60);
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
    return new Response("Message request is too large.", { status: 413 });
  }

  let body: unknown = null;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON request.", { status: 400 });
  }

  const recentMessages = sanitizeMessages(
    (body as { messages?: unknown } | null)?.messages,
  );
  if (!recentMessages || recentMessages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  const context = await buildPortfolioContext();

  const result = await generateResponse(
    recentMessages,
    buildInstructions(context),
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => "An unexpected error occurred.",
    }),
  });
}
