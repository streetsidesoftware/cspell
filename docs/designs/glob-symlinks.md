# Glob Symlinks

**tl;dr:** `cspell lint --glob-symlinks` (or `CSPELL_GLOB_SYMLINKS=true`) makes glob searches follow symbolic links.
It's off by default, separate from `--follow-symlinks`, and can't be set in a configuration file. Followed links may
point anywhere, and files are reported by the path through the link.

This describes the design when it merged, in [#9342](https://github.com/streetsidesoftware/cspell/pull/9342). The
code and the docs are the source of truth.

## Why

Glob searches have skipped symbolic links since cspell switched to `fast-glob` in 2023: linked files aren't checked,
and linked directories aren't searched. Some build systems lay out their inputs as links. In Bazel runfiles every file
is a link into another directory, so a glob search there finds nothing
([#7700](https://github.com/streetsidesoftware/cspell/issues/7700)). Everyone else should see no change.

## Design

An opt-in flag, `--glob-symlinks`, makes glob searches follow links. The choices that shaped it:

- **A separate option, not `--follow-symlinks`.** `--follow-symlinks` is about documents named one by one with
  `--file` and `--file-list`. Following links in a glob changes which directories are searched, like `--dot` does for
  dot files. One flag for both would make it impossible to allow one without the other.
- **Named `--glob-symlinks`.** "glob" sets it apart from `--follow-symlinks`. The `lint` API option is `globSymlinks`,
  matching `dot`. `--follow-symlinks-in-globs` was turned down as long and easy to confuse, and `--symlinks` as not
  saying it's only for globs.
- **Command line, API, and environment only, not configuration.** A configuration file lives in the repository being
  checked, and following links can take a search outside it. Whether a search may leave its tree is a choice for whoever
  runs cspell. CI sets the environment variable. The name `enableGlobSymlinks` is kept for a configuration setting in
  case one is added later: adding one is safe, removing one isn't.
- **Links may point anywhere.** Bazel runfiles link into the source tree and Bazel's cache, so limiting links to targets
  inside the root would make the option useless there. Turning it on means trusting the links in the tree.
- **Each path is checked and reported as found.** A file is reported by the path through the link, so reports,
  `ignorePaths`, `.gitignore`, and configuration lookups all use the path the user sees, and results still stream. A
  file reached by two paths is checked twice, as with `grep -R` and `find -L`. Checking each file once would need the
  real path of every result, and the name chosen would depend on search order. The glob library stops link loops.

<!---
    cspell:ignore runfiles
-->
