"use client";

import { PlaceholderAlert } from "@authdog/react-elements";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-screen">
      <PlaceholderAlert
        title="Welcome to Authdog nextjs demo"
        description="This application demonstrates how to use Authdog with Next.js. You can explore the features and functionalities provided by Authdog for authentication and user management."
      />
    </div>
  );
}
