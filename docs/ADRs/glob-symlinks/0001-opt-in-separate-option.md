# 0001. Glob searches follow links only when asked, with their own option

Status: Accepted

## Context

Glob searches in `cspell lint` skip symbolic links: tinyglobby is called with `followSymbolicLinks: false`. That has
been the setting since the switch from `glob` to `fast-glob` in 2023, where it was chosen on purpose (`fast-glob`
follows links by default). [#7700](https://github.com/streetsidesoftware/cspell/issues/7700) asks for a way to turn
following on, for Bazel runfiles.

The options weighed:

- Leave globs as they are, and point people to `--file-list` with `--follow-symlinks`.
- Make `--follow-symlinks` also apply to glob searches.
- Add a separate option for glob searches.

`--follow-symlinks` is about documents the user names one by one. Following links during a glob search is a different
decision: it changes which directories are searched, like `--dot` does for dot files. Folding both into one flag would
make it impossible to allow one without the other.

## Decision

We will add a separate option that makes glob searches follow symbolic links. It is off by default. `--follow-symlinks`
keeps applying only to `--file`, `--files`, and `--file-list` documents, and the new option applies only to glob
searches. It ships in the same release as `--follow-symlinks`.

## Consequences

- Existing command lines behave exactly as before. Following links in globs is something users turn on.
- Two options to explain. The help text and the website say which one applies to which files.
- A tree made of links can be checked with a plain glob.
