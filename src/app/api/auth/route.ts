import { NextResponse } from "next/server";
import { createSession, destroySession } from "@/lib/auth";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validations";

const LOGIN_WINDOW_MS = 60_000;
const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_LOCKOUT_MS = 15 * 60_000;

const loginLimiter = createRateLimiter({
  windowMs: LOGIN_WINDOW_MS,
  max: LOGIN_MAX_ATTEMPTS,
  lockoutMs: LOGIN_LOCKOUT_MS,
});

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const limit = loginLimiter.isLimited(ip);
  if (limit.limited) {
    return NextResponse.json(
      {
        error:
          "Too many login attempts. Try again in a few minutes.",
        retryAfter: limit.retryAfterSeconds,
      },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin password is not configured" },
      { status: 500 },
    );
  }

  if (parsed.data.password !== adminPassword) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 },
    );
  }

  loginLimiter.reset(ip);
  await createSession();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ success: true });
}