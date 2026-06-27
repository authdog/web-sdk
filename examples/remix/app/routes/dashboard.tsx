import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { identityLoader } from "@authdog/remix-node";
import { Layout } from "~/components/Layout";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard - Authdog Remix Demo" },
    { name: "description", content: "Authenticated-only dashboard" },
  ];
};

// Variant example: a server-protected route.
//
// `identityLoader()` resolves the session on the server and returns a JSON
// Response. Here we go one step further than the profile route and *redirect*
// anonymous visitors away. The gate runs on the server before any HTML is
// sent, so it cannot be skipped by the client. (Real data access must still be
// authorized per-request — this only controls page rendering.)
export const loader = async (args: LoaderFunctionArgs) => {
  const response = await identityLoader()(args);

  // Inspect the resolved session without consuming the original Response, so
  // its Set-Cookie / cache headers are preserved when we hand it back.
  const { user } = (await (response as Response).clone().json()) as {
    user: unknown;
  };

  if (!user) {
    throw redirect("/");
  }

  return response;
};

export default function Dashboard() {
  const { user } = useLoaderData<{
    user: { displayName?: string; userName?: string };
  }>();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-4">
          Welcome back, {user?.displayName ?? user?.userName ?? "there"} 👋
        </h1>
        <p>
          This route is rendered only for authenticated users. The redirect
          happens server-side in the loader, before any markup is sent.
        </p>
      </div>
    </Layout>
  );
}
