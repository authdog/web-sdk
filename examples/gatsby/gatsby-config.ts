import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Authdog Gatsby Example",
    siteUrl: "http://localhost:8000",
  },
  // Expose the public key to the browser via Gatsby's GATSBY_ prefix.
  plugins: [],
};

export default config;
