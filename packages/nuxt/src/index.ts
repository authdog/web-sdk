export { createAuthdog } from "./client/plugin";
export type { AuthdogPluginOptions } from "./client/plugin";
export { AUTHDOG_CONTEXT_KEY } from "./client/context";
export type { AuthdogContext } from "./client/context";
export {
  useSession,
  useUser,
  useSignIn,
  useSignUp,
  useSignOut,
} from "./composables";
export {
  buildAuthorizeUrl,
  fetchUser,
  getTokenFromUri,
  TOKEN_STORAGE_KEY,
  JWT_PATTERN,
} from "./client/session";
export type { AuthorizeUrlOptions } from "./client/session";
export { getPublicKeyPayload } from "./commons";
export type { PublicKeyPayload } from "./commons";
