'use client';

import { getPublicKeyPayload } from "@authdog/nextjs-app/client";
import { Navbar } from "@authdog/react-elements";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function ClientNavbarComponent() {
  const router = useRouter();
  const publicKey = process.env.NEXT_PUBLIC_PK_AUTHDOG as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey) {
      throw new Error("Public key is not set");
    }

    try {
      const payload = getPublicKeyPayload(publicKey);
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
      logoText={"ACME Corp"}
      items={[]}
      user={{
        name: "Sarah Johnson",
        email: "sarah@acme.com",
        image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      }}
      onNavigateHome={() => router.push("/")}
      onProfileSelected={() => router.push("/profile")}
      onLogout={() => console.log("Logging out...")}
    />
  );
}

// Export a client-only version of the component
export const ClientNavbar = ClientNavbarComponent; 