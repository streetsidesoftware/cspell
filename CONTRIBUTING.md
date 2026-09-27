# Contributing

Thanks for considering a contribution to cspell. The user documentation is the website, https://cspell.org.

To add or remove words in a dictionary, see [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts): the
word lists live there, not in this repo.

## TL;DR

- **Set up:** `corepack enable`, then `pnpm ibt` (install, build, test). Always build before testing.
- **Principles:** keep false positives low, and existing configs keep working. See
  [Design principles](./docs/design-principles.md).
- **Generated files** are regenerated, never edited. See [Generated files](./docs/build-and-packaging.md#generated-files).
- **Before a PR:** `pnpm run build`, `pnpm test`, `pnpm run lint-ci`, and `pnpm run check-spelling`.
- **PR titles and bodies are published verbatim** in the release notes, for people who use cspell. See
  [Pull requests](#pull-requests).

## More docs

- [Build and packaging](./docs/build-and-packaging.md): workspace layout, tooling, commands, generated files, CI
- [Config options and CLI flags](./docs/config-and-cli.md): adding or changing one
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

Release notes are built from merged PRs. Each entry is the PR **title**, followed by the PR **body**, verbatim. They
are read by people who use the cspell command-line tool, its config, and its packages. They want to know how a change
affects them. Anything only maintainers care about stays out.

### Title

Use a [Conventional Commits](https://www.conventionalcommits.org/) prefix. The prefix sets the label, and the label
decides whether the PR is in the release notes, under which section, and the version bump. Pick it by whether someone
using cspell would notice the change.

In the release notes:

- `feat:`: something users can do that they couldn't before, such as a new option, flag, or file type.
- `fix:`: any other change users would notice: a bug fix, a changed behavior, a speed-up, a removal.
- `feat!:` / `fix!:`: either of the above, when it breaks existing setups. A scope works too: `fix(cspell-lib)!:`. Any
  type with `!` is listed under **BREAKING**, except `chore!:`, `ci!:`, and `test!:`.
- `docs:`: user documentation: the website and package READMEs.
- `revert:` or GitHub's `Revert "…"`: undoes a merged `feat:`, `fix:`, or `docs:` change. Listed under Fixes. A revert of
  anything else is left out.

Left out of the release notes:

- `refactor:`: internal restructuring with no change users would notice.
- `test:`: tests only, and `perf:`: performance tests.
- `ci:`: GitHub Actions and workflows.
- `chore:`: everything else: tooling, dev dependencies, this repo's own docs in `docs/` and `CONTRIBUTING.md`, and the
  coding-agent setup.

A title with any other prefix gets no label, and is left out. The full table, with sections and version bumps, is in
[Releasing](./docs/releasing.md#titles-labels-and-sections).

Bot PRs pick their own type, for example `fix: Workflow Bot -- Update Dictionaries (main)`. Don't lower it: new
dictionaries change what users see.

Write the rest of a published title for users: what changed for them, not how the code changed.

### Description

Keep it short. Prefer bullet points to prose. A sentence with more than one or two `code` spans is hard to read: break
it into a list.

- `## Summary`: one or two sentences that stand on their own: what changed and why.
- For a PR in the release notes (`feat:`, `fix:`, `docs:`, `revert:`), write for users deciding whether it affects
  them.
  - Say which option, flag, command, or behavior changed, in their terms.
  - For `feat:`, add a `## Feature` section: what users can now do, with a config or command-line example.
  - Leave out internal details, and anything else only maintainers need.
- For a PR left out of the release notes, write for reviewers. Group the changes by theme, not by file, and say why each
  matters.
- Put extra detail in collapsed `<details>` blocks, as bullet points.
- No test plan section: CI covers that.
- No tool attribution, such as "Generated with ...". The release notes strip it, but leave it out anyway.
- After pushing more commits, check that the description still matches.

Don't restate the diff, narrate how you got to the change, or write a section per commit.

If a PR merged with the wrong title, label, or body, see
[Fixing a release notes entry](./docs/releasing.md#fixing-a-release-notes-entry).

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
- the titles and bodies of PRs that go into the release notes

Those readers are people running the cspell command-line tool, people writing cspell config, and projects that use
`cspell-lib` and the other packages.

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
