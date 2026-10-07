import { createAuthdogClient, createElectronOpener } from "@authdog/electron";

const publicKey = import.meta.env.PK_AUTHDOG;
if (!publicKey) {
  throw new Error(
    "PK_AUTHDOG is not set. Copy .env.example to .env and add your Authdog public key.",
  );
}

const status = document.querySelector<HTMLElement>("#status");
const opened = document.querySelector<HTMLElement>("#opened");
const profile = document.querySelector<HTMLElement>("#profile");
const signIn = document.querySelector<HTMLButtonElement>("#sign-in");
const callback = document.querySelector<HTMLInputElement>("#callback");
const complete = document.querySelector<HTMLButtonElement>("#complete");
const signOut = document.querySelector<HTMLButtonElement>("#sign-out");

if (!status || !opened || !profile || !signIn || !callback || !complete || !signOut) {
  throw new Error("Example page is missing its controls");
}

const authdog = createAuthdogClient({
  publicKey,
  redirectUri: "myapp://auth/callback",
  openUrl: createElectronOpener({
    openExternal: (url) => {
      opened.textContent = url;
    },
  }),
});

const render = async (): Promise<void> => {
  const authenticated = await authdog.isAuthenticated();
  status.textContent = `Signed in: ${authenticated ? "yes" : "no"}`;
  profile.textContent = authenticated
    ? JSON.stringify(await authdog.getUser(), null, 2)
    : "";
};

signIn.addEventListener("click", () => {
  void authdog.signIn();
});

complete.addEventListener("click", () => {
  void authdog.handleCallback(callback.value).then(() => render());
});

signOut.addEventListener("click", () => {
  void authdog.signOut().then(() => render());
});

void render();
