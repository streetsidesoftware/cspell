---
name: cli-option
description: 'Add or change a cspell command-line flag (for example on cspell lint or cspell trace) end to end: a new flag, a renamed or deprecated flag, or changed behavior or help text. Runs a short design checklist, hands over to feature-adr when a decision is open and to config-option when the flag needs a matching config option, then defines the flag with commander, passes it through, adds app tests, updates the --help snapshots, and drafts the PR title and description. Use this whenever the user asks to add, change, rename, hide, or remove a CLI flag or option on a cspell command, even if they do not say "skill". Not for config options alone (use config-option).'
---

# cli-option

Adds or changes a CLI flag following `docs/config-and-cli.md`, "CLI flags". Read that section first: it is the
procedure. This skill adds the design checklist, the order of work, and the PR drafts.

A flag is public as soon as it ships: people put it in scripts and CI. So the design comes first, and existing command
lines keep working (`docs/design-principles.md`).

## Workflow

### 1. Identify the change

Ask what the user wants, if it isn't clear: a new flag, a rename, a deprecation, a behavior or help text change, or a
removal. Find the command it belongs to in `packages/cspell/src/command*.ts`, and read the flags around it.

### 2. Run the design checklist

Ask one question at a time. Check the existing flags first, and bring what you find to the question. Give options
labelled (a), (b), …, each with the command line a user would type and what cspell reports, and your recommendation
first.

- **Name and short form:** consistent with the neighboring flags, with no clash with an existing short form.
- **Matching config option:** does the same setting belong in config, so CI and editors can set it? If so, and it
  doesn't exist, run `config-option` first. The flag then overrides the config value.
- **Negation:** is a `--no-` form needed?
- **Output and exit code:** does it change what's printed, a reporter's output, or when cspell exits non-zero?
- **Help text:** what `--help` says.

**Hand over to feature-adr** when an answer has more than one reasonable option with lasting effects, such as a new
output format or a change to exit codes. Offer to run the `feature-adr` skill, and continue here once it's decided.

### 3. Implement

- Add the option to the command in `command*.ts`, with help text written for users. Hide options users shouldn't reach
  for with `.hideHelp()`.
- For a rename, keep the old flag working as a hidden option, as `--local` and `--files` are.
- Add it to the matching type in `packages/cspell/src/options.ts`.
- Pass it to where it's used, for `lint` in `packages/cspell/src/lint/`. When it overrides a config option, follow the
  `cfg.options.x ?? configInfo.config.x ?? default` pattern.
- Add cases to `packages/cspell/src/app.test.ts`.

### 4. Verify

While iterating, build and test only the CLI:

```sh
pnpm --filter cspell... run build
pnpm --filter cspell test
pnpm --filter cspell run test:update-snapshot
```

Before finishing, build the whole repo and update all snapshots:

```sh
pnpm run build
pnpm run test:update-snapshots
pnpm test
pnpm run lint
pnpm run check-spelling
```

- Review the snapshot diff: the `--help` output should change only by this flag.
- The Update README workflow regenerates `packages/cspell/README.md`'s help after merge. Running
  `pnpm run build:readme` previews it; commit only the files this change affects.

### 5. Draft the PR title and description

- **Title:** `feat:` for a new flag, `fix:` for changed behavior or a rename. Add `!` when a command line that works
  today would break.
- **Description:** a `## Summary`, and for `feat:` a `## Feature` section with an example command line. Name the flag
  in the main text. How it works can go in an optional closing `Technical Details` block. No tool attribution or HTML
  comments. Follow `docs/pull-requests.md`.
- Remind the user: after merge, run the Build Docs workflow (`gh workflow run update-docs.yml`) so the website's
  `cspell lint --help` page updates. It only runs on its own for `cspell-types` changes.

Show the drafts to the user. Don't commit, push, or open a PR until they say so.
