// Re-export the type-only module augmentation of "fastify" so consumers get
// typed `request.authdog` / `fastify.authdog` simply by importing this package.
import "./types";

export { authdogPlugin, default } from "./plugin";
export type {
  AuthdogInstanceApi,
  AuthdogPluginOptions,
  AuthdogRequestContext,
} from "./types";
