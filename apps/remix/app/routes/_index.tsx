import {
  json,
  type LoaderFunction,
  type MetaFunction,
  type LinksFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import React from "react";
import styles from "@authdog/react-elements/styles.css?url";
import { UserProfile } from "@authdog/react-elements";

// Metadata function
export const meta: MetaFunction = () => {
  return [
    { title: "Authdog - Remix Demo" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Links function to load styles
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

// Create a client-only component for the Navbar
const ClientNavbar = React.lazy(() => 
  import("@authdog/react-elements").then(mod => ({ 
    default: mod.Navbar 
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

// Loader function
export const loader: LoaderFunction = async ({ context, request }) =>
  await remixAuthLoader({
    request,
    context,
    params: {
      publicKey: process.env.PK_AUTHDOG,
    },
  });

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <ClientOnly>
      <React.Suspense fallback={<div>Loading...</div>}>
        <ClientNavbar
          logoText="Acme Inc"
          items={[
            // { title: "Home", href: "/" },
            // { title: "Features", href: "/features" },
            // { title: "Pricing", href: "/pricing" },
            // { title: "About", href: "/about" },
          ]}
          user={{
            name: "Sarah Johnson",
            email: "sarah@acme.com",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
          }}
          onLogout={() => console.log("Logging out...")}
        />
        <UserProfile
          user={{
            name: "Jaylon Dias",
            email: "example@authdog.dev",
            image: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
          }}
        />
      </React.Suspense>
      {/* <div className="flex h-screen items-center justify-center">
        {JSON.stringify(data)}
      </div> */}
    </ClientOnly>
  );
}
