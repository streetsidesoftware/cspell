# AGENTS.md

Instructions for coding agents working in the CSpell monorepo. `CLAUDE.md` imports this file, and
`.github/copilot-instructions.md` points to it.

If a command here disagrees with `package.json`, `package.json` wins. Say so rather than working around it.

## Commands

```sh
corepack enable                            # once; pnpm is pinned by packageManager
pnpm ibt                                   # install, build, test
pnpm run build                             # always before pnpm test: test:prep needs a built tree
pnpm test
pnpm --filter cspell test                  # one package
pnpm --filter cspell exec vitest run src/options.test.ts   # one test file
pnpm --filter cspell... run build          # a package and its dependencies
node ./bin.mjs lint <files>                # run the CLI from the repo
pnpm run test:update-snapshots             # after a build
pnpm run lint                              # writes fixes: eslint --fix, prettier -w
```

Node.js `>=22.18.0` (`engines` in `package.json`).

## Before you call it done

```sh
pnpm run build
pnpm test
pnpm run lint-ci          # check only
pnpm run check-spelling
git status --porcelain    # only intended changes
```

## Do not

- **Do not "fix" spelling in test data.** `fixtures/`, `test-fixtures/`, `integration-tests/`, `examples/`, and
  snapshot files contain deliberate misspellings. Correcting them breaks the suite.
- **Do not add words to `cspell-dict.txt` to make `check-spelling` pass.** That file is real project vocabulary.
  Words that should be tolerated but not endorsed go in `cspell-ignore-words.txt`. One-off cases use an inline
  `cspell:ignore` comment.
- **Do not hand-edit generated files.** Change the source and regenerate. The list, and what regenerates each one, is
  in [Generated files](docs/build-and-packaging.md#generated-files).
- **Do not version or publish anything.** Never run `lerna`, and never edit `version` fields, `CHANGELOG.md` files,
  or `.release.json`. The workflows do it: see [Releasing](docs/releasing.md).
- **Do not `git add .` to make `git diff --exit-code` pass.** A dirty tree after a build means either a tracked
  artifact was regenerated (stage that file by path) or the build is nondeterministic (stop and report). Never
  blanket-commit build output.
- **Do not run `pnpm run test-integrations` unless asked.** It clones real repositories and needs network.

## Where things are

Read the doc before changing that area. These are written for people.

- [`docs/build-and-packaging.md`](docs/build-and-packaging.md): layout, tooling, compiler settings, generated files,
  "if you change X, also do Y", bundled dictionaries, adding a package, CI.
- [`docs/config-and-cli.md`](docs/config-and-cli.md): adding or changing a config option or a CLI flag.
- [`docs/releasing.md`](docs/releasing.md): release-drafter, labels, the Prepare Release PR, prerelease mode.
- [`docs/design-principles.md`](docs/design-principles.md): weigh every behavior change against these.
- [`docs/glossary.md`](docs/glossary.md): config resolution, dictionaries, and other terms.
- [`CONTRIBUTING.md`](CONTRIBUTING.md): PR titles and descriptions, code style, writing for users.

## Rules

Each rule is written for people in the linked section. Read it before working in that area.

- **If you change X, also do Y:** see [the table](docs/build-and-packaging.md#if-you-change-x-also-do-y).
- **Compiler settings:** `node16` resolution needs `.js` on relative imports, and exports need explicit types. See
  [Compiler settings](docs/build-and-packaging.md#compiler-settings-that-catch-people-out).
- **Tests** use vitest, next to the source. Paths use `node:path`: CI runs on Windows.
- **Comments:** few, short, and accurate. Leave existing comments alone unless you are changing that function. See
  [Comments](CONTRIBUTING.md#comments).
- **Doc comments** on published packages' public API, and on config options, are user documentation. See
  [Comments](CONTRIBUTING.md#comments).
- **Invisible characters:** write them as escape sequences. The one exception is in doc comments. See
  [Invisible characters](CONTRIBUTING.md#invisible-characters).
- **Writing for users:** READMEs, the website, doc comments, and published PRs. See
  [Writing for users](CONTRIBUTING.md#writing-for-users).
- **Workflows:** give a new or changed workflow `workflow_dispatch` when possible. Add `workflow_call` only to a new
  workflow without a `concurrency` section. See
  [CI](docs/build-and-packaging.md#ci).

### Docs for people

Docs for people (`CONTRIBUTING.md`, `docs/`, the website, READMEs) never point to this file. If a doc needs something
that's only here, move it into `docs/` and link to it from both.

### Commits and pull requests

The PR title and body are published verbatim in the release notes. Follow
[Pull requests](CONTRIBUTING.md#pull-requests).

- Pick the type by whether someone using cspell would notice. Tooling and the coding-agent setup are `chore:`.
  Docs and READMEs are `docs:`, and website content is `website:`. None of these are published.
- Never put tool attribution, such as "Generated with ...", in a PR body.
- After pushing more commits to an open PR, check that its description still matches.
- If a merged PR has the wrong title, label, or body, use the `release-notes` skill.

### Designing a feature

For a feature with more than one reasonable design, follow [`docs/ADRs/README.md`](docs/ADRs/README.md) before
writing code. The `feature-adr` skill runs that process as an interview.

### Config options and CLI flags

To add or change a config option, use the `config-option` skill. For a CLI flag, use the `cli-option` skill. Both
follow [`docs/config-and-cli.md`](docs/config-and-cli.md).
