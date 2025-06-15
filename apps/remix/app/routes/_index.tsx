import {
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { remixAuthLoader } from "@authdog/remix-node";
import { Navbar, PlaceholderAlert } from "@authdog/react-elements";
import { Layout } from "~/components/Layout";

// Metadata function
export const meta: MetaFunction = () => {
  return [
    { title: "Authdog - Remix Demo" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Loader function
export const loader: LoaderFunction = async ({ context, request }) => {
  return await remixAuthLoader({
    request,
    context,
    params: {
      publicKey: process.env.PK_AUTHDOG,
    },
  });
};

export default function Index() {
  const {user, isLoading, environmentId, identityHost} = useLoaderData<typeof loader>();
  return (
    <Layout>


    <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-screen">
     <PlaceholderAlert
        title="Welcome to Authdog remix demo"
        description="This application demonstrates how to use Authdog with Remix.js. You can explore the features and functionalities provided by Authdog for authentication and user management."
      />
    </div>
    </Layout>
  );
}
