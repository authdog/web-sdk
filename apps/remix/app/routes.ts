import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

// Preserve the Remix-style flat file routing convention
// (routes/_index.tsx, routes/profile.tsx, routes/logout.ts).
export default flatRoutes() satisfies RouteConfig;
