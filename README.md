# Authdog Web-SDK

A curated set of libraries to accelerate identity integration into supported frameworks and apps.

[![packages-publish](https://github.com/authdog/web-sdk/actions/workflows/packages-publish.yml/badge.svg)](https://github.com/authdog/web-sdk/actions/workflows/packages-publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Packages

### React

[![npm](https://img.shields.io/npm/v/@authdog/react-elements?label=@authdog/react-elements)](https://www.npmjs.com/package/@authdog/react-elements)

### Next.js (App Router)

[![npm](https://img.shields.io/npm/v/@authdog/nextjs-app?label=@authdog/nextjs-app)](https://www.npmjs.com/package/@authdog/nextjs-app)

### Remix

[![npm](https://img.shields.io/npm/v/@authdog/remix-node?label=@authdog/remix-node)](https://www.npmjs.com/package/@authdog/remix-node)

### Utilities

[![npm](https://img.shields.io/npm/v/@authdog/node-commons?label=@authdog/node-commons)](https://www.npmjs.com/package/@authdog/node-commons)

## Getting Started

This monorepo uses [Bun](https://bun.sh) (package manager + workspaces with a
shared dependency catalog) and [moon](https://moonrepo.dev) (task runner).
[`just`](https://github.com/casey/just) wraps the common workflows.

```bash
bun install        # install all workspace dependencies
just build         # build the publishable packages
just ci            # run the full CI pipeline (build + lint + test + type-check)
```

Common development commands:

```bash
just dev-next      # run the Next.js sample app
just dev-remix     # run the React Router 7 sample app
just ui            # run the react-elements Storybook
moon run :build    # build everything (apps + packages)
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT](LICENSE)
