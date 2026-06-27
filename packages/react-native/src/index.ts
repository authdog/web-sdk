// Provider + context
export {
  AuthdogProvider,
  AuthdogContext,
  type AuthdogProviderProps,
  type AuthdogContextValue,
} from "./provider";

// Hooks
export {
  useSession,
  useUser,
  useSignIn,
  useSignUp,
  useSignOut,
  useRedirectHandler,
  useAuthz,
  type UseAuthzOptions,
} from "./hooks";

// Storage
export {
  type AuthdogStorage,
  type SecureStoreLike,
  inMemoryStorage,
  createSecureStoreAdapter,
} from "./storage";

// Lower-level helpers
export { buildAuthorizeUrl, type BuildAuthorizeUrlOptions } from "./auth-url";
export { getPublicKeyPayload, getTokenFromUri, type PublicKeyPayload } from "./commons";
export { fetchUserData, validatePublicKey, type IFetchUserData } from "./session";
