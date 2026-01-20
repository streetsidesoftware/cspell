---
title: Overrides
sidebar_position: 8
sidebar_label: Overrides
---

# Overrides

**Overrides** allow you to apply different spell-checking settings to specific files or file patterns. They're useful when different parts of your project need different dictionaries, languages, or spell-checking rules—for example, enabling special dictionaries for test files or disabling spell-checking for generated code.

## Using Overrides

Overrides are defined in the `overrides` field of your configuration file. Each override contains:

- **`filename`** - A glob pattern (or array of patterns) that matches files
- **Settings** - Any configuration settings you want to apply to matching files

When a file matches an override's `filename` pattern, the override settings are applied for that file.

:::tip

**`filename`** can be a single glob or an array of globs.

:::

## Common Use Cases

Here are practical examples of using overrides:

**Example:**

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

## How Overrides are Applied

Overrides are applied during the configuration finalization phase, after all configuration files have been gathered and merged.

**Application Order:**

1. **Base Configuration** - Settings from all configuration files are merged (default config, command line, imported configs, and your config file)
2. **Overrides** - Settings from matching `overrides` are applied based on the file's path
3. **Language Settings** - Settings from matching `languageSettings` are applied based on `languageId` or `locale`

### Multiple Matching Overrides

When multiple overrides match a file, they are applied in the order they appear in the configuration. Later overrides can modify or extend settings from earlier ones.

:::info Configuration Merging

Most settings are merged intelligently:

- **Simple values** (strings, numbers, booleans) are replaced
- **Arrays** like `words`, `dictionaries`, and `ignoreWords` are combined as unions
- **Overrides** and **languageSettings** accumulate in order for later application

:::
