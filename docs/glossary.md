# Glossary

Terms and concepts a maintainer needs to know, about cspell and this repo. Alphabetical.

Terms introduced by a single feature's ADRs are in the [ADR glossary](./ADRs/glossary.md).

## Bundled dictionaries

The dictionaries cspell loads by default, from the `@cspell/cspell-bundled-dicts` package. Its
`cspell-default.config.ts` imports each dictionary package's [`cspell-ext.json`](#cspell-extjson). The word lists
themselves live in [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts). See
[Bundled dictionaries](./build-and-packaging.md#bundled-dictionaries).

## Config file

A file such as `cspell.json`, `cspell.config.yaml`, or `cspell.config.js` that configures cspell. Its options are
defined in `packages/cspell-types/src/CSpellSettingsDef.ts`. See [Config resolution](#config-resolution).

## Config resolution

How cspell decides the settings for one document:

1. It merges the default configuration, the configuration loaded at start up, and the [config file](#config-file)
   nearest the document, including what they [`import`](#import).
1. It applies matching `overrides`, then matching `languageSettings`, then in-document directives, in that order.

Within each step, the last value wins for single values. Lists such as `words` and `dictionaries` are combined. See
[Configuration Resolution & Overrides](https://cspell.org/configuration/overrides/) on the website.

## cspell-ext.json

The config file a dictionary package exports. It defines the package's dictionaries (`dictionaryDefinitions`) and
enables them for the right file types. [Bundled dictionaries](#bundled-dictionaries) and user configs load it with
`import`.

## cspell-tools

The `@cspell/cspell-tools` package, which compiles word lists into [trie](#trie) files. The dictionaries in
cspell-dicts are built with it.

## Dictionary definition

An entry in `dictionaryDefinitions`: a dictionary's `name`, and its `path` or inline words. Defining a dictionary
doesn't enable it: `dictionaries` lists the names in use, and `!name` turns one off.

## File type

The kind of a document, such as `typescript` or `markdown`, also called a language ID. `packages/cspell-filetypes`
maps file names to file types. `languageSettings` and `enabledFileTypes` use them.

## flagWords, ignoreWords, words

Inline word lists in a config file:

- `words` are considered correct.
- `flagWords` are always considered incorrect, and override `words`. An entry can suggest a replacement:
  `canot->cannot`.
- `ignoreWords` are never reported, even if they're also in `flagWords`.

## ignoreRegExpList

Regular expressions, or names of predefined patterns, for text to skip when checking. For example, `href` skips HTML
`href` values. `includeRegExpList` is the opposite: check only the matching text.

## import

A config option that loads other config files, and merges them in before this one. Shared configs and
[`cspell-ext.json`](#cspell-extjson) files are loaded this way. See
[Importing / Extending Configuration](https://cspell.org/configuration/imports/).

## Maintainers and contributors

People who work on this repo: writing code, reviewing PRs, and releasing. `docs/` and `CONTRIBUTING.md` are written for
them. Compare [users](#users).

## Parser and plugin

A parser splits a document into pieces of text to check, with context, before checking. A plugin provides parsers.
The `parser` and `plugins` options select them. Both are experimental. Parsers are published from
[cspell-parsers](https://github.com/streetsidesoftware/cspell-parsers).

## Prerelease mode

The `prerelease` and `prerelease-identifier` settings in `.github/release-drafter.yml`. While on, releases are
versioned like `10.3.4-alpha.0` and published to npm with the `next` dist-tag. See
[Releasing](./releasing.md#prerelease-mode).

## Release draft

The draft GitHub release, and the matching `chore: Prepare Release … (auto-deploy)` PR from the `release-draft`
branch, that the Release Drafter workflow rebuilds after every merge to `main`. See [Releasing](./releasing.md).

## Trie

The data structure cspell uses for dictionaries: `packages/cspell-trie-lib`. Dictionaries are shipped as compiled
`.trie` files, often gzipped, built by [cspell-tools](#cspell-tools).

## Users

People who use cspell: people running the cspell command-line tool, people writing cspell config, and projects that
use `cspell-lib` and the other published packages. The website, READMEs, doc comments on public APIs, and the release
notes are written for them. Compare [maintainers and contributors](#maintainers-and-contributors).

## Workflow Bot

The GitHub App that opens the automated PRs, such as `fix: Workflow Bot -- Update Dictionaries (main)` and
`ci: Workflow Bot -- Build Docs`. Keep the type a bot PR was opened with.

<!---
    cspell:ignore canot
-->
