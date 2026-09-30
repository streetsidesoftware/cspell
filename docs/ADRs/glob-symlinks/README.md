# Glob Symlinks

An opt-in way for `cspell lint` glob searches to follow symbolic links. Glob searches have skipped links since cspell
switched to `fast-glob` in 2023, and the decisions here set how following them is turned on and how far it goes.

## Why

- Glob searches never follow symbolic links: linked files are skipped, and linked directories are not searched. There
  is no way to change this.
- Some build systems lay out their inputs as links. Bazel runfiles are the known case: every file in the tree is a link
  into another directory, so a glob search there finds nothing. Requested in
  [#7700](https://github.com/streetsidesoftware/cspell/issues/7700).
- `--follow-symlinks` already lets `--file` and `--file-list` documents be read through links. Globs need their own
  switch, the same way `--dot` controls dot files for globs.

## Stakeholders

- **People who check trees made of links, such as Bazel runfiles:** they can run `cspell lint "**" --glob-symlinks`
  instead of generating a file list.
- **Everyone else:** nothing changes. Glob searches keep skipping links unless the option is turned on.
- **Maintainers:** one more option to support, in the glob search only.

## Goal

A user can check a tree whose files are symbolic links with a glob, by adding `--glob-symlinks` to the command line or
setting `CSPELL_GLOB_SYMLINKS=true`.

## Out of scope

- Following links for `--file`, `--files`, and `--file-list` documents. That is `--follow-symlinks`.
- Setting the option in a cspell configuration file. See [0003](./0003-where-it-can-be-set.md).
- Reading each file only once when several paths lead to it. See [0004](./0004-reported-paths-and-duplicates.md).

## Decisions

| #   | Title | Status |
| --- | ----- | ------ |
