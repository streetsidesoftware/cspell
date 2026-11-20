# Config search

## Why

The `cspell lint` command looks for configs twice:

- **At startup,** it loads one config: the file named with `--config`, or the nearest one found by searching up from
  the root. The root is where cspell runs, unless `--root` names another folder.
- **For each file,** it searches from the file's folder upward, and merges the first config it finds on top of the
  startup config.

The search for each file is on purpose: a config next to the files knows them best, such as a folder of German docs
with `language: de` ([#4750](https://github.com/streetsidesoftware/cspell/issues/4750)).

Few users are surprised by configs deeper in the project. What surprises them is config files in the current directory
or above it getting loaded:

- With `cspell lint --config ci/cspell.ci.json`, the `cspell.json` in the current directory is still loaded
  ([#4750](https://github.com/streetsidesoftware/cspell/issues/4750)). Until
  [#9635](https://github.com/streetsidesoftware/cspell/pull/9635), the docs said that with `--config`, the nearest
  config wasn't used for any file.
- A config file in a parent folder, outside the project, is loaded for files in the project.

Disabling the search for each file (`--no-config-search` or `noConfigSearch`) keeps them out, but it also drops the
configs users want, such as the German docs folder. The `--stop-config-search-at` flag was meant to limit how far up the
search walks, but it limits only the search at startup ([#7477](https://github.com/streetsidesoftware/cspell/issues/7477)).

## Overview

A config named on the command line replaces the configs at the root and above it. Configs in the folders below still
apply. The `--stop-config-search-at` flag lets you choose how far up the search looks.

### With `--config`, the search stops at the root

With `--config`, the search for each file stops when it reaches the root, without looking in it. So it doesn't load the
root's config or a config above the root. A config in a parent folder outside the project stays out too. Configs the
search finds before it reaches the root still apply.

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

The named config's folder isn't a stop. Where the named config sits doesn't change which configs other files load. A
stop there would check the files under that folder differently from the rest of the project: a surprising side effect
that nothing in the command shows, and one that made the rule hard to explain. From the top of the project, with
`--config packages/foo/cspell.strict.json`, the files in `packages/foo/` still load `packages/cspell.json`, or
`packages/foo/cspell.json` when there is one.

### The root, not where the paths meet

The search stops at the root, not at the nearest folder that holds both the root and the named config. When the named
config is above the root or outside the project, that folder is above the root. The search would then still load the
root's config, the one the named config replaces. On two drives, there is no such folder.

### The stop flag is inclusive

With `--stop-config-search-at <dir>`, a search that reaches `<dir>` looks in it and goes no further. That holds in both
searches. With `--config`, a stop you give at or above the root takes the place of the root as a stop. A stop below the
root only limits the search for the files under it, so a file outside the given stops still doesn't load the configs
the named config replaces.

The reason: "stop at" reads as "look up to," and the startup search already treats the flag that way. Users need the
config where they run cspell kept out, which takes a stop that doesn't look in its folder: an exclusive stop. Naming a
config already does that, so the flag can stay inclusive.

It also gives users who want today's behavior a way back. From `pkg/a`, this loads `pkg/a/cspell.json` too:

```sh
cspell lint --config ../../cspell.ci.json --stop-config-search-at . "*.md"
```

For a config further up, they name that folder. So with `--config`, a stop you give brings configs back when it's at or
above the root. A stop below the root narrows the search.

A stop limits only the searches that reach it. A stop below the root doesn't keep out the config cspell starts with,
which still applies to every file. Keeping it out would take a different starting config for the files under each
stop. Instead, several stops can be given at once, each limiting the search for the files under it.

### Without `--config`, the default doesn't change

The startup search still walks up from the root, so running cspell from a subfolder of a project still finds the
project's config. The search can't tell that config from one in a parent folder outside the project. Keeping the
parent's config out still takes `--stop-config-search-at`.

### cspell works out the stops, and cspell-lib takes them

The cspell command-line package works out where each search stops, and passes the result to cspell-lib. It resolves
the folders given on the command line, and works out the stops that come from naming a config. cspell-lib takes the
stops as given, and doesn't know about command-line options. A stop it's given is inclusive unless it's marked
exclusive, so a plain folder means the same everywhere. The search function that cspell uses at startup still accepts
relative paths, for now.

The reason: input people write, such as a command-line flag, comes in many forms, and cspell is where it arrives. A
program that calls cspell-lib can pass exact values.

### No config setting or opt-out for now

There's no `stopConfigSearchAt` config setting for now. Most users never set a stop, and on the command line,
`--stop-config-search-at` covers the cases that need one. A setting
([#7477](https://github.com/streetsidesoftware/cspell/issues/7477)) could be added later.

There's also no flag or config setting to disable the new default, for now. One could be added later if someone needs
exactly the old behavior where `--stop-config-search-at` can't be passed, such as in cspell-action.

### Existing setups

A setup that names a config, with `--config`, `CSPELL_CONFIG_PATH`, or cspell-action's `config` input, sees a change
when both are true:

- The named config isn't the one cspell would find on its own from the root.
- A config it no longer loads holds settings the setup needs: a config in the root or above it.

A command that passes `--stop-config-search-at` can see a change too, with or without `--config`: the search for each
file now stops at that folder. Before, the flag limited only the search at startup. With the root or a folder above it,
the command still loads the configs up to that folder.

To keep the old behavior:

- Import the replaced config from the named config. The named config's own settings then win, where before the
  replaced config's did. The imported config also applies to files that have a config of their own further down.
- Pass `--stop-config-search-at` with the folder that holds the replaced config. Configs up to that folder load as
  before. cspell-action has no input for this flag.
