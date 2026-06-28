default:
    @just --list

# ── Development ──────────────────────────────────────────────
install:
    bun install

dev-next:
    moon run nextjs-app-sample:dev

dev-remix:
    moon run remix-playground:dev

dev-vue:
    moon run vue-app:dev

dev-astro:
    moon run astro-app:dev

dev-sveltekit:
    moon run sveltekit-app:dev

dev-angular:
    moon run angular-app:dev

dev-express:
    moon run express-api:dev

dev-fastify:
    moon run fastify-api:dev

dev-react-native:
    moon run react-native-app:dev

ui:
    moon run react-elements:storybook

# ── Build ────────────────────────────────────────────────────
build:
    moon run node-commons:build nextjs-app:build react-elements:build remix-node:build tanstack-start:build vue:build astro:build sveltekit:build

build-libs:
    moon run react-elements:build remix-node:build

# ── Backend SDKs (Python / Go / Rust) ────────────────────────
test-python:
    moon run python:test

test-go:
    moon run go:test

test-rust:
    moon run rust:test

# ── Code Quality ─────────────────────────────────────────────
format:
    bun run format

# ── CI ───────────────────────────────────────────────────────
ci:
    moon ci
