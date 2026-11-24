import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "portfolio_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

async function getSecret(): Promise<CryptoKey> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set. Add it to .env.local");
  }
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signToken(payload: string): Promise<string> {
  const key = await getSecret();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  const sigHex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${payload}.${sigHex}`;
}

async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sigHex] = parts as [string, string];

  const providedSig = Buffer.from(sigHex, "hex");
  if (providedSig.length !== 32) return false;

  try {
    const key = await getSecret();
    const encoder = new TextEncoder();
    return await crypto.subtle.verify(
      "HMAC",
      key,
      providedSig,
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  const payload = JSON.stringify({
    user: "admin",
    exp: Date.now() + SESSION_DURATION * 1000,
  });
  const token = await signToken(payload);
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const isAuthenticated = cache(
  async (): Promise<boolean> => {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE);
    if (!token) return false;

    const valid = await verifyToken(token.value);
    if (!valid) return false;

    try {
      const payload = JSON.parse(token.value.split(".")[0] as string) as {
        exp?: number;
      };
      if (!payload.exp || payload.exp < Date.now()) return false;
    } catch {
      return false;
    }

    return true;
  },
);

export async function requireAuth(): Promise<void> {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin-login");
  }
}
