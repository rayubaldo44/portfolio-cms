/**
 * Page: Admin Login | Type: Client | Deps: Button, Input, auth API
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INTERNAL_ROUTES = [
  "/dashboard",
  "/admin/projects",
  "/admin/experience",
  "/admin/stack",
  "/admin/certifications",
  "/admin/settings",
  "/admin/resources",
  "/api/spotify/authorize",
] as const;

function safeRedirectPath(raw: string | null): string {
  return (
    INTERNAL_ROUTES as readonly string[]
  ).includes(raw ?? "")
    ? (raw as string)
    : "/dashboard";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = safeRedirectPath(searchParams.get("from"));
  const isSpotifySetup = from === "/api/spotify/authorize";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Login failed");
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
          {isSpotifySetup ? "Connect Spotify" : "Admin Login"}
        </h1>
        {isSpotifySetup && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sign in to continue to Spotify authorization.
          </p>
        )}
      </div>
      <Input
        type="password"
        name="password"
        label="Password"
        autoFocus
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error ?? undefined}
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
