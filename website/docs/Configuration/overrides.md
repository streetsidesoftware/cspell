---
title: Overrides
sidebar_position: 8
sidebar_label: Overrides
---

# Configuration Resolution & Overrides

CSpell determines the settings to use for a document in three stages:

1. **Choose which files to check** -- driven mostly by the command line (file globs, `--file`, `--exclude`,
   `--gitignore`, `--dot`, `--max-file-size`, ...) together with the configuration's `files` and `ignorePaths`.
   See [Understanding CSpell Globs](../globs.md).
1. **Load and merge configuration** -- gather the default configuration, configuration file(s), and a small
   number of CLI flags into one merged settings object. See [Loading Configuration](#stage-2-loading-configuration) below.
1. **Finalize settings for the document** -- apply **`overrides`** and **`languageSettings`** that match the
   document, then apply any in-document directives. See [Finalizing Settings](#stage-3-finalizing-settings) below.

Most command line flags belong to stage 1 (deciding which files to check) or control the CLI's own reporting
(`--no-progress`, `--show-suggestions`, `-v`/`--verbose`, `--color`, `--reporter`, ...). Those always take effect
and never participate in the settings merge described on this page.

## Stage 2: Loading Configuration

CSpell merges settings from the following sources, in order. Later sources override earlier ones for individual
settings (see [Merge Rules](#merge-rules) below for how array-like settings are combined instead of overwritten).

1. **Default Configuration** -- the settings built into `cspell` (disable with `--no-default-configuration`).
1. **The project configuration file** -- found by searching upward from the current directory (or `--root`), or
   given explicitly with `--config <path>`. Any files it `import`s are merged in first, with the file's own
   settings merged in last so it always wins over what it imports.
1. **A few CLI flags that adjust settings directly** -- `--dictionary <name>` / `--disable-dictionary <name>`
   (enable/disable dictionaries) and `--report <level>` (which categories of unknown words to report).
1. **The document's own configuration file** -- a second, independent search that starts at each document's own
   directory and walks upward. It overrides everything above it. (Skipped when `--no-config-search` is used, or
   when `--config` is given explicitly.)

This means a `cspell.json` placed next to (or above) an individual file always wins over the configuration file
found from the current working directory.

### Merge Rules

Most individual settings will overwrite the settings from the previous step / file. There are a few important exceptions.

#### Array Settings are Unions

Most Array like settings are joined as a union. In most cases order is preserved.

**Examples:**

- Word lists like: `words`, `flagWords`, `ignoreWords` are the union of all the settings. The order is not preserved.
- `overrides` and `languageSettings` are accumulated in the order they were loaded to be applied later.
- `patterns`, `includeRegExpList`, and `ignoreRegExpList` are collected in order so that patterns of the same name can be replaced.
- `dictionaryDefinitions` and `dictionaries` are collected in order so that dictionaries can be replaced by other dictionaries with the same name.

## Stage 3: Finalizing Settings

Once the merged configuration is loaded, CSpell finalizes the settings for each specific document, in order:

1. **`overrides`** -- settings from entries whose `filename` glob matches the document's path are applied.
1. **`languageSettings`** -- settings from entries whose `languageId` and/or `locale` match the document are
   applied. `--language-id` and `--locale` on the command line can force what a document is treated as for this
   matching step.
1. **In-document directives** -- comments like `cspell:ignore` or `cspell:words` in the document itself. These
   always win, and are applied last. See [In-Document Settings](./document-settings.md).

## Override Configuration Field: `overrides`

The `overrides` configuration is a useful way to force configuration on a per file basis.
The `filename` field is used to set the glob selection criteria.
When the path of the file being checked matches the glob/globs specified in `filename`, the override settings will be applied.

### Example Overrides

:::tip

**`filename`** can be a single glob or an array of globs.

:::

Example:

```javascript
"overrides": [
  {
    // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
    "filename": "**/{*.hrr,*.crr}",
    "languageId": ["cpp", "hpp"] // Set the languageId `cpp` and `hpp` overriding the defaults.
  },
  {
    // Force `*.txt` to use the Dutch dictionary (Dutch dictionary needs to be installed separately):
    "filename": "**/dutch/**/*.txt",
    "language": "nl",
  },
  {
    // Enable the `lorem-ipsum` dictionary for all test files.
    "filename": ["**/*.test.ts", "**/test/**"],
    "dictionaries": ["lorem-ipsum"]
  },
  {
    "filename": "**/images/**",
    "enabled": false // Disable spellchecking.
  }
]
```
