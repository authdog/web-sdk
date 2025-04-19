import {
  json,
  type LoaderFunction,
  type MetaFunction,
  // createCookie,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import { useEffect } from "react";

// Metadata function
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Loader function
export const loader: LoaderFunction = async ({ context, request }) => await remixAuthLoader({
  request,
  context,
  params: {
    publicKey: process.env.PK_AUTHDOG,
  },
})

const Index = () => {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex h-screen items-center justify-center">
      {JSON.stringify(data)}
    </div>
  );
};

export default Index;
