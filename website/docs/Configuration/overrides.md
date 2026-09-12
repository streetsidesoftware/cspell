---
title: Overrides
sidebar_position: 8
sidebar_label: Overrides
---

# Configuration Resolution & Overrides

Checking a file is a two step process:

1. [**Determine which files to check.**](#step-1-determine-which-files-to-check)
1. [**Determine the settings, and check the document.**](#step-2-determine-the-settings-and-check-the-document)

## Step 1: Determine Which Files to Check

This is based on the command line together with the configuration file loaded at start up (the file nearest
the current directory, or the one given with `--config`).

- If globs are given on the command line, they are used to search for matching files. (If none are given, the
  configuration's `files` setting is used as the globs instead.) The results are filtered against the
  configuration's `ignorePaths` (plus any `--exclude` globs) and against `.gitignore` (unless `--no-gitignore`
  is used).
- If `--file`, `--files`, or `--file-list` is used, those are treated as exact file names instead of globs. They
  are still filtered against `ignorePaths`/`--exclude` and `.gitignore` by default -- unless `--force-check` is
  given, which checks them anyway. (When globs are also given on the command line, `--file`/`--file-list`
  entries must additionally match one of those globs.)

See [Understanding CSpell Globs](../globs.md) for glob syntax.

## Step 2: Determine the Settings and Check the Document

Once a file has been selected, CSpell determines its settings and checks it.

### Loading Configuration

CSpell merges settings from the following sources, in order. Later sources override earlier ones for individual
settings (see [Merge Rules](#merge-rules) below for how array-like settings are combined instead of overwritten).

1. **Default Configuration** -- the settings built into `cspell` (disable with `--no-default-configuration`).
1. **The configuration loaded at start up** -- the same configuration file used in Step 1, found by searching
   upward from the current directory (or `--root`), or given explicitly with `--config <path>`. Any files it
   `import`s are merged in first, with the file's own settings merged in last so it always wins over what it
   imports. A few CLI flags adjust these settings directly: `--dictionary <name>` / `--disable-dictionary <name>`
   (enable/disable dictionaries) and `--report <level>` (which categories of unknown words to report).
1. **The configuration nearest the document** -- found by a second, independent search that starts at the
   document's own directory and walks upward. It overrides everything above it. (Skipped when
   `--no-config-search` is used, or when `--config` is given explicitly.)

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

### Finalizing Settings

Once the configuration is merged, CSpell finalizes the settings for the document, in order:

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
