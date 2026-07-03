import React from "react";
import type { GatsbyBrowser } from "gatsby";
import { AuthdogProvider } from "@authdog/gatsby/client";
import "@authdog/react-elements/styles.css";

export const wrapRootElement: GatsbyBrowser["wrapRootElement"] = ({
  element,
}) => <AuthdogProvider>{element}</AuthdogProvider>;
