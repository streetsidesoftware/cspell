# Glob Symlinks

**tl;dr:** `cspell lint --glob-symlinks`, or `CSPELL_GLOB_SYMLINKS=true`, makes glob searches follow symbolic links, so
a tree made of links can be checked with a plain glob. It's off by default. It's separate from `--follow-symlinks`,
which covers documents named one by one. It can't be set in a configuration file, because whether a search may leave
the repository is up to whoever runs cspell. Followed links may point anywhere, and files are reported by the path
through the link.

This describes the design when it merged, in [#9342](https://github.com/streetsidesoftware/cspell/pull/9342). The
code and the docs are the source of truth.

## Why

Glob searches in `cspell lint` skip symbolic links: a linked file isn't checked, and a linked directory isn't searched.
cspell has worked this way since it switched its glob library to `fast-glob` in 2023. `fast-glob` follows links unless
told not to, and cspell chose to turn that off. There was no way to turn it back on.

Some build systems lay out their inputs as links. Bazel runfiles are the known case
([#7700](https://github.com/streetsidesoftware/cspell/issues/7700)): every file in the runfiles tree is a link into the
source tree or Bazel's cache. Running `cspell lint "**"` there finds nothing to check. The only workaround was to
generate a file list and pass it with `--file-list`.

At the same time, `--follow-symlinks` ([#9340](https://github.com/streetsidesoftware/cspell/pull/9340)) made cspell
skip `--file`, `--files`, and `--file-list` documents reached through links unless the user allows them. Glob searches
needed their own switch, the same way `--dot` controls dot files for globs.

Everyone who doesn't ask for it should see no change.

### Out of scope

- Following links for `--file`, `--files`, and `--file-list` documents. That's `--follow-symlinks`.
- A configuration setting. See the choices below.

## Design

### Turning it on

```sh
cspell lint "**" --glob-symlinks
CSPELL_GLOB_SYMLINKS=true cspell lint "**"
CSPELL_GLOB_SYMLINKS=true cspell lint "**" --no-glob-symlinks
```

- The command line wins over the environment variable. `--no-glob-symlinks` exists so a single run can turn it off
  when CI sets the variable. It's hidden from `--help`, like `--no-follow-symlinks`.
- The environment variable accepts the usual true values: `true`, `yes`, `on`, `1`, or `t`, in any case.
- Programs that call the `lint` API pass `globSymlinks: true`, named to match `dot` for `--dot`. When it's not set, the
  environment variable applies.
- The default is off.

### What happens when it's on

Take a tree where `docs` is a link to `../shared/docs`, and `README.md` is a link to a file in Bazel's cache.
`cspell lint "**" --glob-symlinks` then:

- searches `docs` as if it were a directory, and checks the files in it;
- checks `README.md`, reading the file the link points to;
- reports files by the path through the link, such as `docs/guide.md`, not by the link's target.

Because the reported path is the one the user sees, everything that matches on paths uses it too: `ignorePaths`,
`.gitignore`, `overrides`, and the search for configuration files. A configuration file next to the link's target
isn't used; the search starts from the path through the link.

Since `--follow-symlinks`, cspell won't read a document reached through a link unless that's allowed. Files found by
a glob search with `--glob-symlinks` on are allowed, so `--follow-symlinks` isn't needed as well.

Links may point anywhere: outside the directory being searched, and outside the repository.

A file that can be reached by two paths, for example through a link and directly, is checked and reported once for
each path. A link that loops back to a parent directory is followed one level, and the search goes no deeper down
that path.

### What happens when it's off

Nothing changes from before: linked files are skipped, and linked directories aren't searched. A glob that only makes
sense through a link, such as `linked-dir/**/*.md` where `linked-dir` is a link, isn't searched at all. With
`--verbose`, cspell says which glob was skipped and why.

### How it relates to `--follow-symlinks`

| Option              | Applies to                                                     | Environment variable     |
| ------------------- | -------------------------------------------------------------- | ------------------------ |
| `--follow-symlinks` | documents named one by one: `--file`, `--files`, `--file-list` | `CSPELL_FOLLOW_SYMLINKS` |
| `--glob-symlinks`   | files found by glob searches                                   | `CSPELL_GLOB_SYMLINKS`   |

Both are off by default, and neither can be set in a configuration file.

### Choices

#### A separate option, not `--follow-symlinks`

`--follow-symlinks` decides whether a document the user names one by one may be read through a link. Following links
during a glob search is a different decision: it changes which directories are searched, the way `--dot` does for dot
files. One flag for both would make it impossible to allow one without the other.

Turned down:

- **Leave globs as they are,** and point people to `--file-list` with `--follow-symlinks`. That works, but every user
  with a tree of links has to generate a file list.
- **Make `--follow-symlinks` also apply to glob searches.** See above.

#### The name `--glob-symlinks`

"glob" in the name sets it apart from `--follow-symlinks`, and reads like `--dot`, the other option that changes what a
glob search finds.

Turned down:

- **`--follow-symlinks-in-globs`:** explicit, but long, and easy to mistake for `--follow-symlinks`.
- **`--symlinks`:** short like `--dot`, but it doesn't say it's only for globs.

#### Command line, API, and environment, not configuration

A configuration file usually lives in the repository being checked. Following links can take a search outside that
repository, to wherever the links point. Whether a search may leave the tree it started in is a choice for the person
or workflow running cspell, not for the files being checked. `--follow-symlinks` can be set in the same places, for
the same reason. Projects that want it on for every run set the environment variable, for example in CI.

Adding a configuration setting later is safe, and removing one after it ships would break configs, so it starts
without one. If one is added, its name is `enableGlobSymlinks`, matching `enableGlobDot` for `--dot`.

Turned down:

- **A configuration setting too,** like `enableGlobDot`. A repository could then turn on following links by itself.
- **A configuration setting, but only for links that stay inside the root.** It's a second rule to explain, and it
  wouldn't help Bazel (see below).

#### Links may point anywhere

Bazel runfiles link into the source tree and Bazel's cache, both outside the runfiles directory. Limiting links to
targets inside the root would make the option useless there. Turning the option on means trusting the links in the
searched tree, as with `--follow-symlinks`.

Turned down:

- **Only links whose target stays inside the root.**
- **Inside the root by default, and anywhere with an explicit value.** Two modes to explain, for no known user.

#### Report the path through the link, and check every path

Reporting the path through the link keeps reports, ignores, and configuration lookups consistent with what the user
typed and sees. Checking every path as it's found adds no work per file, and results keep streaming as they're found.
Checking a file twice when a tree links to itself matches tools like `grep -R` and `find -L`.

Turned down:

- **Check each file once, under the first path found.** It needs the real path of every file found, and which path
  gets reported depends on the order of the search.
- **Check each file once, preferring a path without links.** The same cost, and the search has to finish before
  anything can be reported, so results stop streaming.

<!---
    cspell:ignore runfiles
-->
