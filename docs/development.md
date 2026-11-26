# Development

Setting up the repo, and the checks to run before opening a pull request. For the workspace layout, more commands, and
generated files, see [Build and packaging](./build-and-packaging.md).

## Getting started

We suggest the current Node.js LTS release. Install [pnpm](https://pnpm.io/installation).

```sh
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

- When code depends on how a library behaves, test that behavior: only the part the code relies on, not the library as a
  whole. Put these tests in a `describe('Validate <library> assumptions', …)` block next to the code that depends on it,
  as [`globHelper.test.ts`](../packages/cspell-glob/src/globHelper.test.ts) does for micromatch and minimatch. If an
  upgrade or a replacement behaves differently, CI shows it instead of a release.
- Tests write files only inside the repo, in their package's `temp/` folder, which git ignores. They never write to the
  system's temp folder, such as `os.tmpdir()`, and they read files outside the repo only for a very good reason.
  Reaching outside the repo ties the tests to the layout of the machine that runs them, such as a CI runner. In cspell
  and cspell-lib, `createTempFolder(import.meta.url)` from the [cspell](../packages/cspell/src/test/test.helper.ts) and
  [cspell-lib](../packages/cspell-lib/src/test-util/test.helper.mts) test helpers gives a test file an empty folder of
  its own in `temp/`.

## Spelling

This repo is spell checked with cspell itself.

- Add a real word that the dictionaries don't know to `cspell-dict.txt`.
- Add a word that should be tolerated but never suggested to `cspell-ignore-words.txt`.
- For a one-off, use an inline `cspell:ignore` comment.
- Don't correct misspellings in test data: `fixtures/`, `test-fixtures/`, `integration-tests/`, `examples/`, and
  snapshots. They're deliberate.
