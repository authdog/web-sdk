import {
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import React from "react";

// Create a client-only component for the UserProfile
const ClientUserProfile = React.lazy(() => 
  import("@authdog/react-elements").then(mod => ({ 
    default: mod.UserProfile 
  }))
);

// Create a client-only wrapper component
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
export const loader: LoaderFunction = async ({ context, request }) =>
  await remixAuthLoader({
    request,
    context,
    params: {
      publicKey: process.env.PK_AUTHDOG,
    },
  });

export default function Profile() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <ClientOnly>
        <React.Suspense fallback={<div>Loading profile...</div>}>
          <ClientUserProfile
            user={{
              name: "Sarah Johnson",
              email: "sarah@acme.com",
              image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
            }}
          />
        </React.Suspense>
      </ClientOnly>
    </div>
  );
}
