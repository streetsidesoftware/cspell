---
title: Overrides
sidebar_position: 8
sidebar_label: Overrides
---

# Overrides

The configuration used for a file is calculated by applying the configuration in two phases.
The first phase is to gather all the relevant configuration files and merge the settings.
The second phase is to finalize the configuration based upon the resulting **`overrides`** and **`languageSettings`**
that match the path name, `languageId`, and `locale`.

## Configuration Gathering

The spell checker gathers all the relevant configuration files and merges the settings from each file.

**Settings Gathering Order**

1. Default Configuration - the settings included in `cspell`.
1. Command line settings - the settings given on the command line.
1. Imports found in the configuration file. - any imports found in the configuration file loaded.
1. Configuration file - the settings found in the configuration file.

### Merge Rules

Most individual settings will overwrite the settings from the previous step / file. There are a few important exceptions.

#### Array Settings are Unions

Most Array like settings are joined as a union. In most cases order is preserved.

**Examples:**

- Word lists like: `words`, `flagWords`, `ignoreWords` are the union of all the settings. The order is not preserved.
- `overrides` and `languageSettings` are accumulated in the order they were loaded to be applied later.
- `patterns`, `includeRegExpList`, and `ignoreRegExpList` are collected in order so that patterns of the same name can be replaced.
- `dictionaryDefinitions` and `dictionaries` are collected in order so that dictionaries can be replaced by other dictionaries with the same name.

## Configuration Finalization

**Order**

1. **`overrides`** - the settings from the matching `filename` globs are applied.
1. **`languageSettings`** - the settings from the matching `languageId` or `locale` are applied.

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
    "languageId": "cpp,hpp" // Set the languageId `cpp` and `hpp` overriding the defaults.
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
