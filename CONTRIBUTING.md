# Contributing to react-gallimaps

First off — thank you for taking the time to contribute! This project aims to
be a friendly, well-maintained React wrapper for GalliMaps, and contributions of
all sizes are welcome: bug reports, docs, tests, and features.

## Code of Conduct

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting started

You need **Node 18+** and npm 9+. The repository's `.nvmrc` pins the development
version (Node 20).

```bash
# 1. Fork and clone
git clone https://github.com/<your-username>/react-gallimaps.git
cd react-gallimaps

# 2. Install dependencies
npm install

# 3. Make sure everything is green before you start
npm run lint
npm run format:check
npm run type-check
npm test
npm run build
```

## Project layout

```
src/
├── api/          # GalliApiClient (REST) + endpoints, errors, request/response types
├── components/   # Gallimap, Marker, Polygon, Search
├── context/      # GallimapsProvider + useGallimaps (map instance, marker registry, REST client)
├── hooks/        # Map hooks (useGallimapsAPI, useScript) + REST hooks
│                 #   (useAutocomplete, useSearch, useReverseGeocode, useRoute,
│                 #    useDistance, useGalliClient)
├── types/        # Public + native plugin types
├── utils/        # isBrowser and other small helpers
└── index.ts      # Public entry point
```

## Development workflow

1. Create a branch: `git checkout -b feat/short-description`.
2. Make your change with tests where it makes sense.
3. Run the full check suite:
   ```bash
   npm run lint
   npm run format:check
   npm run type-check
   npm test
   npm run build
   ```
4. Format your code: `npm run format`.
5. Commit using clear, conventional messages (e.g. `fix: restore map center after marker add`).
6. Open a Pull Request against `master` and fill in the template.

`master` is protected: changes land through a pull request after CI passes.
The CI matrix covers Node 18, 20, and 22, and imports the built package with the
minimum supported React (16.8).

## Documentation site

The package site lives in `docs/` as plain HTML, CSS, and JavaScript — there is
no build step. Preview it locally with:

```bash
npx serve docs
```

Pushing changes under `docs/` to `master` deploys the site through the
`.github/workflows/pages.yml` workflow.

## Coding guidelines

- **TypeScript first.** Avoid `any`; the linter warns on it. Prefer `unknown`
  for genuinely loose plugin data and narrow at the boundary.
- **Keep components dumb where possible.** Side effects belong in hooks.
- **SSR safety.** Anything touching `window`/`document` must guard with `isBrowser()`
  or run inside an effect.
- **No new runtime dependencies** without discussion — React stays the only peer.
- Follow the existing Prettier/ESLint config; CI enforces both.

## Tests

We use Jest + Testing Library. Tests live in `src/__tests__/`. Aim to cover new
branches and props. Run a single suite with:

```bash
npx jest src/__tests__/Marker.test.tsx
```

## Reporting bugs

Open an issue using the **Bug report** template. A minimal reproduction (a
CodeSandbox or a small snippet) makes fixes dramatically faster.

## Proposing features

Open a **Feature request** issue first so we can align on the API before you
invest time in a PR.

## Releasing (maintainers)

1. Update `CHANGELOG.md` and the README's "New in" note.
2. Bump the version in `package.json` (`npm version <patch|minor|major> --no-git-tag-version`).
3. Open a release PR. `master` is protected, so the release lands through a
   pull request with green CI.
4. Tag the merged commit and push the tag:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```
5. Check the audit gate, then publish:
   ```bash
   npm audit --omit=dev
   npm publish
   ```
   `prepublishOnly` runs lint, type-check, tests, and a production build.
6. Confirm the docs deployment at
   https://rudalkunwar.github.io/react-gallimaps/ and publish the GitHub release
   notes for the tag.

Thanks again — happy mapping!
