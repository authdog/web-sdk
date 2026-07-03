import React, { useEffect, useState } from "react";

const publicKey = process.env.REDWOOD_ENV_AUTHDOG_PUBLIC_KEY ?? "";

const signinUri = (() => {
  try {
    if (!publicKey.startsWith("pk_")) return "#";
    const payload = JSON.parse(
      Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
    );
    return `${payload.identityHost}/signin/${payload.environmentId}`;
  } catch {
    return "#";
  }
})();

const HomePage = () => {
  const [user, setUser] = useState<unknown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Call the authenticated `me` Redwood function.
    fetch("/.redwood/functions/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: 48 }}>
      <h1>Authdog × RedwoodJS</h1>
      {loading ? (
        <p>Loading…</p>
      ) : user ? (
        <>
          <p>You are signed in.</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <a href="/.redwood/functions/logout">Sign out</a>
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

export default HomePage;
