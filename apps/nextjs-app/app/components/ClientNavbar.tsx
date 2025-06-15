'use client';

import { useUser } from "@/lib/utils";
import { getPublicKeyPayload } from "@authdog/nextjs-app/client";
import { Navbar } from "@authdog/react-elements";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ClientNavbarComponent() {
  const router = useRouter();
  const publicKey = process.env.NEXT_PUBLIC_PK_AUTHDOG as string;
  const [mounted, setMounted] = useState(false);

  const { user, isLoading } = useUser();
  const [payload, setPayload] = useState<ReturnType<typeof getPublicKeyPayload> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);


  useEffect(() => {
    if (!publicKey) {
      throw new Error("Public key is not set");
    }

    try {
      setPayload(getPublicKeyPayload(publicKey));
      console.log(payload);
    } catch (error) {
      console.error('Error getting public key payload:', error);
    }
  }, [publicKey]);

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
      onNavigateHome={() => router.push("/")}
      onProfileSelected={() => router.push("/profile")}
      onLogout={() => {
        localStorage.removeItem("token");
        location.reload();
      }}
      {...(payload && {
        environmentId: payload.environmentId,
        identityHost: payload.identityHost,
      })}
    />
  );
}

// Export a client-only version of the component
export const ClientNavbar = ClientNavbarComponent; 