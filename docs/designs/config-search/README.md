# Config search

## Why

When `cspell lint` checks a file, it also uses the config file nearest that file, and that config is merged on top of
the one cspell started with. That's on purpose: a config next to the files knows them best, such as a folder of German
docs with `language: de` ([#4750](https://github.com/streetsidesoftware/cspell/issues/4750)).

Few users are surprised by configs deeper in the project. What surprises them is config files in the current directory
or above it getting loaded:

- With `cspell lint --config ci/cspell.ci.json`, the `cspell.json` in the current directory is still loaded
  ([#4750](https://github.com/streetsidesoftware/cspell/issues/4750)). Until
  [#9635](https://github.com/streetsidesoftware/cspell/pull/9635), the docs said that with `--config`, the nearest
  config wasn't used for any file.
- A config file in a parent folder, outside the project, is loaded for files in the project.

Turning off the per-file search (`--no-config-search` or `noConfigSearch`) keeps them out, but it also drops the configs
users want, such as the German docs folder. The `--stop-config-search-at` flag was meant to limit how far up the
search walks, but it limits only the search at startup ([#7477](https://github.com/streetsidesoftware/cspell/issues/7477)).

## Overview

A config named on the command line replaces the configs at the root and above it. The root is where cspell runs,
unless `--root` names another folder. For the files under the named config's own folder, it also replaces the configs
in that folder and above it. Configs in the folders below still apply. The `--stop-config-search-at` flag lets you
choose how far up the search looks.

`cspell lint` looks for configs twice:

- **At startup,** it loads one config: the file named with `--config`, or the nearest one found by searching up from
  the root.
- **For each file,** it searches from the file's folder upward, and merges the first config it finds on top of the
  startup config.

### With `--config`, the search stops at the root and at the named config's folder

With `--config`, the search for each file stops when it reaches the root or the named config's folder, without looking
in that folder. So it doesn't load the root's config, a config above the root, or the config beside the named one. A
config in a parent folder outside the project stays out too. Configs the search finds before it reaches either folder
still apply.

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

The named config's folder is a stop too, because a config beside the named one is the one it replaces. It works like
the root: for the files under that folder, no config in it or above it loads, except the named config. From the top of
the project, `--config packages/foo/cspell.strict.json` replaces `packages/foo/cspell.json` for the files in
`packages/foo/`. Without a `packages/foo/cspell.json`, the search for those files used to reach `packages/cspell.json`.
Now it stops at `packages/foo/`. To keep `packages/cspell.json`, import it from `cspell.strict.json`, or pass
`--stop-config-search-at packages`.

### The root, not where the paths meet

The search stops at the root, not at the nearest folder that holds both the root and the named config. When the named
config is above the root or outside the project, that folder is above the root. The search would then still load the
root's config, the one the named config replaces. On two drives, there is no such folder.

### The stop flag is inclusive

With `--stop-config-search-at <dir>`, a search that reaches `<dir>` looks in it and goes no further. That holds in both
searches. With `--config`, a stop you give takes the place of the root and the named config's folder as stops, for the
files under its folder. Every other file still stops at those, so a file outside the given stops still doesn't load the
configs the named config replaces.

A stop limits only the searches that reach it. A stop below the root doesn't keep out the config cspell starts with,
which still applies to every file. That way, several stops can be given at once, each for the files under it.

The reason: "stop at" reads as "look up to," and the startup search already treats the flag that way. Users need the
config where they run cspell kept out, which takes a stop that doesn't look in its folder. Naming a config already does
that, so the flag can stay inclusive.

It also gives users who want today's behavior a way back. From `pkg/a`, this loads `pkg/a/cspell.json` too:

```sh
cspell lint --config ../../cspell.ci.json --stop-config-search-at . "*.md"
```

For a config further up, they name that folder. So with `--config`, a stop you give brings configs back when it's at or
above where a file's search would stop anyway: the root, or the named config's folder for the files under it. A stop
below that narrows the search.

### Without `--config`, the default doesn't change

The startup search still walks up from the root, so running cspell from a subfolder of a project still finds the
project's config. The search can't tell that config from one in a parent folder outside the project. Keeping the
parent's config out still takes `--stop-config-search-at`.

### Existing setups

A setup that names a config, with `--config`, `CSPELL_CONFIG_PATH`, or cspell-action's `config` input, sees a change
when both are true:

- The named config isn't the one cspell would find on its own from the root.
- A config it no longer loads holds settings the setup needs. That's a config in the root or above it, or, for the
  files under the named config's folder, a config in that folder or above it.

A command that passes `--stop-config-search-at` can see a change too, with or without `--config`: the search for each
file now stops at that folder. Before, the flag limited only the search at startup. With the root or a folder above it,
the command still loads the configs up to that folder.

To keep the old behavior:

- Import the replaced config from the named config. The named config's own settings then win, where before the
  replaced config's did. The imported config also applies to files that have a config of their own further down.
- Pass `--stop-config-search-at` with the folder that holds the replaced config. Configs up to that folder load as
  before. cspell-action has no input for this flag.

There's no flag or config setting to turn the new default off, for now. One could be added later if someone needs
exactly the old behavior where the flag can't be passed, such as in cspell-action.

### No config setting for now

There's no `stopConfigSearchAt` config setting for now. Most users never set a stop, and on the command line the flag
covers the cases that need one. A setting ([#7477](https://github.com/streetsidesoftware/cspell/issues/7477)) could be
added later.

### cspell works out the stops, and cspell-lib takes them

cspell works out where each search stops, and passes the result to cspell-lib. It resolves the folders given on the
command line, and the stops that come from naming a config. cspell-lib doesn't resolve relative paths, and doesn't know
about command-line options. A stop it's given is inclusive unless it's marked exclusive, so a plain folder means the
same everywhere.

The reason: input people write, such as a command-line flag, comes in many forms, and cspell is where it arrives. A
program that calls cspell-lib can pass exact values.
