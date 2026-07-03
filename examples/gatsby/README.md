# Gatsby App with Authdog

An example [Gatsby](https://www.gatsbyjs.com/) application demonstrating the
Authdog Gatsby SDK (`@authdog/gatsby`).

## Features

- Gatsby 5 with the React client provider (`AuthdogProvider`, wired via
  `wrapRootElement` in `gatsby-browser`/`gatsby-ssr`)
- An authenticated Gatsby Function (`src/api/me.ts`) gated with `requireAuth`
- A cookie-clearing logout function (`src/api/logout.ts`)
- Browser sign-in against the identity host

## Getting Started

1. Install dependencies (from the repo root):

   ```bash
   bun install
   ```

2. Provide your Authdog public key:

   ```bash
   cat > .env <<'EOF'
   GATSBY_AUTHDOG_PUBLIC_KEY=pk_...   # exposed to the browser
   PK_AUTHDOG=pk_...                  # server-only (Functions)
   EOF
   ```

3. Run the dev server:

   ```bash
   moon run gatsby-app:dev
   # or: bun run dev
   ```

Open http://localhost:8000.
