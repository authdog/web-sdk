export { AuthdogProvider, AuthdogContext } from "./provider";
export type { AuthdogProviderProps, AuthdogContextValue } from "./provider";

export {
  useAuth,
  useSession,
  useSignIn,
  useSignUp,
  useSignOut,
  useUser,
} from "./hooks";

export {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  AccountButton,
} from "./components";
export type { AuthButtonProps, AccountButtonProps } from "./components";

export { buildAuthorizeUrl } from "./auth-url";
export type { BuildAuthorizeUrlOptions } from "./auth-url";

export { clearAuthdogSession, fetchUserData } from "./session";
export type { AuthdogUser, AuthdogUserResponse } from "./session";

export { TOKEN_STORAGE_KEY, TOKEN_UPDATED_EVENT } from "./constants";

// Re-export Account UI for convenience
export {
  Account,
  UserProfile,
  UserButton,
  Navbar,
  TOTPValidator,
} from "@authdog/react-elements";
