# Config search

## Why

When `cspell lint` checks a file, it also uses the config file nearest that file, and that config is merged on top of
the one cspell started with. That's on purpose: a config next to the files knows them best, such as a folder of German
docs with `language: de` ([#4750](https://github.com/streetsidesoftware/cspell/issues/4750)).

Few users are surprised by configs deeper in the project. What surprises them is config files in the current directory
or above it getting loaded:

- With `cspell lint --config ci/cspell.ci.json`, the `cspell.json` in the current directory is still loaded
  ([#4750](https://github.com/streetsidesoftware/cspell/issues/4750)). Until
  [#9635](https://github.com/streetsidesoftware/cspell/pull/9635), the docs said it wasn't.
- A config file in a parent folder, outside the project, is loaded for files in the project.

Turning off the per-file search (`--no-config-search` or `noConfigSearch`) keeps them out, but it also drops the configs
users want, such as the German docs folder. `--stop-config-search-at` was meant to limit how far up the search walks,
but it limits only the search at startup ([#7477](https://github.com/streetsidesoftware/cspell/issues/7477)).

## Overview

A config named on the command line replaces the configs where cspell runs. Configs deeper than that still apply. The
`--stop-config-search-at` flag says how far up to look instead.

`cspell lint` looks for configs twice:

- **At startup,** it loads one config: the file named with `--config`, or the nearest one found by searching up from
  the root. The root is `--root`, or the current directory.
- **For each file,** it searches from the file's folder upward, and merges the first config it finds on top of the
  startup config.

### A named config replaces the configs where cspell runs

With `--config`, the search for each file doesn't load a config from the root, from a folder above it, or from the
named config's own folder. Configs in folders below the root still apply.

```text
cspell.json
cspell.custom.json
i18n/de/cspell.json
```

```sh
cspell lint --config cspell.custom.json "**/*.md"
```

Here `cspell.json` isn't loaded, and `i18n/de/cspell.json` still applies to the files in `i18n/de/`. To use
`cspell.json` as well, import it from `cspell.custom.json`. The named config is merged after its imports, so it still
has the last word.

The reason: users who name a config expect it to replace the config where they run cspell, and a deeper config still
knows its files best. That gives users a rule they can state: the config I name replaces the one where I am, and configs
in the folders below still apply. The rule holds when cspell runs from a subfolder, too. From `pkg/a`,
`--config ../../cspell.ci.json` replaces `pkg/a/cspell.json`.

The named config's own folder counts because a config beside the named one is the one it replaces, as with
`cspell.json` beside `cspell.custom.json` above.

### The stop is the root

The search stops at the root, not where the root and the named config's folder meet. When the named config is above the
root or outside the project, the two meet above the project, and the project's own `cspell.json` would load again. When
they don't meet at all, such as on two drives, there is no meeting point.

### The stop flag is inclusive

With `--stop-config-search-at <dir>`, cspell looks for configs up to and including `<dir>`, and never above it. That
holds in both searches. With `--config`, the flag replaces the default above.

The reason: "stop at" reads as "look up to," and the startup search already treats the flag that way. The part users
need to be exclusive, keeping out the config where they run cspell, comes from `--config` itself, so the flag doesn't
need to be.

It also gives users who want today's behavior a way back. From `pkg/a`, this loads `pkg/a/cspell.json` too:

```sh
cspell lint --config ../../cspell.ci.json --stop-config-search-at . "*.md"
```

For a config further up, they name that folder.

### Without `--config`, nothing changes

The startup search still walks up from the root, so running cspell from a subfolder of a project still finds the
project's config. The default can't tell that config from one in a parent folder outside the project, so keeping that
one out still takes `--stop-config-search-at`.

### No config setting for now

There's no `stopConfigSearchAt` config setting for now. Most users never set a stop, and the flag covers the cases that
need one. A setting ([#7477](https://github.com/streetsidesoftware/cspell/issues/7477)) could be added later.
