import { Show } from "solid-js";
import { useSession, useSignIn, useSignOut, useUser } from "@authdog/solid";

export default function App() {
  const { isAuthenticated } = useSession();
  const { user, load } = useUser();
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();

  return (
    <main>
      <h1>Authdog × Solid</h1>
      <p>Signed in: {isAuthenticated() ? "yes" : "no"}</p>
      <Show
        when={isAuthenticated()}
        fallback={
          <button type="button" onClick={() => signIn()}>
            Sign in
          </button>
        }
      >
        <button type="button" onClick={() => void load()}>
          Load profile
        </button>
        <button type="button" onClick={() => signOut("/")}>
          Sign out
        </button>
        <pre>{JSON.stringify(user(), null, 2)}</pre>
      </Show>
    </main>
  );
}
