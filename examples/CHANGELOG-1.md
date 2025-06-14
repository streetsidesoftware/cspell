# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## v9.1.0 (2025-06-12)

### Changes

### Features

<details>
<summary>feat: Add command `dictionaries` (<a href="https://github.com/streetsidesoftware/cspell/pull/7445">#7445</a>)</summary>

### feat: Add command `dictionaries` ([#7445](https://github.com/streetsidesoftware/cspell/pull/7445))

Add new `dictionaries` command to the cli

```
Usage: cspell dictionaries [options]

List dictionaries

Options:
  -c, --config <cspell.json>  Configuration file to use.  By default cspell
                              looks for cspell.json in the current directory.
  --path-format <format>      Configure how to display the dictionary path.
                              (choices: "hide", "short", "long", "full",
                              default: Display most of the path.)
  --color                     Force color.
  --no-color                  Turn off color.
  --no-default-configuration  Do not load the default configuration and
                              dictionaries.
  -h, --help                  display help for command
```

---

</details>

<details>
<summary>feat: Add lint option `--dictionary` (<a href="https://github.com/streetsidesoftware/cspell/pull/7441">#7441</a>)</summary>

### feat: Add lint option `--dictionary` ([#7441](https://github.com/streetsidesoftware/cspell/pull/7441))

Add lint options:

- `--dictionary` - enable a dictionary by name
- `--disable-dictionary` - disable a dictionary by name

---

</details>

<details>
<summary>feat: Add init command to command-line. (<a href="https://github.com/streetsidesoftware/cspell/pull/7414">#7414</a>)</summary>

### feat: Add init command to command-line. ([#7414](https://github.com/streetsidesoftware/cspell/pull/7414))

New command:

```
Usage: cspell init [options]

Initialize a CSpell configuration file.

Options:
  -o, --output <path>        Define where to write file.
  --format <format>          Define the format of the file. (choices: "yaml",
                             "yml", "json", "jsonc", default: "yaml")
  --import <path|package>    Import a configuration file or dictionary package.
  --locale <locale>          Define the locale to use when spell checking (e.g.,
                             en, en-US, de).
  --dictionary <dictionary>  Enable a dictionary.
  --no-comments              Do not add comments to the config file.
  --no-schema                Do not add the schema reference to the config file.
  -h, --help                 display help for command
```

---

</details>

<details>
<summary>feat: Add command line option to set reporting level (<a href="https://github.com/streetsidesoftware/cspell/pull/7380">#7380</a>)</summary>

### feat: Add command line option to set reporting level ([#7380](https://github.com/streetsidesoftware/cspell/pull/7380))

## Command Line Option: `--report`

Option: `--report`
Choices:

- `all` - report everything (default)
- `simple` - only report issues with simple fixes.
- `typos` - only report issues with common typos.
- `flagged` - only report flagged issues.

## Reporters - add opt-in feature flag

To support legacy reporters, it is necessary to check if they support new features.

Features:

```ts
/**
 * Allows the reporter to advertise which features it supports.
 */
interface FeaturesSupportedByReporter {
    /**
     * The reporter supports the {@link ReportingConfiguration.unknownWords} option and understands
     * how to filter issues based upon {@link Issue.isFlagged}, {@link Issue.hasSimpleSuggestions} and {@link Issue.hasPreferredSuggestions}.
     * - `true` - The `reporter.issue` method will be called for all spelling issues and it is expected to handle .
     * - `false | undefined` - the unknown words will be filtered out based upon the `unknownWords` setting before being passed to the reporter.
     */
    unknownWords?: boolean | undefined;

    /**
     * The reporter supports the {@link Issue.issueType} option.
     * - `true` - the reporter will be called with all issues types.
     * - `false | undefined` - only {@link IssueType.spelling} issues will be passed to the reporter.
     */
    issueType?: boolean | undefined;
}
```

---

</details>

### Fixes

<details>
<summary>fix: Fix perf issue related to searching for the config. (<a href="https://github.com/streetsidesoftware/cspell/pull/7483">#7483</a>)</summary>

### fix: Fix perf issue related to searching for the config. ([#7483](https://github.com/streetsidesoftware/cspell/pull/7483))

---

</details>

<details>
<summary>fix: Hide `--config-search` option (<a href="https://github.com/streetsidesoftware/cspell/pull/7479">#7479</a>)</summary>

### fix: Hide `--config-search` option ([#7479](https://github.com/streetsidesoftware/cspell/pull/7479))

---

</details>

<details>
<summary>refactor: `isolatedDeclarations: true` (<a href="https://github.com/streetsidesoftware/cspell/pull/7459">#7459</a>)</summary>

### refactor: `isolatedDeclarations: true` ([#7459](https://github.com/streetsidesoftware/cspell/pull/7459))

---

</details>

<details>
<summary>refactor: enable isolatedDeclarations (<a href="https://github.com/streetsidesoftware/cspell/pull/7456">#7456</a>)</summary>

### refactor: enable isolatedDeclarations ([#7456](https://github.com/streetsidesoftware/cspell/pull/7456))

---

</details>

<details>
<summary>refactor: enable isolatedDeclarations (<a href="https://github.com/streetsidesoftware/cspell/pull/7452">#7452</a>)</summary>

### refactor: enable isolatedDeclarations ([#7452](https://github.com/streetsidesoftware/cspell/pull/7452))

---

</details>

<details>
<summary>fix: Add option to continue on error (<a href="https://github.com/streetsidesoftware/cspell/pull/7451">#7451</a>)</summary>

### fix: Add option to continue on error ([#7451](https://github.com/streetsidesoftware/cspell/pull/7451))

Add lint option:

```
  --continue-on-error          Continue processing files even if there is a configuration error.
```

---

</details>

<details>
<summary>fix: Improve dictionaries command (<a href="https://github.com/streetsidesoftware/cspell/pull/7449">#7449</a>)</summary>

### fix: Improve dictionaries command ([#7449](https://github.com/streetsidesoftware/cspell/pull/7449))

Add options:

```
  --enabled                   Show only enabled dictionaries.
  --no-enabled                Do not show enabled dictionaries.
  --locale <locale>           Set language locales. i.e. "en,fr" for English and
                              French, or "en-GB" for British English.
  --file-type <fileType>      File type to use. i.e. "html", "golang", or
                              "javascript".
  --no-show-location          Do not show the location of the dictionary.
  --show-file-types           Show the file types supported by the dictionary.
                              (default: false)
  --show-locales              Show the language locales supported by the
                              dictionary. (default: false)
```

---

</details>

<details>
<summary>fix: Add trace option `--dictionary` (<a href="https://github.com/streetsidesoftware/cspell/pull/7443">#7443</a>)</summary>

### fix: Add trace option `--dictionary` ([#7443](https://github.com/streetsidesoftware/cspell/pull/7443))

```
Usage: cspell trace [options] [words...]

Options:
  --dictionary <name>         Enable a dictionary by name. Can be used multiple
                              times.
```

---

</details>

<details>
<summary>fix: Add init options (<a href="https://github.com/streetsidesoftware/cspell/pull/7436">#7436</a>)</summary>

### fix: Add init options ([#7436](https://github.com/streetsidesoftware/cspell/pull/7436))

New options:

```
  -c, --config <path>        Path to the CSpell configuration file. Conflicts
                             with --output and --format.
  --remove-comments          Remove all comments from the config file.
  --stdout                   Write the configuration to stdout instead of a
                             file.
```

Help:

```
Usage: cspell init [options]

Initialize a CSpell configuration file.

Options:
  -c, --config <path>        Path to the CSpell configuration file. Conflicts
                             with --output and --format.
  -o, --output <path>        Define where to write file.
  --format <format>          Define the format of the file. (choices: "yaml",
                             "yml", "json", "jsonc", default: "yaml")
  --import <path|package>    Import a configuration file or dictionary package.
  --locale <locale>          Define the locale to use when spell checking (e.g.,
                             en, en-US, de).
  --dictionary <dictionary>  Enable a dictionary. Can be used multiple times.
  --no-comments              Do not add comments to the config file.
  --remove-comments          Remove all comments from the config file.
  --no-schema                Do not add the schema reference to the config file.
  --stdout                   Write the configuration to stdout instead of a
                             file.
  -h, --help                 display help for command
```

---

</details>

<details>
<summary>fix: Allow init of `cspell.config.yml` files (<a href="https://github.com/streetsidesoftware/cspell/pull/7432">#7432</a>)</summary>

### fix: Allow init of `cspell.config.yml` files ([#7432](https://github.com/streetsidesoftware/cspell/pull/7432))

Add `yml` to the init command format list.

```
cspell init --format=yml
```

It will create a `cspell.config.yml` file.

---

</details>

<details>
<summary>fix: Only generate the context if necessary (<a href="https://github.com/streetsidesoftware/cspell/pull/7388">#7388</a>)</summary>

### fix: Only generate the context if necessary ([#7388](https://github.com/streetsidesoftware/cspell/pull/7388))

---

</details>

<details>
<summary>fix: Correct the schema generator (<a href="https://github.com/streetsidesoftware/cspell/pull/7395">#7395</a>)</summary>

### fix: Correct the schema generator ([#7395](https://github.com/streetsidesoftware/cspell/pull/7395))

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7474">#7474</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7474](https://github.com/streetsidesoftware/cspell/pull/7474))

# Update Dictionaries (main)

## Summary

```
 .../MicrosoftDocs/PowerShell-Docs/report.yaml      |  3 +-
 .../MicrosoftDocs/PowerShell-Docs/snapshot.txt     |  3 +-
 .../snapshots/ktaranov/sqlserver-kit/report.yaml   | 10 +--
 .../snapshots/ktaranov/sqlserver-kit/snapshot.txt  |  9 +--
 .../microsoft/TypeScript-Website/report.yaml       |  6 +-
 .../microsoft/TypeScript-Website/snapshot.txt      |  4 +-
 .../snapshots/neovim/nvim-lspconfig/report.yaml    |  5 +-
 .../snapshots/neovim/nvim-lspconfig/snapshot.txt   |  3 +-
 .../webdeveric/webpack-assets-manifest/report.yaml |  7 +-
 .../webpack-assets-manifest/snapshot.txt           |  5 +-
 packages/cspell-bundled-dicts/package.json         | 16 ++--
 .../cspell/src/app/__snapshots__/app.test.ts.snap  | 30 +++----
 pnpm-lock.yaml                                     | 93 ++++++++++++----------
 13 files changed, 95 insertions(+), 99 deletions(-)
```

---

</details>

### Documentation

<details>
<summary>fix: Correct the schema generator (<a href="https://github.com/streetsidesoftware/cspell/pull/7395">#7395</a>)</summary>

### fix: Correct the schema generator ([#7395](https://github.com/streetsidesoftware/cspell/pull/7395))

---

</details>

<!-- cspell:ignore ktaranov lspconfig nvim webdeveric -->

## 9.0.2 (2025-05-20)

**Note:** Version bump only for package cspell-monorepo

## 9.0.1 (2025-05-08)

**Note:** Version bump only for package cspell-monorepo

## 9.0.0 (2025-05-05)

**Note:** Version bump only for package cspell-monorepo
