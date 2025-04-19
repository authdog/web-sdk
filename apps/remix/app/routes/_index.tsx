import {
  json,
  type LoaderFunction,
  type MetaFunction,
  // createCookie,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";

// Metadata function
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Loader function
export const loader: LoaderFunction = remixAuthLoader;

const Index = () => {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex h-screen items-center justify-center">
      {JSON.stringify(data)}
    </div>
  );
};

export default Index;
