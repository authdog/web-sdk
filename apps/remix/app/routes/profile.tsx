import {
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import React from "react";
import { Layout } from "~/components/Layout";

const ClientUserProfile = React.lazy(() => 
  import("@authdog/react-elements").then(mod => ({ 
    default: mod.UserProfile 
  }))
);

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

// Metadata function
export const meta: MetaFunction = () => {
  return [
    { title: "Profile - Authdog Remix Demo" },
    { name: "description", content: "User Profile Page" },
  ];
};

// Loader function
export const loader = async ({ context, request }: any) =>
  await remixAuthLoader({
    request,
    context,
    params: {
      publicKey: process.env.PK_AUTHDOG,
    },
  });

export default function Profile() {

  const { user } = useLoaderData<typeof loader>();
  
  return (
    <Layout>
      <ClientOnly>
        <React.Suspense fallback={<div>Loading profile...</div>}>
          <ClientUserProfile
            user={user}
            loading={false}
          />
        </React.Suspense>
      </ClientOnly>
    </Layout>
  );
}
