# AGENTS.md

Instructions for coding agents working in the CSpell monorepo.
If a command here disagrees with `package.json`, `package.json` wins — say so rather than working around it.

Human-facing detail (CI layout, release process, troubleshooting) lives in `CONTRIBUTING.md`.

## Setup

```bash
corepack enable     # required; pnpm version is pinned in packageManager
pnpm ibt            # install + build + test
```

Node >= 22.18. Run the steps separately if you need to iterate — but always build before testing:
`test:prep` invokes `cspell-tools`, so `pnpm test` fails on an un-built tree.

## Do not

- **Do not "fix" spelling in test data.** `fixtures/`, `test-fixtures/`, `integration-tests/`,
  `examples/`, and snapshot files contain deliberate misspellings. Correcting them breaks the suite.
- **Do not add words to `cspell-dict.txt` to make `check-spelling` pass.** That file is real project
  vocabulary. Words that should be tolerated but not endorsed go in `cspell-ignore-words.txt`;
  one-off cases use an inline `cspell:ignore` comment.
- **Do not hand-edit generated files:** `cspell.schema.json`, any `CHANGELOG.md`, `.release.json`, `dist/`,
  `__snapshots__/`, `pnpm-lock.yaml`, and injected regions of `README.md`, `packages/*/README.md`,
  and `website/src/**/*.md` (produced by `inject-markdown`).
- **Do not version or publish anything.** Releases are workflow-driven: a merged
  `chore: Prepare Release ... (auto-deploy)` PR triggers `build-version-release.yml`, which takes the
  version from `.release.json` and runs `lerna version`, then `publish.yml` runs `lerna publish from-package`.
  Never run `lerna` locally, and never hand-edit `version` fields in `package.json`
  or `lerna.json`.
- **Do not `git add .` to make `git diff --exit-code` pass.** A dirty tree after a build means either
  a tracked artifact was regenerated (stage that file by path) or the build is nondeterministic
  (stop and report). Never blanket-commit build output.
- **Do not run `pnpm run test-integrations` unless asked.** It clones real repositories and needs network.

## If you change X, also do Y

| Change                                   | Also required                                                                                                                                            |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cspell-types` (config options, types)   | `pnpm run update-schema`, commit `cspell.schema.json`, document in `website/docs`. `pnpm test` runs `test-schema` and will fail otherwise.               |
| CLI flags or output in `packages/cspell` | Update snapshots; refresh injected README content via `pnpm run build:readme`.                                                                           |
| Checking behavior in `cspell-lib`        | Expect snapshot churn across packages; update deliberately, review the diff.                                                                             |
| Bundled dictionaries                     | `pnpm run update-dictionary-packages`. Word lists themselves live in [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts) — not this repo. |

## Code style

Compiler settings live in `tsconfig.json` (`tsconfig.base.json` is a shim that extends it, not the
other way round). The ones that bite:

- `moduleResolution: node16` — relative imports need an explicit `.js` extension.
- `isolatedDeclarations` — every exported symbol needs an explicit type annotation; inferred return
  types on exports fail the build.
- `exactOptionalPropertyTypes` — `{ x?: string }` will not accept an explicit `undefined`.
- `skipLibCheck: false` — type errors in dependencies surface here and are not yours to suppress.

Also:

- Tests use **vitest** — it's the only runner in the repo.
- Formatting is mechanical — run `pnpm run lint` (mutates: eslint `--fix` + `prettier -w`). Don't hand-format.
- CI runs on Windows: use `path` utilities, never string-concatenated separators.

## Before you call it done

```bash
pnpm run build
pnpm test
pnpm run lint-ci          # check-only; `lint` rewrites files
pnpm run check-spelling
git status --porcelain    # only intended changes
```

Snapshots: `pnpm run test:update-snapshots` after a build, or `pnpm run update-test-snapshots`
(installs, builds, then updates).

## Pull requests

Release notes are drafted by **release-drafter** from merged PRs, then written into `CHANGELOG.md`
and `packages/*/CHANGELOG.md` by `scripts/gen-release.mts`. Both the **PR title and the PR body are
published verbatim** — write them for someone reading the release notes. Individual commit messages
are not published.

`.github/release-drafter.yml` labels the PR from its title, and the label decides the changelog
section and the version bump:

| Title prefix                                   | Section                       | Bump  |
| ---------------------------------------------- | ----------------------------- | ----- |
| `feat:`                                        | Features                      | minor |
| `fix:`, `refactor:`, `dev:`                    | Fixes                         | patch |
| `feat!:`, `fix!:`                              | **BREAKING**                  | major |
| `docs:` (or any PR touching `website/**/*.md`) | Documentation                 | patch |
| `chore:`, `ci:`                                | — excluded from release notes | —     |
| `test:`                                        | — excluded from release notes | —     |

A title matching none of these gets no label, and an unlabelled PR is **left out of the release
notes entirely** — the config uses an allowlist. Use `chore:` deliberately when that's what you want.

`refactor:` landing under Fixes is intentional: the sections describe what changed for the user, not
how the work was categorized internally.

Leave the release machinery alone: the `release-draft` branch, `chore: Prepare Release ...` commits,
and `.release.json` are all bot-generated.

## Targeting one package

```bash
pnpm --filter cspell test              # one package's tests
pnpm --filter cspell... run build      # package plus its dependencies
node ./bin.mjs lint <files>            # run the CLI from the repo
pnpm run build:prod                    # skips test-packages
```
