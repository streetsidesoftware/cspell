---
layout: default
title: Globs
categories: docs
# parent: Docs
nav_order: 4
---

# Globs

CSpell uses globs to decide which files to check and which settings apply to a file. The same glob can match
different files depending on where it is used.

## Where Globs Are Used

| Where                                 | Matching   | Used to                                 |
| ------------------------------------- | ---------- | --------------------------------------- |
| Globs on the command line and `files` | **strict** | Search for the files to check.          |
| `ignorePaths` and `--exclude`         | **loose**  | Skip files.                             |
| `overrides[].filename`                | **loose**  | Apply settings to the files that match. |

- **Strict** matching matches only what the glob says. `*` and `**` do not match names that start with `.`.
- **Loose** matching works like a `.gitignore` file. A glob can also match at any depth and match the contents of a
  folder, and `*` and `**` match names that start with `.`.

## Glob Syntax

- `*` matches any part of a file or folder name.
- `**` matches any number of folders, including none.
- `?` matches one character.
- `{md,txt}` matches any one of the comma-separated choices.
- `[abc]` matches one of the characters.
- `!(README.md|CHANGELOG.md)` matches any name except the ones listed.
- A leading `!` negates a glob. What it does depends on the setting: see [Negative Globs](#negative-globs).

Write globs with `/` between folder names, also on Windows.

## The Example Folder

The examples on this page use this folder as the root. Each file is listed with its full relative path.

```text
README.md
.hidden.md
.github/dependabot.yml
.github/workflows/ci.yml
docs/a.md
docs/.x.md
node_modules/x/a.md
sub/node_modules/y/b.md
test/a.md
a/test/b.md
```

## Glob Roots

A glob is relative to a folder, its root.

- Globs on the command line and `--exclude` globs are relative to the current working folder, or to the folder given
  with `--root`.
- A glob in a configuration file is relative to that file's `globRoot`. By default, `globRoot` is the folder that
  holds the configuration file, with these exceptions:
  - For a configuration file inside a `.vscode` or `.config` folder, it is the folder above that one.
  - For a `.vscode/cspell.json` without a `version` field, or a configuration with `"version": "0.1"`, it is
    [`${cwd}`](#cwd).
- A glob that starts with `/` is tied to the root. In `ignorePaths`, `/test` matches `test/a.md` but not
  `a/test/b.md`.
- A glob that starts with `**/` is tested against the file's full path, so folders above the root count. See
  [A Project Inside a `node_modules` Folder](#a-project-inside-a-node_modules-folder).

### `${cwd}`

`${cwd}` stands for the current working folder.

- Set `globRoot` to `${cwd}` to make the globs in a configuration file relative to where `cspell` runs, instead of
  to the configuration file.
- Start a glob with `${cwd}` to make that one glob relative to the current working folder: `${cwd}/docs`.

**`cspell.json`**

```json
{
  "globRoot": "${cwd}",
  "ignorePaths": ["/docs"]
}
```

With this file in `project/`, running `cspell "**"` from `project/` ignores `project/docs`. Running it from
`project/sub/` ignores `project/sub/docs` instead.

### Configuration Files Next to the Documents

For each file it checks, CSpell also loads the configuration file nearest that file. Its `ignorePaths` and
`overrides` apply to that file, relative to that configuration file's own `globRoot`. A `sub/cspell.json` with
`"ignorePaths": ["/drafts"]` skips the files in `sub/drafts`.

## Strict Matching: the Command Line and `files`

The globs on the command line select the files to check: `cspell "**/*.md"`. When there are none, CSpell uses `files`
from the configuration. A glob in `files` matches the same files as on the command line, except where noted.

- `cspell "*.md"` checks only the Markdown files in the root, here `README.md`.
- `cspell "**/*.md"` checks Markdown files at any depth, except names that start with `.` and files inside folders
  that start with `.`.
- `cspell docs` checks all files in the `docs` folder. This works for any existing folder, such as `docs/api`.
- `cspell .` checks all files.
- A glob ending in `/**` also matches a file with that name. `cspell "**/test/**"` also checks a file named `test`.
- On the command line, a glob that starts with `/` is an absolute path. In `files`, a leading `/` ties the glob to
  the root.
- A glob that starts with `!` skips the files it matches, using [loose matching](#what-loose-matching-adds).
  `cspell "**/*.md" "!test"` skips both `test/a.md` and `a/test/b.md`. So does `["**/*.md", "!test"]` in `files`.

### Dot Files and Folders

By default, `*` and `**` do not match names that start with `.`, such as `.github` or `.hidden.md`.

- Use `--dot` on the command line, or `"enableGlobDot": true` in the configuration, to include them.
- A glob that names the dot explicitly matches without `--dot`: `cspell "**/.*"` checks `.hidden.md` and
  `docs/.x.md`.
- Without `--dot`, the search does not enter folders that start with `.`. A glob that starts with the folder's name
  still works: `cspell ".github/**"` checks the files in `.github`, but `cspell "**/.github/**"` checks nothing.

`--dot` and `enableGlobDot` only change strict matching. Loose matching always matches dot files.

## Loose Matching: `ignorePaths`, `--exclude`, and Overrides

`ignorePaths`, `--exclude`, and `overrides[].filename` use loose matching.

### What Loose Matching Adds

| Glob                 | Examples                        | Matches                                                                                   |
| -------------------- | ------------------------------- | ----------------------------------------------------------------------------------------- |
| No `/`               | `node_modules`, `*.md`          | The name at any depth, and everything inside a folder with that name.                     |
| A `/` before the end | `/src`, `lib/src`, `**/.github` | The path, and everything inside a folder with that path.                                  |
| Ends with `/`        | `.github/`, `/src/`, `lib/src/` | Only the contents of the folder. A single name, such as `.github/`, matches at any depth. |
| Ends with `**`       | `node_modules/**`, `**/test/**` | As written.                                                                               |

As in strict matching, a glob ending in `/**` also matches a file with that name: `**/test/**` matches a file named
`test`.

In overrides, these extra matches can be disabled with
[`overrideGlobsMatchFilesOnly`](./Configuration/overrides.md#globs-that-match-files-only). With it enabled,
`examples.ts` matches only a file named `examples.ts`, not the files inside a folder with that name, and `src/**`
matches only the files inside `src`, not a file named `src`.

A consequence of these rules: an override with `"filename": "**/test"` applies to a file named `test` and also to
every file inside a `test` folder. Use `test/` for the files inside `test` folders only.

### `--exclude`

Globs given with `--exclude` use loose matching, with these differences from `ignorePaths`:

- Without `--exclude`, CSpell skips `node_modules/**`. That is only the `node_modules` folder in the root. Any
  `--exclude` replaces this default.
- A leading `/` does not tie a name without other slashes to the root: `--exclude /test` skips both `test/a.md` and
  `a/test/b.md`. `--exclude /test/` skips only `test/a.md`.
- A glob that matches at any depth is tested against the full path, as if it started with `**/`. This applies to
  `node_modules`, `node_modules/`, `/**/node_modules/**`, and `${cwd}/**/node_modules/**`.

## What Each Glob Matches

The files each glob matches in [the example folder](#the-example-folder), without `--dot`. The `ignorePaths` column
also applies to `overrides[].filename`.

| Glob                 | Command line and `files`                                                | `ignorePaths` and overrides                      | `--exclude`                |
| -------------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| `*.md`               | `README.md`                                                             | All `.md` files                                  | Same as `ignorePaths`      |
| `**/*.md`            | All `.md` files except `.hidden.md` and `docs/.x.md`                    | All `.md` files                                  | Same as `ignorePaths`      |
| `docs`               | `docs/a.md`                                                             | `docs/a.md`, `docs/.x.md`                        | Same as `ignorePaths`      |
| `test`               | `test/a.md`                                                             | `test/a.md`, `a/test/b.md`                       | Same as `ignorePaths`      |
| `/test`              | Nothing                                                                 | `test/a.md`                                      | `test/a.md`, `a/test/b.md` |
| `test/`              | `test/a.md`                                                             | `test/a.md`, `a/test/b.md`                       | Same as `ignorePaths`      |
| `/test/`             | Nothing on the command line, `test/a.md` in `files`                     | `test/a.md`                                      | Same as `ignorePaths`      |
| `test/**`            | `test/a.md`                                                             | `test/a.md`                                      | Same as `ignorePaths`      |
| `**/test/**`         | `test/a.md`, `a/test/b.md`                                              | `test/a.md`, `a/test/b.md`                       | Same as `ignorePaths`      |
| `node_modules`       | `node_modules/x/a.md`                                                   | `node_modules/x/a.md`, `sub/node_modules/y/b.md` | Same as `ignorePaths`      |
| `node_modules/`      | `node_modules/x/a.md`                                                   | `node_modules/x/a.md`, `sub/node_modules/y/b.md` | Same as `ignorePaths`      |
| `node_modules/**`    | `node_modules/x/a.md`                                                   | `node_modules/x/a.md`                            | Same as `ignorePaths`      |
| `**/node_modules/**` | `node_modules/x/a.md`, `sub/node_modules/y/b.md`                        | `node_modules/x/a.md`, `sub/node_modules/y/b.md` | Same as `ignorePaths`      |
| `.github`            | The files in `.github`                                                  | The files in `.github`                           | Same as `ignorePaths`      |
| `.github/`           | The files in `.github`                                                  | The files in `.github`                           | Same as `ignorePaths`      |
| `.github/**`         | The files in `.github`                                                  | The files in `.github`                           | Same as `ignorePaths`      |
| `**/.github`         | Nothing                                                                 | The files in `.github`                           | Same as `ignorePaths`      |
| `**/.github/**`      | Nothing                                                                 | The files in `.github`                           | Same as `ignorePaths`      |
| `**/.github/*`       | Nothing                                                                 | The files in `.github`                           | Same as `ignorePaths`      |
| `**`                 | All files except `.hidden.md`, `docs/.x.md`, and the files in `.github` | All files                                        | Same as `ignorePaths`      |

## Negative Globs

A glob that starts with `!` behaves differently in each setting.

- On the command line and in `files`, it skips the files it matches: `cspell "**/*.md" "!test"`. See
  [Strict Matching](#strict-matching-the-command-line-and-files).
- In `ignorePaths` and `--exclude`, it is not used. CSpell warns, for example
  `Negative glob exclusions are not supported: !docs/a.md`, and applies the other globs.
- In `overrides[].filename`, it removes files from the match. When several globs match a file, the last one wins:
  `["**/*.md", "!docs/**"]` matches every Markdown file outside `docs`.

## How CSpell Selects the Files to Check

### Resolving the Configuration

CSpell first resolves the configuration: the configuration file it starts with, the files it imports, and the
command-line options. [Loading Configuration](./Configuration/overrides.md#loading-configuration) explains where the
configuration file comes from.

### Finding Files

The resolved configuration is used to find files.

- The globs come from the command line, or from `files` when there are none.
- Files and folders that match `ignorePaths` or `--exclude` are skipped. CSpell does not look inside a skipped
  folder, so a glob that names a file inside one finds nothing.
- Files covered by [`ignorePathPresets`](./Configuration/auto_properties.md#settings-ignorepathpresets), such as git's
  own files and nested git worktrees, are skipped.

### Checking Each File

Before checking a file, CSpell loads the configuration file nearest it: the first one found in the file's folder or
the folders above it. Its `ignorePaths` can still skip the file, and so can an override that sets `"enabled": false`.
`--no-config-search` turns this off.

Files given with `--file`, `--files`, or `--file-list` are not searched for. They are still filtered:

- by the globs on the command line, or by `files` when there are none;
- by `ignorePaths` and `--exclude`;
- by the configuration file nearest each file, as above.

Use `--force-check` to check them anyway. Files covered by `ignorePathPresets` are skipped even with `--force-check`.

- `--file` and `--files` cannot be combined with globs on the command line.
- `--file-list` can be. The globs then filter the list.
- `--force-check` cannot be combined with globs on the command line.

## Recipes

### Ignore `node_modules`

**`cspell.json`**

```json
{
  "ignorePaths": ["node_modules/"]
}
```

This skips the contents of every `node_modules` folder under the root. Without it, CSpell skips only the
`node_modules` folder in the root, and only when no `--exclude` is given.

### A Project Inside a `node_modules` Folder

A glob that starts with `**/` is tested against the full path. When the root itself is inside a `node_modules`
folder, for example when checking an installed package, `**/node_modules/**` matches every file:

```text
$ cd node_modules/my-package
$ cspell "**"            # with "ignorePaths": ["**/node_modules/**"]
No files found to check.
```

These globs skip only `node_modules` folders under the root, and keep the files in `node_modules/my-package`:

- `node_modules/`
- `node_modules`
- `/**/node_modules/**`
- `${cwd}/**/node_modules/**`

[`--exclude`](#--exclude) treats some of these globs differently. `--exclude node_modules/` and
`--exclude /**/node_modules/**` also report `No files found to check.` `--exclude /node_modules` keeps the files in
`node_modules/my-package` and skips the `node_modules` folders under it.

### A File Named `.git`

In a git worktree or a submodule, `.git` is a file instead of a folder.

- On the command line and in `files`, `**/.git` matches only files named `.git`.
- In `ignorePaths` and overrides, `.git` and `**/.git` match files named `.git` and everything inside `.git`
  folders. `.git/` matches only what is inside `.git` folders.
- In an override, a negative glob limits the match to files named `.git`:

**`cspell.json`**

```json
{
  "overrides": [
    {
      "filename": ["**/.git", "!.git/"],
      "enabled": false
    }
  ]
}
```

With [`overrideGlobsMatchFilesOnly`](./Configuration/overrides.md#globs-that-match-files-only) enabled, `.git` in an
override matches only files named `.git`:

**`cspell.json`**

```json
{
  "features": {
    "overrideGlobsMatchFilesOnly": true
  },
  "overrides": [
    {
      "filename": ".git",
      "enabled": false
    }
  ]
}
```
