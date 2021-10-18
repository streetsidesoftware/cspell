---
layout: default
title: Globs
categories: docs
# parent: Docs
nav_order: 4
---

# Globs

Globs are used extensively by CSpell to determine which files to check and what settings to apply.

Here are some of the places globs are used:

| Location               | Mode       | Note                                                                                                                                                            |
| ---------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files[]`              | **strict** | The glob patterns used to search for files to spell check.                                                                                                      |
| `ignorePaths[]`        | **loose**  | Glob patterns used to exclude files and directories from being checked. `!` are only partially supported due to an issue with the Glob library[<sup>1</sup>][1] |
| `overrides[].filename` | **loose**  | Used to apply configuration settings to file whose path matches the glob                                                                                        |

[1]: https://github.com/isaacs/node-glob/issues/409 'Glob - Does not match for negative ignore · Issue #409'

## Mode - Strict

Strict mode is used to explicitly select files to be checked. It gives more nuanced control over the file search process.

Examples:

| Glob                | Meaning                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `*.md`              | Only check the Markdown files in the current directory. It will not scan subdirectories.  |
| `**/*.md`           | Scan all directories (except _hidden_ ones starting with `.`) looking for markdown files. |
| `**/{*,.*}/**/*.md` | Scan all directories include _hidden_ ones looking for markdown files.                    |
| `src/**`            | Scan the `src` directory looking for all _non-hidden_ files.                              |

## Mode - Loose

Loose mode is used to match files that have been found. It is designed to emulate `.gitignore` rules closely.
By default, loose mode matches hidden files and directories.

Examples:

| Glob               | Meaning                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `*.md`             | Will match against any path containing `*.md`                                                                             |
| `node_modules`     | Will match against any path containing `node_modules`                                                                     |
| `/node_modules`    | Matches against `./node_modules` and all contained files. It will not match nested paths like: `./package/node_modules/*` |
| `/node_modules/`   | Matches the `./node_modules` directory and any files it contains.                                                         |
| `/node_modules/**` | Same as `/node_modules/`                                                                                                  |
| `test`             | Matches any directory or file called `test`. Equivalent to using both `**/test` and `**/test/**`.                         |
| `**/test/**`       | Similar to `test`, but only matches paths contained in a `test` directory.                                                |
