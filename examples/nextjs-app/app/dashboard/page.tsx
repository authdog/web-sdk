"use client";

import { useUser } from "@authdog/nextjs-app";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Variant example: a client-gated "dashboard" page.
//
// This complements `app/profile/page.tsx` by showing how to keep an
// authenticated-only screen out of an anonymous user's way. Note this is a
// *presentational* gate only — it redirects the browser for UX, but the real
// protection for any data this page renders must be enforced by the API/server
// that serves it.
export default function Dashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">Loading…</div>
    );
  }

  if (!user) {
    return null;
  }

  const u = user as { displayName?: string; userName?: string };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">
        Welcome back, {u.displayName ?? u.userName ?? "there"} 👋
      </h1>
      <p className="text-muted-foreground">
        This dashboard is only rendered for authenticated users. Open it while
        signed out and you&apos;ll be redirected home.
      </p>
    </div>
  );
}
