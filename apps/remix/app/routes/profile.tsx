import { type MetaFunction, useLoaderData } from "react-router";
import { identityLoader } from "@authdog/remix-node";
import React from "react";
import { Layout } from "~/components/Layout";
import { ClientOnly } from "@authdog/react-elements";

const ClientUserProfile = React.lazy(() =>
  import("@authdog/react-elements").then((mod) => ({
    default: mod.UserProfile,
  })),
);

export const meta: MetaFunction = () => {
  return [
    { title: "Profile - Authdog Remix Demo" },
    { name: "description", content: "User Profile Page" },
  ];
};

export const loader = identityLoader();

export default function Profile() {
  const { user } = useLoaderData<{
    user: any;
    isAuthenticated: boolean;
    signinUri: string;
  }>();

  return (
    <Layout>
      <ClientOnly>
        <React.Suspense fallback={<div>Loading profile...</div>}>
          <ClientUserProfile user={user} loading={false} />
        </React.Suspense>
      </ClientOnly>
    </Layout>
  );
}
