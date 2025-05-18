import {
  json,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import { Navbar, Button } from "@authdog/react-elements";

// Metadata function
export const meta: MetaFunction = () => {
  return [
    { title: "Authdog - Remix Demo" },
    { name: "description", content: "Welcome to Remix!" },
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

const Index = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <>
          <Navbar
        logoText="Acme Inc"
        items={[
          { title: "Home", href: "/" },
          { title: "Features", href: "/features" },
          { title: "Pricing", href: "/pricing" },
          { title: "About", href: "/about" },
        ]}
        user={{
          name: "Sarah Johnson",
          email: "sarah@acme.com",
          image: "/placeholder.svg?height=32&width=32",
        }}
        onLogout={() => console.log("Logging out...")}
      >
        <Button variant="ghost" size="sm">
          Docs
        </Button>
        <Button size="sm">Get Started</Button>
      </Navbar>
          <div className="flex h-screen items-center justify-center">

      {JSON.stringify(data)}
    </div>
    </>

  );
};

export default Index;
