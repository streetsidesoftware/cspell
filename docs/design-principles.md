# Design principles

Principles that guide how cspell behaves. Weigh every behavior change against them. When a feature designed with an
[ADR](./ADRs/README.md) sets a new principle, add it here and link to the feature.

## Keep false positives low

The goal is to catch real spelling mistakes while flagging as few correct words as possible.

- When in doubt, don't flag a word.
- A spell checker that flags too much gets turned off, and then it catches nothing.
- Prefer defaults that are quiet and accurate. Stricter checking is something users turn on.

## Existing configs keep working

People commit cspell config files and run cspell in CI. A new release shouldn't break a setup that works today.

- A changed default, or a changed meaning of an existing option or flag, is a breaking change: `feat!:` or `fix!:`.
- A deprecated option or flag keeps being read, and its deprecation message names the replacement.

## Same config, same result

The CLI, `cspell-lib`, the ESLint plugin, and the VS Code extension report the same issues for the same config and
file. Teams share one config between them, and expect them to agree.

## A command changes only what the user named

A command that writes files, such as `cspell init` or `cspell link`, changes only the file or setting the user asked
for, with no hidden side effects.

- It doesn't also tidy up other entries, create other files, or change other config.
- When a second change seems needed, make it a separate step the user takes, or ask first.

People own and review their config files and dictionaries. An edit they didn't ask for costs trust.

## Cost scales with the files checked

cspell runs over whole monorepos, in CI, on every commit.

- Keep per-file and per-word work bounded. Load once and reuse: dictionaries, config, compiled patterns.
- Make expensive work opt-in, or cache it, as `--cache` does.
