# 0002. The option is named `--glob-symlinks`

Status: Accepted

## Context

The closest existing option is `--dot`, which is `enableGlobDot` in the configuration. The new name has to read as a
glob setting, and be clearly different from `--follow-symlinks`.

Names weighed:

- `--glob-symlinks`, `CSPELL_GLOB_SYMLINKS`, and `enableGlobSymlinks` for a configuration setting.
- `--follow-symlinks-in-globs`: explicit, but long, and easy to mistake for `--follow-symlinks`.
- `--symlinks`: short like `--dot`, but it doesn't say it is only for globs.

## Decision

We will use these names:

- Command line: `--glob-symlinks`, with a hidden `--no-glob-symlinks` to override the environment variable.
- `lint` API option: `globSymlinks`, matching `dot` for `--dot`.
- Environment variable: `CSPELL_GLOB_SYMLINKS`.
- `enableGlobSymlinks` is kept for a configuration setting, if one is added later (see
  [0003](./0003-where-it-can-be-set.md)).

The help text is: "Follow symbolic links when matching globs."

## Consequences

- The names become public as soon as the option ships. Renaming later needs a deprecation.
- "glob" in the name sets it apart from `--follow-symlinks`.
