import { createAuthdogClient } from "@authdog/javascript";

const publicKey = import.meta.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const authdog = createAuthdogClient({ publicKey });
authdog.handleRedirectCallback();

const status = document.querySelector<HTMLElement>("#status");
const profile = document.querySelector<HTMLElement>("#profile");
const signIn = document.querySelector<HTMLButtonElement>("#sign-in");
const signOut = document.querySelector<HTMLButtonElement>("#sign-out");

if (!status || !profile || !signIn || !signOut) {
  throw new Error("Example page is missing its controls");
}

const render = async (): Promise<void> => {
  const authenticated = authdog.isAuthenticated();
  status.textContent = `Signed in: ${authenticated ? "yes" : "no"}`;
  signIn.hidden = authenticated;
  signOut.hidden = !authenticated;
  profile.textContent = authenticated
    ? JSON.stringify(await authdog.getUser(), null, 2)
    : "";
};

signIn.addEventListener("click", () => {
  authdog.signIn();
});

signOut.addEventListener("click", () => {
  authdog.signOut("/");
});

void render();
