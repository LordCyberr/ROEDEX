# Contributing to ROEDEX

Thank you for your interest in contributing to ROEDEX! This guide covers everything you need to get started — whether you're fixing a bug, adding a feature, or improving documentation.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Code Style & Architecture](#code-style--architecture)
5. [The Regression Log Rule (CRITICAL)](#the-regression-log-rule-critical)
6. [Writing Tests](#writing-tests)
7. [Submitting a Pull Request](#submitting-a-pull-request)
8. [Reporting Bugs](#reporting-bugs)

---

## Project Overview

ROEDEX is a real-time Chrome Extension overlay for Roots of Embervault. It intercepts the game's WebSocket traffic on the client side (passively — it never modifies or sends game packets) and renders a live HUD overlay using React + Zustand.

- **Stack:** TypeScript · React 19 · Zustand · Vite · Vitest · motion/react
- **Architecture:** See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full system diagram.
- **Extension Type:** Manifest V3 Chrome Extension.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- A Chromium-based browser (Chrome, Edge, Brave)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/LordCyberr/ROEDEX.git
cd ROEDEX

# 2. Install dependencies
npm install

# 3. Start the dev build watcher
npm run dev
```

### Loading the Extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder that Vite generates

> The Vite dev server runs in watch mode. After making changes, the `dist/` folder updates automatically — just click the ↻ Reload button on the extension card in `chrome://extensions`.

---

## Development Workflow

```bash
npm run dev          # Vite watch build (outputs to dist/)
npm run build        # One-time production build
npm run test         # Run all Vitest tests (54 tests)
npm run test:watch   # Run tests in watch mode
npx tsc --noEmit     # TypeScript type check (zero errors required)
```

> **Before every commit:** Run `npx tsc --noEmit && npm run test` and ensure both pass with zero errors.

---

## Code Style & Architecture

### General Rules

1. **TypeScript Strict Mode** — No `any` type casts unless absolutely unavoidable. Use typed interfaces.
2. **Imports** — Use `from 'motion/react'` for animations. **Never** `from 'framer-motion'`.
3. **State** — All store reads in React components MUST use selector hooks (`useShallow`, `useTrackerSelector`). Never call `.getState()` in JSX renders.
4. **No browser globals** — Never use `alert()`, `confirm()`, `prompt()`. Use `addNotification()` from `settingsStore`.
5. **Logging** — Use `console.error` for critical errors only. Wrap `console.warn` / `console.debug` in `if (import.meta.env.DEV)` guards.

### File Naming
| Type | Convention | Example |
|---|---|---|
| React Component | PascalCase | `ChestTab.tsx` |
| Store Slice | camelCase + Slice | `sessionSlice.ts` |
| Utility | camelCase | `formatters.ts` |
| Handler (parser) | camelCase + Handler | `inventoryHandler.ts` |
| Type File | PascalCase + `.types.ts` | `UISlice.types.ts` |

### Adding a New Event Handler

1. Define the payload type in `src/types/events.ts`
2. Extract the payload in `src/core/parser/parserWorker.ts`
3. Create `src/core/parser/handlers/yourHandler.ts`
4. Register it in `src/core/parser/eventRouter.ts`
5. Write a test in `src/core/parser/__tests__/yourHandler.test.ts`

---

## The Regression Log Rule (CRITICAL)

> ⚠️ **Before modifying any of these files, read `REGRESSION_LOG.md` first:**
> - `src/components/map/AAAMinimap.tsx`
> - `src/components/map/Minimap.tsx`
> - `src/store/trackerStore.ts`
> - `src/components/overlay/OverlayContainer.tsx`
> - `src/components/widgets/DebugPanel.tsx`
> - `src/App.tsx`

These files have known historical bugs. The regression log records every past bug, its root cause, and the fix applied. New contributors often accidentally reintroduce old bugs. **Always check the log.**

If you fix a new bug in a high-risk file, **add an entry to `REGRESSION_LOG.md`** as part of your PR.

---

## Writing Tests

Tests live alongside their source files:
```
src/
├── core/parser/__tests__/      # Parser & handler tests
├── store/__tests__/            # Store slice tests  
├── utils/__tests__/            # Utility tests
└── components/**/__tests__/    # Component tests (minimal)
```

- We use **Vitest** (`npm run test`)
- Test files must end in `.test.ts` or `.test.tsx`
- Pure logic (parsers, formatters, store slices) should have 100% coverage
- UI components: test critical state transitions, not CSS

---

## Submitting a Pull Request

1. **Fork** the repository
2. Create a branch: `git checkout -b feat/your-feature-name`
3. Make your changes (keep commits atomic and well-described)
4. Run `npx tsc --noEmit && npm run test` — both must pass
5. Open a PR against `master`
6. In the PR description:
   - Describe what changed and why
   - Note any files from `REGRESSION_LOG.md` you touched and what you checked
   - Add a screenshot if it's a UI change

### Commit Message Convention
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add global item search modal
fix(overlay): correct weapon HUD vertical overflow
perf: memoize CategoryList rows
docs: update ARCHITECTURE.md with v0.0.5 systems
chore: bump version to 0.0.6
```

---

## Reporting Bugs

Use the [Bug Report](https://github.com/LordCyberr/ROEDEX/issues/new?template=bug_report.md) issue template. Please include:
- ROEDEX version (visible in Settings → About)
- Browser version
- Steps to reproduce
- What you expected vs. what happened
- Any errors from DevTools Console (F12)

---

## Security Vulnerabilities

For security issues, **do not open a public issue.** Please see [`SECURITY.md`](SECURITY.md) for the responsible disclosure process.

---

## License

ROEDEX is open-source. By contributing, you agree that your contributions will be licensed under the same terms as the project.
