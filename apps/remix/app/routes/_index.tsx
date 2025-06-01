import {
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import { PlaceholderAlert } from "@authdog/react-elements";

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
     <PlaceholderAlert
        title="Welcome to Authdog remix demo"
        description="This application demonstrates how to use Authdog with Remix.js. You can explore the features and functionalities provided by Authdog for authentication and user management."
      />
  );
}
