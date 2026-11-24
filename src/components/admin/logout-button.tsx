/**
 * Section: Admin | Type: Client | Deps: Button, auth API
 */
"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogOut() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={loading}
      className="w-full justify-start"
    >
      <SignOut size={16} />
      Sign out
    </Button>
  );
}
