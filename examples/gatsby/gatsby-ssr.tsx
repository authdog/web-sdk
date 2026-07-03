import React from "react";
import type { GatsbySSR } from "gatsby";
import { AuthdogProvider } from "@authdog/gatsby/client";

export const wrapRootElement: GatsbySSR["wrapRootElement"] = ({ element }) => (
  <AuthdogProvider>{element}</AuthdogProvider>
);
