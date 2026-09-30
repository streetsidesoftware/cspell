# 0004. Files are reported by the path through the link, and each path is checked

Status: Accepted

## Context

With link following on, tinyglobby reports a file under the path through the link: `docs/guide.md` when `docs` is a
link, not the link's target. The same file can be found by more than one path, for example through a link and directly,
or through a link that points to a parent directory. tinyglobby (through fdir) stops a link loop after one level.

The options weighed:

- Check every path as found.
- Check each file once, under the first path found, and skip the rest.
- Check each file once, preferring a path without links.

Checking each file once needs the real path of every result, and the choice of name depends on search order, or on
waiting for the whole search to finish.

## Decision

We will check every path as it is found, and report it by that path. Link loops are stopped by the glob library. A file
reached by two paths is checked, and reported, twice.

## Consequences

- Reports, `ignorePaths`, `.gitignore`, and configuration lookups all use the path the user sees.
- No extra work per file, and results still stream.
- Duplicate issues are possible when a tree links to itself. This matches tools like `grep -R` and `find -L`.

<!---
    cspell:ignore fdir
-->
