"use client";
import { useUser } from "@/lib/utils";
import { getPublicKeyPayload } from "@authdog/nextjs-app/client";
import { UserProfile} from "@authdog/react-elements"
import "@authdog/react-elements/styles.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {

  const publicKey = process.env.NEXT_PUBLIC_PK_AUTHDOG as string;

  const { user, isLoading } = useUser();
  // const [payload, setPayload] = useState<ReturnType<typeof getPublicKeyPayload> | null>(null);

  useEffect(() => {
    if (!publicKey) {
      throw new Error("Public key is not set");
    }

  }, [publicKey]);

  const router = useRouter();

  return (
      <>
       <UserProfile
          loading={isLoading}
          user={user as any}
          handleAuthenticated={() => {
            if (user === null) {
              router.push('/');
            }
          }}
        />
      </>

  );
}
