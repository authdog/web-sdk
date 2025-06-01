import {
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import React from "react";

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

export default function Index() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome to Authdog Remix Demo</h1>
    </div>
  );
}
