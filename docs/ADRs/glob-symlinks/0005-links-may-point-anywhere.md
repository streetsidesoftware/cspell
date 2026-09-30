# 0005. Followed links may point anywhere

Status: Accepted

## Context

Bazel runfiles, the case in [#7700](https://github.com/streetsidesoftware/cspell/issues/7700), are links from the
runfiles directory into other directories: the source tree and Bazel's cache. Limiting links to targets inside the root
would make the option useless there.

The options weighed:

- Follow links anywhere.
- Follow only links whose real path stays inside the root.
- Inside the root by default, and anywhere with an explicit value.

`--follow-symlinks` follows links anywhere.

## Decision

We will follow links wherever they point once `--glob-symlinks` is on. Turning it on means trusting the links in the
searched tree. Without the option, glob searches keep skipping links, including a glob whose fixed part goes through a
linked directory.

## Consequences

- It works for Bazel runfiles and similar layouts.
- One rule to explain. There is no second mode.
- Users turn it on only for trees whose links they trust, as with `--follow-symlinks`.

<!---
    cspell:ignore runfiles
-->
