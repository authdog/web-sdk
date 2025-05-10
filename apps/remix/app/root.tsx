import {
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, ActionFunction, LoaderFunction } from "@remix-run/node";
import { ReloadPage } from "~/components/ReloadPage";
import { Navbar } from "@authdog/react-elements";
import { remixAuthLoader } from "@authdog/remix-node";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <AuthdogProvider>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <ReloadPage />
        </body>
      </AuthdogProvider>
    </html>
  );
}

const App = () => {
  return <Outlet />;
};

export const action: ActionFunction = async ({ request }) => {
  const publicKey = process.env.PK_AUTHDOG as string;
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  const payload = JSON.parse(
    Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
  );

  const environmentId = payload.environmentId;
  const cookieNameSession = `user_session_${environmentId}`;
  const cookieNameHash = `user_session_hash_${environmentId}`;

  const response = redirect("/");

  response.headers.append(
    "Set-Cookie",
    `${cookieNameSession}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  );
  response.headers.append(
    "Set-Cookie",
    `${cookieNameHash}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`
  );

  return response;
};

export const loader: LoaderFunction = async ({ context, request }) =>
  await remixAuthLoader({
    request,
    context,
    params: {
      publicKey: process.env.PK_AUTHDOG,
    },
  });

const AuthdogRemixApp = (App: () => JSX.Element, opts: any = {}) => {
  return () => {
    const data = useLoaderData<typeof loader>();
    const isAuthenticated = data?.user?.id !== undefined;
    const signinUri = data?.signinUri;

    // const publicKey = process.env.PK_AUTHDOG as string;
    // if (!publicKey) {
    //   throw new Error("Public key is not defined");
    // }

    // const payload = JSON.parse(
    //   Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
    // );

    // if (!payload?.identityHost || !payload?.environmentId) {
    //   throw new Error("Invalid public key payload: missing identityHost or environmentId");
    // }

    // const signinUri = `${payload.identityHost}/signin/${payload.environmentId}`;
    // console.log(signinUri);

    return (
      <AuthdogProvider>
        <Navbar />
        {isAuthenticated ? (
          <form method="post">
            <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Logout
            </button>
          </form>
        ): (
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => {
            location.href = signinUri;
          }}
          >
          Sign in
        </button>
        )}
        <App />
      </AuthdogProvider>
    );
  };
};

export const getPublicKeyPayload = (publicKey: string): any => {
  if (!publicKey) {
    throw new Error("Public key is not defined");
  }

  if (!publicKey.startsWith("pk_")) {
    throw new Error("Invalid public key");
  }

  try {
    return JSON.parse(
      Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"),
    );
  } catch (e) {
    throw new Error("Failed to parse public key");
  }
};

export function AuthdogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default AuthdogRemixApp(App);
