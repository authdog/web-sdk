"use client";

import { useUser } from "@authdog/nextjs-app";
import {
  clearAuthdogSession,
  getPublicKeyPayload,
} from "@authdog/nextjs-app/client";
import { Navbar } from "@authdog/react-elements";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function ClientNavbarComponent() {
  const router = useRouter();
  const publicKey = process.env.NEXT_PUBLIC_PK_AUTHDOG as string;
  const [mounted, setMounted] = useState(false);

  const { user, isLoading } = useUser();

  const payload = useMemo(() => {
    if (!publicKey) {
      throw new Error("Public key is not set");
    }
    return getPublicKeyPayload(publicKey);
  }, [publicKey]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Navbar
      key={user?.id}
      logoText={"ACME Corp"}
      items={[]}
      isLoading={isLoading}
      user={user as any}
      environmentId={payload.environmentId}
      identityHost={payload.identityHost}
      onNavigateHome={() => router.push("/")}
      onProfileSelected={() => router.push("/profile")}
      onLogout={() => {
        clearAuthdogSession();
        location.reload();
      }}
    />
  );
}

// Export a client-only version of the component
export const ClientNavbar = ClientNavbarComponent;
