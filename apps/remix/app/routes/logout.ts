import { LoaderFunction } from "@remix-run/node";
import { logoutLoader } from "@authdog/remix-node";

export const loader: LoaderFunction = logoutLoader;