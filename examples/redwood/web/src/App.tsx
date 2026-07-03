import React from "react";
import { AuthdogProvider } from "@authdog/redwood/web";
import "@authdog/react-elements/styles.css";
import HomePage from "./pages/HomePage/HomePage";

/**
 * In a real RedwoodJS app this file also renders `<RedwoodProvider>` and
 * `<Routes />` from `@redwoodjs/web` / `@redwoodjs/router`. The Authdog-specific
 * part is wrapping the tree in `<AuthdogProvider>`, which strips the `?token=…`
 * left by the login redirect and reloads once so the session cookie is picked up.
 *
 * ```tsx
 * import { RedwoodProvider } from "@redwoodjs/web";
 * import { Router, Route } from "@redwoodjs/router";
 *
 * const App = () => (
 *   <AuthdogProvider>
 *     <RedwoodProvider>
 *       <Router>
 *         <Route path="/" page={HomePage} name="home" />
 *       </Router>
 *     </RedwoodProvider>
 *   </AuthdogProvider>
 * );
 * ```
 */
const App = () => (
  <AuthdogProvider>
    <HomePage />
  </AuthdogProvider>
);

export default App;
