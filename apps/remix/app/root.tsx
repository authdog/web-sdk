import {
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { useEffect } from "react";

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
        </body>
      </AuthdogProvider>
    </html>
  );
}

const App = () => {
  return <Outlet />;
};

const AuthdogRemixApp = (App: () => JSX.Element, opts: any = {}) => {
  return () => {
    // let clerkState;
    // const isSpaMode = inSpaMode();

    // Don't use `useLoaderData` to fetch the clerk state if we're in SPA mode
    // if (!isSpaMode) {
    //   const loaderData = useLoaderData<{ clerkState: any }>();
    //   clerkState = loaderData.clerkState;
    // }

    // if (isSpaMode) {
    //   assertPublishableKeyInSpaMode(opts.publishableKey);
    // }

    return (
      <AuthdogProvider
      /* @ts-ignore The type of opts cannot be inferred by TS automatically because of the complex
       * discriminated unions required for the router props and multidomain feature   */
      // {...(opts as RemixClerkProviderProps)}
      // clerkState={clerkState}
      >
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
    return JSON.parse(Buffer.from(publicKey.replace("pk_", ""), "base64").toString("utf-8"));
  } catch (e) {
    throw new Error("Failed to parse public key");
  }
};

// export const loader: LoaderFunction = async ({ request }) => {

//   return null;
// };

export function AuthdogProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    if (token) {
      url.searchParams.delete("token");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);

  return <>{children}</>;
}

export default AuthdogRemixApp(App);
