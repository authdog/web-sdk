import React, { useEffect, useState } from "react";
import type { HeadFC, PageProps } from "gatsby";

const publicKey = process.env.GATSBY_AUTHDOG_PUBLIC_KEY ?? "";

const IndexPage: React.FC<PageProps> = () => {
  const [user, setUser] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ask our authenticated Gatsby Function who the current user is.
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  let signinUri = "#";
  try {
    if (publicKey.startsWith("pk_")) {
      const payload = JSON.parse(
        Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
      );
      signinUri = `${payload.identityHost}/signin/${payload.environmentId}`;
    }
  } catch {
    // Leave signinUri as-is when the key is absent/invalid.
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: 48 }}>
      <h1>Authdog × Gatsby</h1>
      {loading ? (
        <p>Loading…</p>
      ) : user ? (
        <>
          <p>You are signed in.</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <a href="/api/logout">Sign out</a>
        </>
      ) : (
        <>
          <p>You are not signed in.</p>
          <a href={signinUri}>Sign in</a>
        </>
      )}
    </main>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Authdog Gatsby Example</title>;
