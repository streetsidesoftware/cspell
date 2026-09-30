# 0003. Set on the command line, in the API, or in the environment, not in configuration

Status: Accepted

## Context

`--dot` can also be set in a configuration file as `enableGlobDot`. A configuration file usually lives in the
repository being checked. Following links can take a search outside that repository, to wherever the links point.
Whether a search may leave the tree it was started in is a choice for whoever runs cspell, not for the files being
checked. `--follow-symlinks` is settable in the same places for the same reason.

The options weighed:

- Command line, API, and environment variable only.
- Also the configuration, like `enableGlobDot`.
- Also the configuration, but only for links that stay inside the root.

## Decision

We will allow the option on the command line (`--glob-symlinks`), in the `lint` API (`globSymlinks`), and through the
`CSPELL_GLOB_SYMLINKS` environment variable. It can't be set in a configuration file for now. The command line wins over
the environment variable.

## Consequences

- A repository can't turn link following on by itself. The person or workflow running cspell decides.
- Projects that want it on for every run set the environment variable, for example in CI.
- A configuration setting (`enableGlobSymlinks`) can be added later without breaking anyone. Removing one after it
  ships would be a breaking change.
