default:
    @just --list

# ── Development ──────────────────────────────────────────────
install:
    bun install

dev-next:
    moon run nextjs-app-sample:dev

dev-remix:
    moon run remix-playground:dev

ui:
    moon run react-elements:storybook

# ── Build ────────────────────────────────────────────────────
build:
    moon run '#publishable:build'

build-libs:
    moon run react-elements:build remix-node:build

# ── Code Quality ─────────────────────────────────────────────
format:
    bun run format

# ── CI ───────────────────────────────────────────────────────
ci:
    moon ci
