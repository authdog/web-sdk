# @authdog/tauri

## 0.2.0

### Minor Changes

- 225b972: Add frontend/client web SDKs: React Router 7 (loader-based session, Web-Fetch
  native), Nuxt (Vue plugin + composables + Nitro server helpers), SolidJS
  (reactive provider + primitives), a framework-agnostic vanilla JavaScript
  browser client, a Chrome (MV3) extension SDK (`launchWebAuthFlow` +
  `chrome.storage`), and a Tauri desktop SDK (system-browser sign-in via deep-link
  callback). All build on `@authdog/node-commons` for public-key parsing and the
  trusted identity-host allowlist.
