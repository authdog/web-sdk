"use client";
import { useUser } from "@/lib/utils";
import { UserProfile} from "@authdog/react-elements"
import "@authdog/react-elements/styles.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
  const { user, isLoading } = useUser();
  const publicKey = process.env.NEXT_PUBLIC_PK_AUTHDOG as string;

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
