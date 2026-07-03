import { createAuthdog } from "@authdog/gatsby/server";
import type {
  GatsbyFunctionRequest,
  GatsbyFunctionResponse,
} from "@authdog/gatsby/server";

const authdog = createAuthdog({ publicKey: process.env.PK_AUTHDOG! });

// `requireAuth` is the real server-side enforcement point: it returns 401 for
// unauthenticated requests and attaches `req.authdog` for the rest.
export default authdog.requireAuth(
  async (req: GatsbyFunctionRequest, res: GatsbyFunctionResponse) => {
    res.status(200).json({ user: req.authdog?.user ?? null });
  },
);
