import { useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import {
  AuthdogProvider,
  createSecureStoreAdapter,
  useRedirectHandler,
  useSession,
  useSignIn,
  useSignOut,
  useSignUp,
  useUser,
} from "@authdog/react-native";

// Replace with your own Authdog public key (safe to ship in the bundle), or
// set EXPO_PUBLIC_PK_AUTHDOG in your environment / .env.
const PUBLIC_KEY =
  process.env.EXPO_PUBLIC_PK_AUTHDOG ?? "pk_your_public_key_here";

// MUST match the `scheme` in app.json and be registered as an allowed redirect
// URI in the Authdog dashboard. The hosted sign-in flow returns the user here
// with `?token=…`, which `useRedirectHandler` validates and persists.
const REDIRECT_URL = "authdogdemo://callback";

// Tokens are persisted in the device secure store (Keychain / Keystore) so the
// session survives app restarts and is encrypted at rest.
const storage = createSecureStoreAdapter(SecureStore);

export default function App() {
  return (
    <AuthdogProvider publicKey={PUBLIC_KEY} storage={storage}>
      <Main />
    </AuthdogProvider>
  );
}

function Main() {
  const { session, isLoading } = useSession();
  const { handleRedirect } = useRedirectHandler();

  // Complete the sign-in round-trip from the returned deep link. We handle both
  // the cold-start case (`getInitialURL`, app launched by the link) and the
  // warm case (`addEventListener`, app already running). `handleRedirect`
  // extracts and validates the `?token=` before persisting it.
  useEffect(() => {
    void Linking.getInitialURL().then((url) => {
      if (url) {
        void handleRedirect(url);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handleRedirect(url);
    });

    return () => subscription.remove();
  }, [handleRedirect]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Authdog × React Native</Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.muted}>Restoring session…</Text>
          </View>
        ) : session.isAuthenticated ? (
          <Profile />
        ) : (
          <SignedOut />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SignedOut() {
  const { signIn, isLoading: signingIn, error: signInError } = useSignIn();
  const { signUp, isLoading: signingUp } = useSignUp();

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>You're signed out</Text>
      <Text style={styles.muted}>
        Sign in opens the hosted Authdog flow in the system browser and returns
        to {REDIRECT_URL}.
      </Text>

      <TouchableOpacity
        style={[styles.button, signingIn && styles.buttonDisabled]}
        disabled={signingIn}
        onPress={() => signIn(REDIRECT_URL)}
      >
        <Text style={styles.buttonText}>
          {signingIn ? "Opening…" : "Sign in with Authdog"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        disabled={signingUp}
        onPress={() => signUp(REDIRECT_URL)}
      >
        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
          {signingUp ? "Opening…" : "Create an account"}
        </Text>
      </TouchableOpacity>

      {signInError ? (
        <Text style={styles.error}>{signInError.message}</Text>
      ) : null}
    </View>
  );
}

function Profile() {
  const { user, isLoading, error, fetchUser } = useUser();
  const { signOut, isLoading: signingOut } = useSignOut();

  // Resolve the userinfo payload once we have a session token.
  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const u = user as
    | { id?: string; displayName?: string; userName?: string; emails?: { value: string }[] }
    | null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>You're signed in 🎉</Text>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading profile…</Text>
        </View>
      ) : error ? (
        <Text style={styles.error}>{error.message}</Text>
      ) : u ? (
        <View style={styles.profile}>
          <Text style={styles.profileName}>
            {u.displayName ?? u.userName ?? "Unknown user"}
          </Text>
          <Text style={styles.muted}>{u.emails?.[0]?.value ?? "No email"}</Text>
          <Text style={styles.mono}>{u.id ?? ""}</Text>
        </View>
      ) : (
        <Text style={styles.muted}>No user data.</Text>
      )}

      <TouchableOpacity
        style={[styles.button, styles.buttonDanger, signingOut && styles.buttonDisabled]}
        disabled={signingOut}
        onPress={() => signOut()}
      >
        <Text style={styles.buttonText}>
          {signingOut ? "Signing out…" : "Sign out"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b1020" },
  content: { padding: 24, gap: 24, flexGrow: 1, justifyContent: "center" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#161c2e",
    borderRadius: 16,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: "#26304a",
  },
  heading: { fontSize: 20, fontWeight: "600", color: "#fff" },
  muted: { color: "#9aa6c0", fontSize: 14, lineHeight: 20 },
  mono: { color: "#6b7796", fontSize: 12, fontFamily: "monospace" },
  center: { alignItems: "center", gap: 8, paddingVertical: 12 },
  profile: { gap: 4 },
  profileName: { fontSize: 18, fontWeight: "600", color: "#fff" },
  button: {
    backgroundColor: "#4f7cff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonSecondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#4f7cff" },
  buttonDanger: { backgroundColor: "#e0455e" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  buttonTextSecondary: { color: "#9db4ff" },
  error: { color: "#ff8a9c", fontSize: 14 },
});
