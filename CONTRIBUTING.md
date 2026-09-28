# Contributing

Thanks for considering a contribution to cspell. The user documentation is the website, https://cspell.org.

To add or remove words in a dictionary, see [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts): the
word lists live there, not in this repo.

## TL;DR

- **Set up:** `corepack enable`, then `pnpm ibt` (install, build, test). Always build before testing.
- **Principles:** keep false positives low, and existing configs keep working. See
  [Design principles](./docs/design-principles.md).
- **Generated files** are regenerated, never edited. See
  [Generated files](./docs/build-and-packaging.md#generated-files).
- **Before a PR:** `pnpm run build`, `pnpm test`, `pnpm run lint-ci`, and `pnpm run check-spelling`.
- **PR titles and bodies are published verbatim** in the release notes, for people who use cspell. See
  [Pull requests](./docs/pull-requests.md).

## More docs

- [Build and packaging](./docs/build-and-packaging.md): workspace layout, tooling, commands, generated files, CI
- [Config options and CLI flags](./docs/config-and-cli.md): adding or changing one
- [Pull requests](./docs/pull-requests.md): the title's type, the body, and what goes in the release notes
- [Releasing](./docs/releasing.md): release-drafter, the Prepare Release PR, prerelease mode, fixing an entry
- [Design principles](./docs/design-principles.md)
- [Glossary](./docs/glossary.md)
- [ADRs](./docs/ADRs/README.md): design decisions, one folder per feature

## Getting started

Use the Node.js version in `engines` in `package.json` (`>=22.18.0`). The pnpm version is pinned by `packageManager`.

```sh
corepack enable
pnpm ibt
```

`pnpm ibt` installs, builds, and tests. When iterating, run `pnpm run build` before `pnpm test`: the tests need a built
tree. To work on one package, see [Commands](./docs/build-and-packaging.md#commands).

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

### Spelling

This repo is spell checked with cspell itself.

- Add a real word that the dictionaries don't know to `cspell-dict.txt`.
- Add a word that should be tolerated but never suggested to `cspell-ignore-words.txt`.
- For a one-off, use an inline `cspell:ignore` comment.
- Don't correct misspellings in test data: `fixtures/`, `test-fixtures/`, `integration-tests/`, `examples/`, and
  snapshots. They're deliberate.

## Pull requests

The title and body of a PR that users would notice are published verbatim in the release notes. Write them like a press
release for people who use cspell: what changed, and why it matters to them. Details only reviewers need go in a PR
comment.

How to pick the title's type and write the body is in [Pull requests](./docs/pull-requests.md).

## Code style

Prettier and ESLint handle formatting and import order. The compiler settings that catch people out are in
[Build and packaging](./docs/build-and-packaging.md#compiler-settings-that-catch-people-out).

### Comments

Keep the mental cost of reading the code low. The code is the source of truth. A few accurate comments are better than
many long ones that drift out of date.

- Don't explain what the code does when the code already shows it. Explain why, only when it isn't obvious.
- A comment should never take longer to read than the code it describes.
- Don't discuss rejected alternatives, and give a reason once, not in every place it applies.
- Avoid a one-line comment with several clauses. Use a short multi-line list instead.
- Avoid a paragraph full of `code` references. Split it into sentences or a list.
- Keep comment lines to 140 characters or fewer.
- Tests: the test name states the intent. Comment only on setup that isn't obvious.
- Leave existing comments alone unless you are changing that function, or you are asked to.

Two kinds of doc comment are documentation for users:

- **The public API of every published package**: each class, function, method, type, and constant that its
  `package.json` `exports` expose. Other projects use these packages, and the doc comment is what their editor shows
  on hover. Write one line on what it does, plus what isn't obvious from the name and type: units, defaults, errors,
  side effects. Use `@param` and `@returns` when they add something.
- **Config options** in `packages/cspell-types/src/CSpellSettingsDef.ts` and the other `cspell-types` config types.
  They become the JSON schema descriptions and the website's Properties page, so they can be as long as they need to
  be. See [Config options](./docs/config-and-cli.md#2-define-it).

Internal code follows the rules above: a doc comment only when it adds something.

### Invisible characters

Write invisible and non-printing characters as escape sequences (`\u00a0`, `\u200b`, `\u2028`), including in strings,
regular expressions, and `case` labels. A literal invisible character can't be seen in a review, and editors can
silently change it.

The one exception is a zero-width space inside a doc comment. A doc comment can't use escapes, and some text in it
would otherwise end the comment early, such as a glob like `**/*.ts` or an example `/* ... */`. Put a zero-width space
between `*` and `/` to keep them apart. The file then needs `/* eslint-disable no-irregular-whitespace */`. See
`packages/cspell-types/src/CSpellSettingsDef.ts`. The schema build and the website generator remove these zero-width
spaces, so users never see them.

Test data (`fixtures/`, samples) may contain literal invisible characters on purpose.

## Writing for users

These rules apply to everything people who use cspell read:

- `packages/*/README.md`, which are the npm pages, and the root `README.md`
- the website, `website/docs/`
- doc comments on config options and on public APIs
- the titles and bodies of PRs that go into the release notes: see [Pull requests](./docs/pull-requests.md)

Those readers are [users](./docs/glossary.md#users): people who run cspell, write its config, or build on its packages.

`website/docs/` is for people who use cspell. `docs/` is for maintainers and contributors. Don't mix them.

- Write for someone using cspell, not for a contributor.
- In README files, use absolute `https://` links: relative links break on npm. Website pages can link to each other
  with relative links.
- Don't start a sentence with a code span. Lead with a word: "Use `ignoreWords` to…".
- Label an example that is a whole file with its filename in bold, directly above the code block, for example
  **`cspell.config.yaml`**.
- Never edit between `@@inject` markers, or the generated website pages. See
  [Generated files](./docs/build-and-packaging.md#generated-files).
- In a Markdown file with deliberate misspellings, list them in a `cspell:ignore` comment at the end of the file.

## Links

- Coverage: [Coveralls](https://coveralls.io/github/streetsidesoftware/cspell) and
  [Codecov](https://app.codecov.io/gh/streetsidesoftware/cspell)
- Packages most used by other projects: [cspell](https://www.npmjs.com/package/cspell),
  [cspell-lib](https://www.npmjs.com/package/cspell-lib), and
  [cspell-trie-lib](https://www.npmjs.com/package/cspell-trie-lib)
