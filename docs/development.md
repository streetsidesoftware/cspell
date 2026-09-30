# Development

Setting up the repo, and the checks to run before opening a pull request. For the workspace layout, more commands, and
generated files, see [Build and packaging](./build-and-packaging.md).

## Getting started

Use the Node.js version in `engines` in `package.json` (`>=22.18.0`). The pnpm version is pinned by `packageManager`.

```sh
corepack enable
pnpm ibt
```

`pnpm ibt` installs, builds, and tests. When iterating, run `pnpm run build` before `pnpm test`: the tests need a built
tree. To work on one package, see [Commands](./build-and-packaging.md#commands).

## Before submitting a pull request

```sh
pnpm run build
pnpm test
pnpm run lint-ci
pnpm run check-spelling
```

- `pnpm run lint` runs ESLint and Prettier and writes their fixes. `pnpm run lint-ci` only checks. On a PR, autofix.ci
  pushes lint fixes for you.
- After the build, `git status` should show only your changes. If a generated file changed, commit it.
- If snapshots change, update them with `pnpm run test:update-snapshots` and review the diff.

Then write the title and description: see [Pull requests](./pull-requests.md).

## Tests

Tests use vitest, next to the source. To run one package or one file, see
[Commands](./build-and-packaging.md#commands).

- When code relies on a library's behavior, such as how the glob library treats symbolic links, add a test that fails
  if that behavior changes. Upgrading or replacing the library then shows up in CI instead of in a release.

## Spelling

This repo is spell checked with cspell itself.

- Add a real word that the dictionaries don't know to `cspell-dict.txt`.
- Add a word that should be tolerated but never suggested to `cspell-ignore-words.txt`.
- For a one-off, use an inline `cspell:ignore` comment.
- Don't correct misspellings in test data: `fixtures/`, `test-fixtures/`, `integration-tests/`, `examples/`, and
  snapshots. They're deliberate.
