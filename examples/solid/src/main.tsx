import { render } from "solid-js/web";
import { AuthdogProvider } from "@authdog/solid";
import App from "./App";

const publicKey = import.meta.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const root = document.getElementById("app");
if (!root) {
  throw new Error("Missing #app");
}

render(
  () => (
    <AuthdogProvider publicKey={publicKey}>
      <App />
    </AuthdogProvider>
  ),
  root,
);
