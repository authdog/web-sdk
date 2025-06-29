import {
  type MetaFunction,
} from "@remix-run/node";
import { PlaceholderAlert } from "@authdog/react-elements";
import { Layout } from "~/components/Layout";
import { identityLoader } from "@authdog/remix-node";

export const meta: MetaFunction = () => {
  return [
    { title: "Authdog - Remix Demo" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

// Loader function
export const loader = identityLoader();

export default function Index() {
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
