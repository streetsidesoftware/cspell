# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## v9.2.0 (2025-07-19)

<details>
<summary>refactor: Support url based cache entries (<a href="https://github.com/streetsidesoftware/cspell/pull/7639">#7639</a>)</summary>

### refactor: Support url based cache entries ([#7639](https://github.com/streetsidesoftware/cspell/pull/7639))

---

</details>

### Features

<details>
<summary>fix: Support remote dependencies in cache (<a href="https://github.com/streetsidesoftware/cspell/pull/7642">#7642</a>)</summary>

### fix: Support remote dependencies in cache ([#7642](https://github.com/streetsidesoftware/cspell/pull/7642))

---

</details>

### Fixes

<details>
<summary>fix: Remove `flat-cache` dependency (<a href="https://github.com/streetsidesoftware/cspell/pull/7636">#7636</a>)</summary>

### fix: Remove `flat-cache` dependency ([#7636](https://github.com/streetsidesoftware/cspell/pull/7636))

`flat-cache` v6 is not compatible with the cspell cache. Since `flat-cache` was mostly a pass through to `flatted`, it was better to just replace it.

---

</details>

<details>
<summary>refactor: move towards caching URLs (<a href="https://github.com/streetsidesoftware/cspell/pull/7634">#7634</a>)</summary>

### refactor: move towards caching URLs ([#7634](https://github.com/streetsidesoftware/cspell/pull/7634))

---

</details>

<details>
<summary>fix: Support async cache (<a href="https://github.com/streetsidesoftware/cspell/pull/7631">#7631</a>)</summary>

### fix: Support async cache ([#7631](https://github.com/streetsidesoftware/cspell/pull/7631))

---

</details>

<details>
<summary>fix: Replace file-entry-cache (<a href="https://github.com/streetsidesoftware/cspell/pull/6579">#6579</a>)</summary>

### fix: Replace file-entry-cache ([#6579](https://github.com/streetsidesoftware/cspell/pull/6579))

Deprecating the use of file-entry-cache.

v10 of `file-entry-cache` breaks the spell checker and bloats the cache size.

This PR is the first step in reducing the dependency upon file-entry-cache and its dependencies.

---

</details>

<details>
<summary>fix: Clean cspell-lib type exports (<a href="https://github.com/streetsidesoftware/cspell/pull/7615">#7615</a>)</summary>

### fix: Clean cspell-lib type exports ([#7615](https://github.com/streetsidesoftware/cspell/pull/7615))

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7618">#7618</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7618](https://github.com/streetsidesoftware/cspell/pull/7618))

# Update Dictionaries (main)

## Summary

```
 integration-tests/snapshots/vitest-dev/vitest/report.yaml  | 10 ++--------
 integration-tests/snapshots/vitest-dev/vitest/snapshot.txt |  5 +----
 packages/cspell-bundled-dicts/package.json                 |  2 +-
 pnpm-lock.yaml                                             | 12 ++++++------
 4 files changed, 10 insertions(+), 19 deletions(-)
```

---

</details>

## v9.1.5 (2025-07-13)

### Fixes

<details>
<summary>fix: Compile before publish (<a href="https://github.com/streetsidesoftware/cspell/pull/7610">#7610</a>)</summary>

### fix: Compile before publish ([#7610](https://github.com/streetsidesoftware/cspell/pull/7610))

---

</details>

## v9.1.4 (2025-07-13)

### Fixes

<details>
<summary>fix: show simple typos reporting (<a href="https://github.com/streetsidesoftware/cspell/pull/7606">#7606</a>)</summary>

### fix: show simple typos reporting ([#7606](https://github.com/streetsidesoftware/cspell/pull/7606))

Fix the logic to show an issue when the reporting level is set to `simple`. The code worked because of the assumption that  `hasSimpleSuggestions` would be true if `hasPreferredSuggestions` was true.

---

</details>

<details>
<summary>fix: Reduce CSpell package size (<a href="https://github.com/streetsidesoftware/cspell/pull/7602">#7602</a>)</summary>

### fix: Reduce CSpell package size ([#7602](https://github.com/streetsidesoftware/cspell/pull/7602))

---

</details>

<details>
<summary>fix: Make it easier to create config files. (<a href="https://github.com/streetsidesoftware/cspell/pull/7598">#7598</a>)</summary>

### fix: Make it easier to create config files. ([#7598](https://github.com/streetsidesoftware/cspell/pull/7598))

---

</details>

<details>
<summary>fix: store reportIssueOptions in the cache (<a href="https://github.com/streetsidesoftware/cspell/pull/7597">#7597</a>)</summary>

### fix: store reportIssueOptions in the cache ([#7597](https://github.com/streetsidesoftware/cspell/pull/7597))

This fixes and issue with reporting cached issues when they should have been ignored.

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7591">#7591</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7591](https://github.com/streetsidesoftware/cspell/pull/7591))

# Update Dictionaries (main)

## Summary

```
 packages/cspell-bundled-dicts/package.json | 116 ++---
 pnpm-lock.yaml                             | 706 +++++++++++++++--------------
 2 files changed, 432 insertions(+), 390 deletions(-)
```

---

</details>

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7574">#7574</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7574](https://github.com/streetsidesoftware/cspell/pull/7574))

# Update Dictionaries (main)

## Summary

```
 packages/cspell-bundled-dicts/package.json |  4 ++--
 pnpm-lock.yaml                             | 24 ++++++++++++------------
 2 files changed, 14 insertions(+), 14 deletions(-)
```

---

</details>

## v9.1.3 (2025-07-05)

### Fixes

<details>
<summary>fix: Add toml config reader/writer (<a href="https://github.com/streetsidesoftware/cspell/pull/7565">#7565</a>)</summary>

### fix: Add toml config reader/writer ([#7565](https://github.com/streetsidesoftware/cspell/pull/7565))

fixes #7563

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7569">#7569</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7569](https://github.com/streetsidesoftware/cspell/pull/7569))

# Update Dictionaries (main)

## Summary

```
 packages/cspell-bundled-dicts/package.json |  2 +-
 pnpm-lock.yaml                             | 12 ++++++------
 2 files changed, 7 insertions(+), 7 deletions(-)
```

---

</details>

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7564">#7564</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7564](https://github.com/streetsidesoftware/cspell/pull/7564))

# Update Dictionaries (main)

## Summary

```
 packages/cspell-bundled-dicts/package.json |  2 +-
 pnpm-lock.yaml                             | 12 ++++++------
 2 files changed, 7 insertions(+), 7 deletions(-)
```

---

</details>

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7560">#7560</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7560](https://github.com/streetsidesoftware/cspell/pull/7560))

# Update Dictionaries (main)

## Summary

```
 .../snapshots/flutter/samples/report.yaml          |  4 +--
 .../snapshots/flutter/samples/snapshot.txt         |  7 ++---
 packages/cspell-bundled-dicts/package.json         |  6 ++--
 pnpm-lock.yaml                                     | 33 +++++++++++++---------
 4 files changed, 26 insertions(+), 24 deletions(-)
```

---

</details>

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7549">#7549</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7549](https://github.com/streetsidesoftware/cspell/pull/7549))

# Update Dictionaries (main)

## Summary

```
 integration-tests/snapshots/mdx-js/mdx/report.yaml | 46 ++--------------------
 .../snapshots/mdx-js/mdx/snapshot.txt              | 43 +-------------------
 packages/cspell-bundled-dicts/package.json         |  8 ++--
 pnpm-lock.yaml                                     | 45 +++++++++++----------
 4 files changed, 33 insertions(+), 109 deletions(-)
```

---

</details>

### Documentation

<details>
<summary>fix: Add toml config reader/writer (<a href="https://github.com/streetsidesoftware/cspell/pull/7565">#7565</a>)</summary>

### fix: Add toml config reader/writer ([#7565](https://github.com/streetsidesoftware/cspell/pull/7565))

fixes #7563

---

</details>

## v9.1.2 (2025-06-24)

### Fixes

<details>
<summary>fix: Do not double encode stdin urls (<a href="https://github.com/streetsidesoftware/cspell/pull/7536">#7536</a>)</summary>

### fix: Do not double encode stdin urls ([#7536](https://github.com/streetsidesoftware/cspell/pull/7536))

fixes #7517

---

</details>

<details>
<summary>fix: cspell trace output (<a href="https://github.com/streetsidesoftware/cspell/pull/7528">#7528</a>)</summary>

### fix: cspell trace output ([#7528](https://github.com/streetsidesoftware/cspell/pull/7528))

It was incorrectly trimming ansi strings.

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7526">#7526</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7526](https://github.com/streetsidesoftware/cspell/pull/7526))

# Update Dictionaries (main)

## Summary

```
 packages/cspell-bundled-dicts/package.json |  4 ++--
 pnpm-lock.yaml                             | 24 ++++++++++++------------
 2 files changed, 14 insertions(+), 14 deletions(-)
```

---

</details>

## v9.1.1 (2025-06-14)

### Changes

### Fixes

<details>
<summary>fix: Use the native JSON parser if possible (<a href="https://github.com/streetsidesoftware/cspell/pull/7502">#7502</a>)</summary>

### fix: Use the native JSON parser if possible ([#7502](https://github.com/streetsidesoftware/cspell/pull/7502))

Some of the cspell settings have grow large. The fix is to use the native JSON parser instead of one that accepts comments.

---

</details>

## v9.1.0 (2025-06-14)

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
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7499">#7499</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7499](https://github.com/streetsidesoftware/cspell/pull/7499))

# Update Dictionaries (main)

## Summary

```
 packages/cspell-bundled-dicts/package.json         |  2 +-
 .../cspell/src/app/__snapshots__/app.test.ts.snap  | 30 +++++++++++-----------
 pnpm-lock.yaml                                     | 12 ++++-----
 3 files changed, 22 insertions(+), 22 deletions(-)
```

---

</details>

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7485">#7485</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7485](https://github.com/streetsidesoftware/cspell/pull/7485))

# Update Dictionaries (main)

## Summary

```
 .../snapshots/AdaDoom3/AdaDoom3/report.yaml        |  1994 ++--
 .../Azure/azure-rest-api-specs/report.yaml         |    18 +-
 .../MartinThoma/LaTeX-examples/report.yaml         |   616 +-
 .../MicrosoftDocs/PowerShell-Docs/report.yaml      |   236 +-
 .../snapshots/RustPython/RustPython/report.yaml    |   442 +-
 .../SoftwareBrothers/admin-bro/report.yaml         |     2 +-
 .../snapshots/TheAlgorithms/Python/report.yaml     |   178 +-
 .../snapshots/alexiosc/megistos/report.yaml        |  1292 +--
 .../aspnetboilerplate/report.yaml                  |   244 +-
 .../snapshots/aws-amplify/docs/report.yaml         |    14 +-
 .../snapshots/caddyserver/caddy/report.yaml        |    36 +-
 .../snapshots/dart-lang/sdk/report.yaml            |   498 +-
 .../snapshots/django/django/report.yaml            |  1318 +--
 .../snapshots/eslint/eslint/report.yaml            |    76 +-
 .../snapshots/flutter/samples/report.yaml          | 10744 +++++++++----------
 .../snapshots/gitbucket/gitbucket/report.yaml      |     8 +-
 .../googleapis/google-cloud-cpp/report.yaml        |   114 +-
 .../iluwatar/java-design-patterns/report.yaml      |    52 +-
 .../snapshots/ktaranov/sqlserver-kit/report.yaml   |  7542 ++++++-------
 .../snapshots/liriliri/licia/report.yaml           |   148 +-
 integration-tests/snapshots/mdx-js/mdx/report.yaml |    58 +-
 .../microsoft/TypeScript-Website/report.yaml       |    98 +-
 .../snapshots/neovim/nvim-lspconfig/report.yaml    |   844 +-
 .../snapshots/pagekit/pagekit/report.yaml          |    17 +-
 .../snapshots/pagekit/pagekit/snapshot.txt         |     3 +-
 .../snapshots/php/php-src/report.yaml              |  4260 ++++----
 .../snapshots/pycontribs/jira/report.yaml          |     4 +-
 .../snapshots/slint-ui/slint/report.yaml           |   518 +-
 .../snapshots/sveltejs/svelte/report.yaml          |  2548 ++---
 .../typescript-cheatsheets/react/report.yaml       |     6 +-
 .../snapshots/vitest-dev/vitest/report.yaml        |    62 +-
 .../snapshots/wireapp/wire-webapp/report.yaml      |   994 +-
 packages/cspell-bundled-dicts/package.json         |     8 +-
 .../__snapshots__/validator.test.ts.snap           |     4 +-
 .../cspell/src/app/__snapshots__/app.test.ts.snap  |    96 +-
 pnpm-lock.yaml                                     |    52 +-
 36 files changed, 17573 insertions(+), 17571 deletions(-)
```

---

</details>

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

## v9.0.2 (2025-05-20)

### Changes

### Fixes

<details>
<summary>fix: Add eslint plugin helpers (<a href="https://github.com/streetsidesoftware/cspell/pull/7352">#7352</a>)</summary>

### fix: Add eslint plugin helpers ([#7352](https://github.com/streetsidesoftware/cspell/pull/7352))

Add helper methods:

- `defineCSpellPluginOptions`
- `defineCSpellConfig`

Add some examples for `supportNonStrictSearches`

---

</details>

<details>
<summary>fix: Make it possible to define a strict dictionary. (<a href="https://github.com/streetsidesoftware/cspell/pull/7351">#7351</a>)</summary>

### fix: Make it possible to define a strict dictionary. ([#7351](https://github.com/streetsidesoftware/cspell/pull/7351))

---

</details>

<details>
<summary>fix: Correct the Hunspell Reader usage. (<a href="https://github.com/streetsidesoftware/cspell/pull/7325">#7325</a>)</summary>

### fix: Correct the Hunspell Reader usage. ([#7325](https://github.com/streetsidesoftware/cspell/pull/7325))

Add an example.

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7346">#7346</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7346](https://github.com/streetsidesoftware/cspell/pull/7346))

# Update Dictionaries (main)

## Summary

```
 packages/cspell-bundled-dicts/package.json |  4 ++--
 pnpm-lock.yaml                             | 24 ++++++++++++------------
 2 files changed, 14 insertions(+), 14 deletions(-)
```

---

</details>

## v9.0.1 (2025-05-08)

### Changes

### Fixes

<details>
<summary>fix: Add support to add words to config and keep comments. (<a href="https://github.com/streetsidesoftware/cspell/pull/7295">#7295</a>)</summary>

### fix: Add support to add words to config and keep comments. ([#7295](https://github.com/streetsidesoftware/cspell/pull/7295))

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7306">#7306</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7306](https://github.com/streetsidesoftware/cspell/pull/7306))

# Update Dictionaries (main)

## Summary

```
 .../snapshots/dart-lang/sdk/report.yaml            | 10 ++-----
 .../snapshots/dart-lang/sdk/snapshot.txt           |  4 +--
 .../snapshots/ktaranov/sqlserver-kit/report.yaml   |  2 +-
 .../snapshots/vitest-dev/vitest/report.yaml        |  4 +--
 .../snapshots/vitest-dev/vitest/snapshot.txt       |  3 +-
 packages/cspell-bundled-dicts/package.json         |  6 ++--
 pnpm-lock.yaml                                     | 33 +++++++++++++---------
 7 files changed, 29 insertions(+), 33 deletions(-)
```

---

</details>

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7302">#7302</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7302](https://github.com/streetsidesoftware/cspell/pull/7302))

# Update Dictionaries (main)

## Summary

```
 .../snapshots/AdaDoom3/AdaDoom3/report.yaml        |  3 +-
 .../snapshots/AdaDoom3/AdaDoom3/snapshot.txt       |  3 +-
 .../MicrosoftDocs/PowerShell-Docs/report.yaml      | 12 +++---
 .../MicrosoftDocs/PowerShell-Docs/snapshot.txt     |  4 +-
 .../snapshots/eslint/eslint/report.yaml            |  6 +--
 .../snapshots/eslint/eslint/snapshot.txt           |  3 +-
 packages/cspell-bundled-dicts/package.json         |  8 ++--
 pnpm-lock.yaml                                     | 45 ++++++++++++----------
 8 files changed, 40 insertions(+), 44 deletions(-)
```

---

</details>

## v9.0.0 (2025-05-05)

### Changes

### **BREAKING**

<details>
<summary>feat!: End support for Node 18 (<a href="https://github.com/streetsidesoftware/cspell/pull/7275">#7275</a>)</summary>

### feat!: End support for Node 18 ([#7275](https://github.com/streetsidesoftware/cspell/pull/7275))

---

</details>

### Fixes

<details>
<summary>fix: Update en-gb dictionary to en-gb-mit (<a href="https://github.com/streetsidesoftware/cspell/pull/7278">#7278</a>)</summary>

### fix: Update en-gb dictionary to en-gb-mit ([#7278](https://github.com/streetsidesoftware/cspell/pull/7278))

---

</details>

### Dictionary Updates

<details>
<summary>fix: Workflow Bot -- Update Dictionaries (main) (<a href="https://github.com/streetsidesoftware/cspell/pull/7279">#7279</a>)</summary>

### fix: Workflow Bot -- Update Dictionaries (main) ([#7279](https://github.com/streetsidesoftware/cspell/pull/7279))

# Update Dictionaries (main)

## Summary

```
 .../snapshots/dart-lang/sdk/report.yaml            |  6 +--
 .../snapshots/dart-lang/sdk/snapshot.txt           |  3 +-
 .../snapshots/liriliri/licia/report.yaml           |  3 +-
 .../snapshots/liriliri/licia/snapshot.txt          |  3 +-
 .../microsoft/TypeScript-Website/report.yaml       |  5 +-
 .../microsoft/TypeScript-Website/snapshot.txt      |  3 +-
 .../snapshots/neovim/nvim-lspconfig/report.yaml    |  5 +-
 .../snapshots/neovim/nvim-lspconfig/snapshot.txt   |  3 +-
 .../snapshots/pycontribs/jira/report.yaml          |  3 +-
 .../snapshots/pycontribs/jira/snapshot.txt         |  3 +-
 .../snapshots/wireapp/wire-webapp/report.yaml      |  5 +-
 .../snapshots/wireapp/wire-webapp/snapshot.txt     |  3 +-
 packages/cspell-bundled-dicts/package.json         | 10 ++--
 pnpm-lock.yaml                                     | 60 +++++++++++++---------
 14 files changed, 57 insertions(+), 58 deletions(-)
```

---

</details>

## 8.19.4 (2025-05-03)

**Note:** Version bump only for package cspell

## 8.19.3 (2025-04-27)

**Note:** Version bump only for package cspell

## 8.19.2 (2025-04-20)

**Note:** Version bump only for package cspell

## 8.19.1 (2025-04-18)

**Note:** Version bump only for package cspell

## 8.19.0 (2025-04-16)

**Note:** Version bump only for package cspell

## <small>8.18.1 (2025-03-29)</small>

* ci: Workflow Bot -- Update ALL Dependencies (main) (#7087) ([b570457](https://github.com/streetsidesoftware/cspell/commit/b570457)), closes [#7087](https://github.com/streetsidesoftware/cspell/issues/7087)

## 8.18.0 (2025-03-26)

* ci: Workflow Bot -- Update ALL Dependencies (main) (#7080) ([b9d57a1](https://github.com/streetsidesoftware/cspell/commit/b9d57a1)), closes [#7080](https://github.com/streetsidesoftware/cspell/issues/7080)

## <small>8.17.5 (2025-02-22)</small>

* fix: Workflow Bot -- Update Dictionaries (main) (#6937) ([2bfee05](https://github.com/streetsidesoftware/cspell/commit/2bfee05)), closes [#6937](https://github.com/streetsidesoftware/cspell/issues/6937)

## <small>8.17.4 (2025-02-19)</small>

* ci: Workflow Bot -- Update ALL Dependencies (main) (#6920) ([e92597c](https://github.com/streetsidesoftware/cspell/commit/e92597c)), closes [#6920](https://github.com/streetsidesoftware/cspell/issues/6920)

## <small>8.17.3 (2025-01-28)</small>

* chore: fix labeler ([ea51ed4](https://github.com/streetsidesoftware/cspell/commit/ea51ed4))

## <small>8.17.2 (2025-01-13)</small>

* fix: Dump stack on error when verbose (#6782) ([df0026c](https://github.com/streetsidesoftware/cspell/commit/df0026c)), closes [#6782](https://github.com/streetsidesoftware/cspell/issues/6782)

## <small>8.17.1 (2024-12-16)</small>

* chore: Update Integration Test Performance Data (#6681) ([4b19439](https://github.com/streetsidesoftware/cspell/commit/4b19439)), closes [#6681](https://github.com/streetsidesoftware/cspell/issues/6681)

## 8.17.0 (2024-12-15)

* chore: Update Integration Test Performance Data (#6676) ([f9cb45f](https://github.com/streetsidesoftware/cspell/commit/f9cb45f)), closes [#6676](https://github.com/streetsidesoftware/cspell/issues/6676)

## <small>8.16.1 (2024-11-26)</small>

* chore: Update Integration Test Performance Data (#6602) ([5d667a7](https://github.com/streetsidesoftware/cspell/commit/5d667a7)), closes [#6602](https://github.com/streetsidesoftware/cspell/issues/6602)

## 8.16.0 (2024-11-07)

* chore: Update Integration Test Performance Data (#6505) ([fb78a40](https://github.com/streetsidesoftware/cspell/commit/fb78a40)), closes [#6505](https://github.com/streetsidesoftware/cspell/issues/6505)

## <small>8.15.7 (2024-11-03)</small>

* ci: Workflow Bot -- Update ALL Dependencies (main) (#6456) ([d4bd0dd](https://github.com/streetsidesoftware/cspell/commit/d4bd0dd)), closes [#6456](https://github.com/streetsidesoftware/cspell/issues/6456)

## <small>8.15.6 (2024-11-02)</small>

* chore: Update Integration Test Performance Data (#6455) ([be8b15a](https://github.com/streetsidesoftware/cspell/commit/be8b15a)), closes [#6455](https://github.com/streetsidesoftware/cspell/issues/6455)

## <small>8.15.5 (2024-10-30)</small>

* ci: Workflow Bot -- Update ALL Dependencies (main) (#6442) ([70f43cc](https://github.com/streetsidesoftware/cspell/commit/70f43cc)), closes [#6442](https://github.com/streetsidesoftware/cspell/issues/6442)

## <small>8.15.4 (2024-10-18)</small>

* chore: Update Integration Test Performance Data (#6389) ([7ece6a7](https://github.com/streetsidesoftware/cspell/commit/7ece6a7)), closes [#6389](https://github.com/streetsidesoftware/cspell/issues/6389)

## <small>8.15.3 (2024-10-16)</small>

* chore: Update Integration Test Performance Data (#6377) ([7ff6781](https://github.com/streetsidesoftware/cspell/commit/7ff6781)), closes [#6377](https://github.com/streetsidesoftware/cspell/issues/6377)

## <small>8.15.2 (2024-10-14)</small>

* chore: Update Integration Test Performance Data (#6361) ([d639368](https://github.com/streetsidesoftware/cspell/commit/d639368)), closes [#6361](https://github.com/streetsidesoftware/cspell/issues/6361)

## <small>8.15.1 (2024-10-11)</small>

* fix: Sign Published Packages (#6350) ([633b060](https://github.com/streetsidesoftware/cspell/commit/633b060)), closes [#6350](https://github.com/streetsidesoftware/cspell/issues/6350)

## 8.15.0 (2024-10-11)

* chore: bump eslint-plugin-unicorn from 55.0.0 to 56.0.0 (#6332) ([67d1e92](https://github.com/streetsidesoftware/cspell/commit/67d1e92)), closes [#6332](https://github.com/streetsidesoftware/cspell/issues/6332)

## <small>8.14.4 (2024-09-18)</small>

* fix: Remove object from cache (#6257) ([ea24297](https://github.com/streetsidesoftware/cspell/commit/ea24297)), closes [#6257](https://github.com/streetsidesoftware/cspell/issues/6257)

## <small>8.14.3 (2024-09-17)</small>

* chore: Update Integration Test Performance Data (#6254) ([189ac16](https://github.com/streetsidesoftware/cspell/commit/189ac16)), closes [#6254](https://github.com/streetsidesoftware/cspell/issues/6254)

## <small>8.14.2 (2024-08-20)</small>

* chore: Update Integration Test Performance Data (#6126) ([012c897](https://github.com/streetsidesoftware/cspell/commit/012c897)), closes [#6126](https://github.com/streetsidesoftware/cspell/issues/6126)

## <small>8.14.1 (2024-08-17)</small>

* fix: Fix publishing ([8a56148](https://github.com/streetsidesoftware/cspell/commit/8a56148))

## 8.14.0 (2024-08-17)

* chore: Update Integration Test Performance Data (#6113) ([c3eb155](https://github.com/streetsidesoftware/cspell/commit/c3eb155)), closes [#6113](https://github.com/streetsidesoftware/cspell/issues/6113)

## <small>8.13.3 (2024-08-12)</small>

* chore: Update Integration Test Performance Data (#6079) ([dd28ef5](https://github.com/streetsidesoftware/cspell/commit/dd28ef5)), closes [#6079](https://github.com/streetsidesoftware/cspell/issues/6079)

## <small>8.13.2 (2024-08-08)</small>

* chore: Update Integration Test Performance Data (#6060) ([c766d18](https://github.com/streetsidesoftware/cspell/commit/c766d18)), closes [#6060](https://github.com/streetsidesoftware/cspell/issues/6060)

## <small>8.13.1 (2024-08-02)</small>

* chore: Update Integration Test Performance Data (#6028) ([738d2a9](https://github.com/streetsidesoftware/cspell/commit/738d2a9)), closes [#6028](https://github.com/streetsidesoftware/cspell/issues/6028)

## 8.13.0 (2024-07-30)

* chore: Update Integration Test Performance Data (#6011) ([135838a](https://github.com/streetsidesoftware/cspell/commit/135838a)), closes [#6011](https://github.com/streetsidesoftware/cspell/issues/6011)

## <small>8.12.1 (2024-07-22)</small>

* fix: make sure the version is up to date ([f6ab018](https://github.com/streetsidesoftware/cspell/commit/f6ab018))

## 8.12.0 (2024-07-22)

* chore: Update Integration Test Performance Data (#5959) ([ea71b8a](https://github.com/streetsidesoftware/cspell/commit/ea71b8a)), closes [#5959](https://github.com/streetsidesoftware/cspell/issues/5959)

## 8.11.0 (2024-07-16)

* refactor: char index (#5926) ([077b3ba](https://github.com/streetsidesoftware/cspell/commit/077b3ba)), closes [#5926](https://github.com/streetsidesoftware/cspell/issues/5926)

## <small>8.10.4 (2024-07-05)</small>

* chore: force 8.10.3 ([f18b8c7](https://github.com/streetsidesoftware/cspell/commit/f18b8c7))

## <small>8.10.2 (2024-07-05)</small>

* ci: Workflow Bot -- Update ALL Dependencies (main) (#5862) ([814e15c](https://github.com/streetsidesoftware/cspell/commit/814e15c)), closes [#5862](https://github.com/streetsidesoftware/cspell/issues/5862)

## <small>8.10.1 (2024-07-05)</small>

* fix(cspell-tools): support adding directives (#5860) ([b2e014f](https://github.com/streetsidesoftware/cspell/commit/b2e014f)), closes [#5860](https://github.com/streetsidesoftware/cspell/issues/5860)

## 8.10.0 (2024-07-02)

* chore: Update Integration Test Performance Data (#5859) ([898e806](https://github.com/streetsidesoftware/cspell/commit/898e806)), closes [#5859](https://github.com/streetsidesoftware/cspell/issues/5859)

## <small>8.9.1 (2024-06-20)</small>

* docs: format tables in generated docs (#5776) ([02e0359](https://github.com/streetsidesoftware/cspell/commit/02e0359)), closes [#5776](https://github.com/streetsidesoftware/cspell/issues/5776)

## 8.9.0 (2024-06-18)

**Note:** Version bump only for package cspell

## 8.9.0-alpha.0 (2024-06-18)

* ci: Fix Lint -- Workflow Bot (#5770) ([b21032f](https://github.com/streetsidesoftware/cspell/commit/b21032f)), closes [#5770](https://github.com/streetsidesoftware/cspell/issues/5770)

## <small>8.8.4 (2024-06-03)</small>

* ci: Fix Lint -- Workflow Bot (#5699) ([211113a](https://github.com/streetsidesoftware/cspell/commit/211113a)), closes [#5699](https://github.com/streetsidesoftware/cspell/issues/5699)

## <small>8.8.3 (2024-05-23)</small>

* chore: Update Integration Test Performance Data (#5663) ([b605dd3](https://github.com/streetsidesoftware/cspell/commit/b605dd3)), closes [#5663](https://github.com/streetsidesoftware/cspell/issues/5663)

## <small>8.8.2 (2024-05-22)</small>

* ci: Workflow Bot -- Update ALL Dependencies (main) (#5659) ([5d93673](https://github.com/streetsidesoftware/cspell/commit/5d93673)), closes [#5659](https://github.com/streetsidesoftware/cspell/issues/5659)

## <small>8.8.1 (2024-05-10)</small>

* chore: Do not stop update if it fails to lint. ([64ba085](https://github.com/streetsidesoftware/cspell/commit/64ba085))

## 8.8.0 (2024-05-03)

**Note:** Version bump only for package cspell

## 8.7.0 (2024-04-10)

**Note:** Version bump only for package cspell

## 8.6.1 (2024-03-25)

**Note:** Version bump only for package cspell

## 8.6.0 (2024-03-05)

**Note:** Version bump only for package cspell

## 8.5.0 (2024-03-01)

**Note:** Version bump only for package cspell

## 8.4.1 (2024-02-20)

**Note:** Version bump only for package cspell

## 8.4.0 (2024-02-19)

**Note:** Version bump only for package cspell

## 8.3.2 (2024-01-02)

### Bug Fixes

* cspell-tools - support excluding words ([#5140](https://github.com/streetsidesoftware/cspell/issues/5140)) ([3fcdd89](https://github.com/streetsidesoftware/cspell/commit/3fcdd89fb319b659d218067c5366e02d036be59f))

## 8.3.1 (2024-01-01)

**Note:** Version bump only for package cspell

## 8.3.0 (2023-12-30)

**Note:** Version bump only for package cspell

## 8.2.4 (2023-12-28)

**Note:** Version bump only for package cspell

## 8.2.3 (2023-12-21)

### Bug Fixes

* Improve performance by reducing FS requests ([#5103](https://github.com/streetsidesoftware/cspell/issues/5103)) ([3f31569](https://github.com/streetsidesoftware/cspell/commit/3f31569a43b9ae0f21e90d84db57f87a2cb4f6dd))

## 8.2.2 (2023-12-21)

**Note:** Version bump only for package cspell

## 8.2.1 (2023-12-20)

**Note:** Version bump only for package cspell

## 8.2.0 (2023-12-20)

**Note:** Version bump only for package cspell

## 8.1.3 (2023-12-06)

### Bug Fixes

* Resolve relative imports without a leading `./` or `../`.  ([#5035](https://github.com/streetsidesoftware/cspell/issues/5035)) ([a28393b](https://github.com/streetsidesoftware/cspell/commit/a28393b30733b68e8b726c352e277ac4b5a0659d))

## 8.1.2 (2023-12-04)

### Bug Fixes

* expose ConfigLoader API ([#5032](https://github.com/streetsidesoftware/cspell/issues/5032)) ([e839990](https://github.com/streetsidesoftware/cspell/commit/e839990e94f639000bc926ae87187840fb17dee9))

## 8.1.1 (2023-12-04)

**Note:** Version bump only for package cspell

## 8.1.0 (2023-12-01)

**Note:** Version bump only for package cspell

## 8.0.0 (2023-11-07)

* ci: Workflow Bot -- Update ALL Dependencies (main) (#4959) ([096066d](https://github.com/streetsidesoftware/cspell/commit/096066d)), closes [#4959](https://github.com/streetsidesoftware/cspell/issues/4959)

## <small>7.3.9 (2023-11-07)</small>

* refactor: remove debug code (#4951) ([4972a77](https://github.com/streetsidesoftware/cspell/commit/4972a77)), closes [#4951](https://github.com/streetsidesoftware/cspell/issues/4951)

## <small>7.3.8 (2023-10-13)</small>

* ci: Workflow Bot -- Update ALL Dependencies (main) (#4894) ([2a4e1d8](https://github.com/streetsidesoftware/cspell/commit/2a4e1d8)), closes [#4894](https://github.com/streetsidesoftware/cspell/issues/4894)

## <small>7.3.7 (2023-09-28)</small>

* test: Add sample package to test dictionaries in eslint (#4875) ([06c9e18](https://github.com/streetsidesoftware/cspell/commit/06c9e18)), closes [#4875](https://github.com/streetsidesoftware/cspell/issues/4875)

## 7.3.6 (2023-09-13)

**Note:** Version bump only for package cspell

## 7.3.5 (2023-09-10)

### Bug Fixes

* Remove `[@markdown](https://github.com/markdown)Description` from types ([#4818](https://github.com/streetsidesoftware/cspell/issues/4818)) ([3ba8eed](https://github.com/streetsidesoftware/cspell/commit/3ba8eed8588aafa3dcb401acb96e4fdc82811d24))

## 7.3.4 (2023-09-10)

**Note:** Version bump only for package cspell

## 7.3.3 (2023-09-09)

**Note:** Version bump only for package cspell

## 7.3.2 (2023-09-01)

**Note:** Version bump only for package cspell

## 7.3.1 (2023-09-01)

**Note:** Version bump only for package cspell

## 7.3.0 (2023-08-31)

**Note:** Version bump only for package cspell

## 7.2.0 (2023-08-29)

**Note:** Version bump only for package cspell

## [7.1.1](https://github.com/streetsidesoftware/cspell/compare/v7.1.0...v7.1.1) (2023-08-28)

**Note:** Version bump only for package cspell

## 7.0.2 (2023-08-28)

**Note:** Version bump only for package cspell

## 7.0.1 (2023-08-21)

### Bug Fixes

* Workflow Bot -- Update Dictionaries (main) ([#4733](https://github.com/streetsidesoftware/cspell/issues/4733)) ([221b59b](https://github.com/streetsidesoftware/cspell/commit/221b59bfe726a3b1fe5f9dcbdef6632983ebebeb))

## [7.0.0](https://github.com/streetsidesoftware/cspell/compare/v7.0.1-alpha.9...v7.0.0) (2023-08-10)

**Note:** Version bump only for package cspell

## 7.0.1-alpha.9 (2023-08-10)

**Note:** Version bump only for package cspell

## 7.0.1-alpha.8 (2023-07-21)

### Bug Fixes

* **cspell-tools:** support conditional builds. ([#4668](https://github.com/streetsidesoftware/cspell/issues/4668)) ([de4d897](https://github.com/streetsidesoftware/cspell/commit/de4d897139fe5c98a83af926be23727f42be98d6))

## 7.0.1-alpha.7 (2023-07-19)

**Note:** Version bump only for package cspell

## 7.0.1-alpha.6 (2023-07-14)

### Bug Fixes

* cspell-tools: be able to update shasum checksum files. ([#4634](https://github.com/streetsidesoftware/cspell/issues/4634)) ([a67ea47](https://github.com/streetsidesoftware/cspell/commit/a67ea4715bee40b4105139ca4fbfdb1da4800dce))

## 7.0.1-alpha.5 (2023-07-13)

### Bug Fixes

* support automatic creation of `cspell-tools.config.yaml` ([#4631](https://github.com/streetsidesoftware/cspell/issues/4631)) ([f9fea67](https://github.com/streetsidesoftware/cspell/commit/f9fea67fc5aa8b6e4dcdc8b1bd9af8db2e22e62b))

## 7.0.1-alpha.4 (2023-07-12)

### Bug Fixes

* Fix empty build target ([#4627](https://github.com/streetsidesoftware/cspell/issues/4627)) ([1fcbf98](https://github.com/streetsidesoftware/cspell/commit/1fcbf9897b70691eb9947e43b966a5069fe37feb))

## 7.0.1-alpha.3 (2023-07-11)

### Bug Fixes

* support globs with `gzip` command. ([#4625](https://github.com/streetsidesoftware/cspell/issues/4625)) ([17fbc11](https://github.com/streetsidesoftware/cspell/commit/17fbc119d199ceac309df0d22fb4b1f9734b7015))

## [7.0.1-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v7.0.1-alpha.1...v7.0.1-alpha.2) (2023-07-09)

### Reverts

* Revert "v7.1.0-alpha.0" ([4835da6](https://github.com/streetsidesoftware/cspell/commit/4835da606a5710b6a0630bd7d0e57bddb2ecc2ba))

## 7.0.1-alpha.1 (2023-07-03)

**Note:** Version bump only for package cspell

## 7.0.1-alpha.0 (2023-06-09)

**Note:** Version bump only for package cspell

## 7.0.0-alpha.2 (2023-05-07)

**Note:** Version bump only for package cspell

## 7.0.0-alpha.1 (2023-04-14)

**Note:** Version bump only for package cspell

## 6.31.2 (2023-04-14)

**Note:** Version bump only for package cspell

## 6.31.1 (2023-03-24)

**Note:** Version bump only for package cspell

# 6.31.0 (2023-03-24)

**Note:** Version bump only for package cspell

## 6.30.2 (2023-03-18)

### Bug Fixes

* lock cosmiconfig to 8.0.0 ([#4335](https://github.com/streetsidesoftware/cspell/issues/4335)) ([0f37e2c](https://github.com/streetsidesoftware/cspell/commit/0f37e2cfa4b854c49f82b01bce57abb3c2c7f9ab))

## 6.30.1 (2023-03-17)

### Bug Fixes

* Update cosmiconfig to fix config loading issue. ([#4330](https://github.com/streetsidesoftware/cspell/issues/4330)) ([4a0bae5](https://github.com/streetsidesoftware/cspell/commit/4a0bae53074de54b748ce6b7124f585e28d2175e))

# 6.30.0 (2023-03-16)

**Note:** Version bump only for package cspell

## 6.29.3 (2023-03-14)

### Bug Fixes

* Add option to not auto stem during split ([#4310](https://github.com/streetsidesoftware/cspell/issues/4310)) ([23059da](https://github.com/streetsidesoftware/cspell/commit/23059dafd9ead91ef67cadf78a368e924b3436f6))

## 6.29.2 (2023-03-13)

### Bug Fixes

* (cspell-tools) Delay splitting _ till later ([#4309](https://github.com/streetsidesoftware/cspell/issues/4309)) ([0e517d1](https://github.com/streetsidesoftware/cspell/commit/0e517d13a6611e4d8a4f826a7d8d75352f5be4df))

## 6.29.1 (2023-03-13)

**Note:** Version bump only for package cspell

# 6.29.0 (2023-03-11)

**Note:** Version bump only for package cspell

# 6.28.0 (2023-03-03)

### Features

* Support multiple `repMap` combinations ([#4270](https://github.com/streetsidesoftware/cspell/issues/4270)) ([bbc3ed4](https://github.com/streetsidesoftware/cspell/commit/bbc3ed4a1edb704401f40cf8913a5a9f522562fc))

# 6.27.0 (2023-02-26)

### Features

* Support spell checking utf16 files with BOM ([#4232](https://github.com/streetsidesoftware/cspell/issues/4232)) ([8062f62](https://github.com/streetsidesoftware/cspell/commit/8062f621dff0432cd53ae17b1a22aaffd61f1b3b))

## 6.26.3 (2023-02-16)

### Bug Fixes

* Be able to read cache format from config ([#4190](https://github.com/streetsidesoftware/cspell/issues/4190)) ([6029893](https://github.com/streetsidesoftware/cspell/commit/60298938cd39669982ad1ca4293571242918761d))

## 6.26.2 (2023-02-16)

### Bug Fixes

* `node:worker_threads` breaks on node 14 ([#4185](https://github.com/streetsidesoftware/cspell/issues/4185)) ([8654ac7](https://github.com/streetsidesoftware/cspell/commit/8654ac7161b0ac558e864cfc116a9ad9ce6dc32e))

## 6.26.1 (2023-02-15)

### Bug Fixes

* improve Dynamic Import README.md ([#4178](https://github.com/streetsidesoftware/cspell/issues/4178)) ([4ad1133](https://github.com/streetsidesoftware/cspell/commit/4ad1133e6230969e9486d7e7a158cba5c3d75d7f))

# 6.26.0 (2023-02-15)

### Features

* All `flagWords` and `suggestWords` suggestions are preferred. ([#4176](https://github.com/streetsidesoftware/cspell/issues/4176)) ([abfb09c](https://github.com/streetsidesoftware/cspell/commit/abfb09c1fefe0b17aae332a23bb79017496c416a))

# 6.25.0 (2023-02-14)

### Bug Fixes

* Add `.webm` to know file types ([#4171](https://github.com/streetsidesoftware/cspell/issues/4171)) ([eeb9497](https://github.com/streetsidesoftware/cspell/commit/eeb9497143aa2215d857c8a872b94362c1ffe19e))

# 6.24.0 (2023-02-13)

**Note:** Version bump only for package cspell

## 6.23.1 (2023-02-12)

**Note:** Version bump only for package cspell

# 6.23.0 (2023-02-11)

**Note:** Version bump only for package cspell

# 6.22.0 (2023-02-05)

**Note:** Version bump only for package cspell

# 6.21.0 (2023-02-03)

**Note:** Version bump only for package cspell

## 6.20.1 (2023-02-01)

### Bug Fixes

* Correct .gitignore comment detection ([#4083](https://github.com/streetsidesoftware/cspell/issues/4083)) ([cadfbc4](https://github.com/streetsidesoftware/cspell/commit/cadfbc489f17db348459a09e7bd49514d07152a2))

# 6.20.0 (2023-02-01)

**Note:** Version bump only for package cspell

## 6.19.2 (2023-01-17)

**Note:** Version bump only for package cspell

## 6.19.1 (2023-01-17)

### Bug Fixes

* Remove `vitest` as a dependency ([#4031](https://github.com/streetsidesoftware/cspell/issues/4031)) ([2784b75](https://github.com/streetsidesoftware/cspell/commit/2784b75feefc81aa95806ac748fafb140c72b5fa))

# 6.19.0 (2023-01-16)

**Note:** Version bump only for package cspell

## 6.18.1 (2022-12-29)

**Note:** Version bump only for package cspell

# 6.18.0 (2022-12-21)

**Note:** Version bump only for package cspell

# 6.17.0 (2022-12-05)

**Note:** Version bump only for package cspell

# 6.16.0 (2022-12-02)

**Note:** Version bump only for package cspell

## 6.15.1 (2022-11-30)

**Note:** Version bump only for package cspell

# 6.15.0 (2022-11-25)

### Features

* Preferred suggestions are listed first ([#3869](https://github.com/streetsidesoftware/cspell/issues/3869)) ([1b7a65d](https://github.com/streetsidesoftware/cspell/commit/1b7a65d6ec851b78e1cc27c56f32b77adfba36e5))

## 6.14.3 (2022-11-17)

### Bug Fixes

* trie-lib - fix issue with reference radix. ([#3849](https://github.com/streetsidesoftware/cspell/issues/3849)) ([73af697](https://github.com/streetsidesoftware/cspell/commit/73af6978c53f2fd1f4cd528fd84e9d52a4149d5b))

## 6.14.2 (2022-11-11)

**Note:** Version bump only for package cspell

## 6.14.1 (2022-11-07)

**Note:** Version bump only for package cspell

# 6.14.0 (2022-11-03)

**Note:** Version bump only for package cspell

## 6.13.3 (2022-10-31)

### Bug Fixes

* Update dictionaries ([#3795](https://github.com/streetsidesoftware/cspell/issues/3795)) ([ae8de27](https://github.com/streetsidesoftware/cspell/commit/ae8de2754daafcdeb7e187a80e27b6f6c09dc1d7))

## 6.13.2 (2022-10-31)

### Bug Fixes

* Do not generate duplicate entries by default ([#3793](https://github.com/streetsidesoftware/cspell/issues/3793)) ([f27d3c6](https://github.com/streetsidesoftware/cspell/commit/f27d3c68ad454719d71724f92693db57270827b9))

## 6.13.1 (2022-10-28)

**Note:** Version bump only for package cspell

# 6.13.0 (2022-10-28)

### Bug Fixes

* make sure all forms are generated. ([#3783](https://github.com/streetsidesoftware/cspell/issues/3783)) ([70949a5](https://github.com/streetsidesoftware/cspell/commit/70949a5823f7c58052f9627c9455dcaa3496e8fb))

# 6.12.0 (2022-09-30)

### Features

* Use cspell-dictionary Module ([#3686](https://github.com/streetsidesoftware/cspell/issues/3686)) ([6441f4b](https://github.com/streetsidesoftware/cspell/commit/6441f4b41fe0e8b8188fa4c08999450c8958b6f0))

## 6.11.1 (2022-09-30)

### Bug Fixes

* Fix export of SpellingDictionaryCollection ([#3683](https://github.com/streetsidesoftware/cspell/issues/3683)) ([7665cdb](https://github.com/streetsidesoftware/cspell/commit/7665cdba702ebf9517a3c1c1008193e239a829d4))

# 6.11.0 (2022-09-30)

**Note:** Version bump only for package cspell

## 6.10.1 (2022-09-20)

**Note:** Version bump only for package cspell

# 6.10.0 (2022-09-19)

**Note:** Version bump only for package cspell

## 6.9.1 (2022-09-18)

**Note:** Version bump only for package cspell

# 6.9.0 (2022-09-15)

**Note:** Version bump only for package cspell

## 6.8.2 (2022-09-12)

**Note:** Version bump only for package cspell

## 6.8.1 (2022-08-26)

**Note:** Version bump only for package cspell

# 6.8.0 (2022-08-21)

### Bug Fixes

* Enable cli option `--validate-directives` ([#3461](https://github.com/streetsidesoftware/cspell/issues/3461)) ([52a5337](https://github.com/streetsidesoftware/cspell/commit/52a5337fb4090394342b45e31423752cda268559))

# 6.7.0 (2022-08-18)

### Features

* Adjust `.trie` formatting ([e2643c0](https://github.com/streetsidesoftware/cspell/commit/e2643c0bf508aa566823d2c697e5b94c77e6b874)), closes [#3443](https://github.com/streetsidesoftware/cspell/issues/3443) [#3430](https://github.com/streetsidesoftware/cspell/issues/3430)

## 6.6.1 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.9 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.8 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.7 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.6 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.5 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.4 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.3 (2022-08-10)

**Note:** Version bump only for package cspell

## 6.6.1-alpha.2 (2022-08-10)

**Note:** Version bump only for package cspell

## [6.6.1-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v6.6.1-alpha.0...v6.6.1-alpha.1) (2022-08-10)

**Note:** Version bump only for package cspell

## [6.6.1-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v6.6.0...v6.6.1-alpha.0) (2022-08-10)

**Note:** Version bump only for package cspell

# [6.6.0](https://github.com/streetsidesoftware/cspell/compare/v6.5.0...v6.6.0) (2022-08-08)

**Note:** Version bump only for package cspell

# [6.5.0](https://github.com/streetsidesoftware/cspell/compare/v6.4.2...v6.5.0) (2022-07-29)

**Note:** Version bump only for package cspell

## [6.4.2](https://github.com/streetsidesoftware/cspell/compare/v6.4.1...v6.4.2) (2022-07-26)

### Bug Fixes

* Add SQL dictionary ([#3277](https://github.com/streetsidesoftware/cspell/issues/3277)) ([ee716b8](https://github.com/streetsidesoftware/cspell/commit/ee716b867d583c58f5f31aeb867fc3ace25a1062))

## [6.4.1](https://github.com/streetsidesoftware/cspell/compare/v6.4.0...v6.4.1) (2022-07-23)

**Note:** Version bump only for package cspell

# [6.4.0](https://github.com/streetsidesoftware/cspell/compare/v6.4.0-alpha.0...v6.4.0) (2022-07-19)

**Note:** Version bump only for package cspell

# [6.4.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v6.3.0...v6.4.0-alpha.0) (2022-07-18)

**Note:** Version bump only for package cspell

# [6.3.0](https://github.com/streetsidesoftware/cspell/compare/v6.2.4-alpha.0...v6.3.0) (2022-07-17)

### Features

* Support a default reporter when linting. ([#3236](https://github.com/streetsidesoftware/cspell/issues/3236)) ([ffcaeff](https://github.com/streetsidesoftware/cspell/commit/ffcaeffc2e7395c99bff7a59e6b2a54ac31de384))

## [6.2.4-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v6.2.3...v6.2.4-alpha.0) (2022-07-13)

**Note:** Version bump only for package cspell

## [6.2.3](https://github.com/streetsidesoftware/cspell/compare/v6.2.2...v6.2.3) (2022-07-07)

**Note:** Version bump only for package cspell

## [6.2.2](https://github.com/streetsidesoftware/cspell/compare/v6.2.1...v6.2.2) (2022-07-01)

**Note:** Version bump only for package cspell

## [6.2.1](https://github.com/streetsidesoftware/cspell/compare/v6.2.0...v6.2.1) (2022-07-01)

**Note:** Version bump only for package cspell

# [6.2.0](https://github.com/streetsidesoftware/cspell/compare/v6.2.0-alpha.1...v6.2.0) (2022-06-30)

**Note:** Version bump only for package cspell

# [6.2.0-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v6.2.0-alpha.0...v6.2.0-alpha.1) (2022-06-29)

### Features

* Support global globs ([#3157](https://github.com/streetsidesoftware/cspell/issues/3157)) ([7c0ee59](https://github.com/streetsidesoftware/cspell/commit/7c0ee59056426729affca59353922b40e2b98e9a))

# [6.2.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v6.1.3...v6.2.0-alpha.0) (2022-06-28)

**Note:** Version bump only for package cspell

## [6.1.3](https://github.com/streetsidesoftware/cspell/compare/v6.1.3-alpha.1...v6.1.3) (2022-06-28)

**Note:** Version bump only for package cspell

## [6.1.3-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v6.1.3-alpha.0...v6.1.3-alpha.1) (2022-06-15)

**Note:** Version bump only for package cspell

## [6.1.3-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v6.1.2...v6.1.3-alpha.0) (2022-06-15)

**Note:** Version bump only for package cspell

## [6.1.2](https://github.com/streetsidesoftware/cspell/compare/v6.1.1...v6.1.2) (2022-06-09)

**Note:** Version bump only for package cspell

## [6.1.1](https://github.com/streetsidesoftware/cspell/compare/v6.1.0...v6.1.1) (2022-06-02)

### Bug Fixes

* missing language-id ([#2999](https://github.com/streetsidesoftware/cspell/issues/2999)) ([0e6b241](https://github.com/streetsidesoftware/cspell/commit/0e6b24195f2ad4b44907318fbafcf55c1727d415)), closes [#2998](https://github.com/streetsidesoftware/cspell/issues/2998)

# [6.1.0](https://github.com/streetsidesoftware/cspell/compare/v6.1.0-alpha.0...v6.1.0) (2022-05-31)

**Note:** Version bump only for package cspell

# [6.1.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v6.0.0...v6.1.0-alpha.0) (2022-05-28)

### Bug Fixes

* add docker by default ([#2931](https://github.com/streetsidesoftware/cspell/issues/2931)) ([15e8e17](https://github.com/streetsidesoftware/cspell/commit/15e8e17d9c78ed356f3f2eb7baa4ebb87beb6e38))

# [6.0.0](https://github.com/streetsidesoftware/cspell/compare/v6.0.0-alpha.0...v6.0.0) (2022-05-21)

**Note:** Version bump only for package cspell

# [6.0.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.21.1...v6.0.0-alpha.0) (2022-05-20)

**Note:** Version bump only for package cspell

## [5.21.1](https://github.com/streetsidesoftware/cspell/compare/v5.21.0...v5.21.1) (2022-05-20)

**Note:** Version bump only for package cspell

# [5.21.0](https://github.com/streetsidesoftware/cspell/compare/v5.20.0...v5.21.0) (2022-05-17)

### Features

* Upgrade `go` dictionary ([#2792](https://github.com/streetsidesoftware/cspell/issues/2792)) ([778b8fe](https://github.com/streetsidesoftware/cspell/commit/778b8fe7dd1cecf0546a6affadef78435e88a1aa))

# [5.20.0](https://github.com/streetsidesoftware/cspell/compare/v5.19.7...v5.20.0) (2022-05-02)

### Bug Fixes

* Roll back glob to 7.2.0 to fix Windows ([#2706](https://github.com/streetsidesoftware/cspell/issues/2706)) ([b42bbdd](https://github.com/streetsidesoftware/cspell/commit/b42bbdd28cbd8aefa28ce363b335fad781c37acf))
* Update to glob 8 ([#2707](https://github.com/streetsidesoftware/cspell/issues/2707)) ([07567cd](https://github.com/streetsidesoftware/cspell/commit/07567cd709e084b585255db8689e0758e504a4fc)), closes [#2706](https://github.com/streetsidesoftware/cspell/issues/2706)

### Features

* Upgrade python dictionary ([#2763](https://github.com/streetsidesoftware/cspell/issues/2763)) ([2a86f54](https://github.com/streetsidesoftware/cspell/commit/2a86f549cb4baed97b39e35b1a78eeedcd948c32))

## [5.19.7](https://github.com/streetsidesoftware/cspell/compare/v5.19.6...v5.19.7) (2022-04-09)

### Bug Fixes

* Ignore directories when checking files ([#2680](https://github.com/streetsidesoftware/cspell/issues/2680)) ([fa777f0](https://github.com/streetsidesoftware/cspell/commit/fa777f04981b8814b827721eaa8b9278ae95effb))

## [5.19.6](https://github.com/streetsidesoftware/cspell/compare/v5.19.5...v5.19.6) (2022-04-08)

### Bug Fixes

* add --cache-reset option ([#2677](https://github.com/streetsidesoftware/cspell/issues/2677)) ([631073b](https://github.com/streetsidesoftware/cspell/commit/631073b42f24dec00eed9740cb8ee2e5bce4b07f))
* fix issue with stale cache entries ([#2673](https://github.com/streetsidesoftware/cspell/issues/2673)) ([15995a8](https://github.com/streetsidesoftware/cspell/commit/15995a898cf4284e33e5a48fd4cfa9ef0d329d6e))
* relative path name ([#2675](https://github.com/streetsidesoftware/cspell/issues/2675)) ([51fc55b](https://github.com/streetsidesoftware/cspell/commit/51fc55b72374b46d5fdf165d5ed1ac3b6bf9f1d6))

## [5.19.5](https://github.com/streetsidesoftware/cspell/compare/v5.19.4...v5.19.5) (2022-04-01)

### Bug Fixes

* Be able to disable the default configuration ([#2643](https://github.com/streetsidesoftware/cspell/issues/2643)) ([46c1e4f](https://github.com/streetsidesoftware/cspell/commit/46c1e4f6047477cc35e6c154431e8e2cdaacb3b5))

## [5.19.4](https://github.com/streetsidesoftware/cspell/compare/v5.19.3...v5.19.4) (2022-04-01)

### Bug Fixes

* Performance - only serialize config if in debug mode ([#2640](https://github.com/streetsidesoftware/cspell/issues/2640)) ([d16c4f9](https://github.com/streetsidesoftware/cspell/commit/d16c4f975a612f6906399e8801a7e1d49074a8f0))

## [5.19.3](https://github.com/streetsidesoftware/cspell/compare/v5.19.2...v5.19.3) (2022-03-24)

### Bug Fixes

* Invalidate the cache if cspell version has changed. ([#2580](https://github.com/streetsidesoftware/cspell/issues/2580)) ([2174928](https://github.com/streetsidesoftware/cspell/commit/21749287a169d41db0d4c63d5069561f33259f26))

## [5.19.2](https://github.com/streetsidesoftware/cspell/compare/v5.19.1...v5.19.2) (2022-03-14)

**Note:** Version bump only for package cspell

## [5.19.1](https://github.com/streetsidesoftware/cspell/compare/v5.19.0...v5.19.1) (2022-03-13)

**Note:** Version bump only for package cspell

# [5.19.0](https://github.com/streetsidesoftware/cspell/compare/v5.18.5...v5.19.0) (2022-03-12)

**Note:** Version bump only for package cspell

## [5.18.5](https://github.com/streetsidesoftware/cspell/compare/v5.18.4...v5.18.5) (2022-02-15)

### Bug Fixes

* Add dart language support ([#2444](https://github.com/streetsidesoftware/cspell/issues/2444)) ([bbcf793](https://github.com/streetsidesoftware/cspell/commit/bbcf7938eb5c6cfab3893bd967e43f368472ac27))
* Make it easier to work with RTL languages. ([#2410](https://github.com/streetsidesoftware/cspell/issues/2410)) ([91b035f](https://github.com/streetsidesoftware/cspell/commit/91b035f719baf3c21d3a8b9d92419234ec37b500))

## [5.18.4](https://github.com/streetsidesoftware/cspell/compare/v5.18.3...v5.18.4) (2022-02-07)

### Bug Fixes

* Add simple repl feature to suggestions. ([#2403](https://github.com/streetsidesoftware/cspell/issues/2403)) ([f9835b7](https://github.com/streetsidesoftware/cspell/commit/f9835b7d38a288793b789f4858c06d8812be4906))
* Improve speed of suggestions for long words. ([#2406](https://github.com/streetsidesoftware/cspell/issues/2406)) ([6c76907](https://github.com/streetsidesoftware/cspell/commit/6c769079257e45877c4ee5ba5139351878037ab0))

## [5.18.3](https://github.com/streetsidesoftware/cspell/compare/v5.18.2...v5.18.3) (2022-02-04)

### Bug Fixes

* Add support for R ([#2394](https://github.com/streetsidesoftware/cspell/issues/2394)) ([6888d48](https://github.com/streetsidesoftware/cspell/commit/6888d482748051a795418116e09ae27ce41c474c))
* Improve cli summary and progress ([#2396](https://github.com/streetsidesoftware/cspell/issues/2396)) ([d52d68a](https://github.com/streetsidesoftware/cspell/commit/d52d68aeaf9ef301bcc1b1862867efb639ba061d))
* Upgrade to commend-json 4.2.2 ([#2399](https://github.com/streetsidesoftware/cspell/issues/2399)) ([e5f643e](https://github.com/streetsidesoftware/cspell/commit/e5f643ef026ed4175132b012ab26035638d650e9))

## [5.18.2](https://github.com/streetsidesoftware/cspell/compare/v5.18.1...v5.18.2) (2022-02-03)

### Bug Fixes

* fix suggestion output ([#2390](https://github.com/streetsidesoftware/cspell/issues/2390)) ([bda442d](https://github.com/streetsidesoftware/cspell/commit/bda442de1e529df15f0890c03d11907d4b0b86a1))

### Reverts

* Revert "ci: Workflow Bot -- Update ALL Dependencies (#2388)" (#2391) ([7f093f9](https://github.com/streetsidesoftware/cspell/commit/7f093f9429cb7b755392996d54449f29f46f138a)), closes [#2388](https://github.com/streetsidesoftware/cspell/issues/2388) [#2391](https://github.com/streetsidesoftware/cspell/issues/2391)

## [5.18.1](https://github.com/streetsidesoftware/cspell/compare/v5.18.0...v5.18.1) (2022-02-03)

### Bug Fixes

* Improve suggestions when using weights. ([#2387](https://github.com/streetsidesoftware/cspell/issues/2387)) ([c9d070d](https://github.com/streetsidesoftware/cspell/commit/c9d070d86a7f021f22428b2da56a98f185c3a128))
* Upgrade to commander 9.0.0 ([#2367](https://github.com/streetsidesoftware/cspell/issues/2367)) ([f255b70](https://github.com/streetsidesoftware/cspell/commit/f255b70b30da3002aaba477df3fa6f5ca2b90752))

# [5.18.0](https://github.com/streetsidesoftware/cspell/compare/v5.18.0-alpha.0...v5.18.0) (2022-01-31)

**Note:** Version bump only for package cspell

# [5.18.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.17.0...v5.18.0-alpha.0) (2022-01-30)

### Bug Fixes

* Show an error if a glob starts/ends with a single quote ([#2357](https://github.com/streetsidesoftware/cspell/issues/2357)) ([924200e](https://github.com/streetsidesoftware/cspell/commit/924200e9329503cebdbac5e2b8aafffec815d978)), closes [#2350](https://github.com/streetsidesoftware/cspell/issues/2350)

# [5.17.0](https://github.com/streetsidesoftware/cspell/compare/v5.17.0-alpha.0...v5.17.0) (2022-01-26)

### Bug Fixes

* do not depend upon @types/glob in exports. ([#2346](https://github.com/streetsidesoftware/cspell/issues/2346)) ([7740f55](https://github.com/streetsidesoftware/cspell/commit/7740f5554bf756687bb708585fd1b6c6b7b85211))

# [5.17.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.16.0...v5.17.0-alpha.0) (2022-01-26)

### Bug Fixes

* (cspell) Mark forbidden and no suggest words ([#2302](https://github.com/streetsidesoftware/cspell/issues/2302)) ([c474cec](https://github.com/streetsidesoftware/cspell/commit/c474cec8e2983979c36b13ee1d33c334f027667f))
* add `--fail-fast` to cspell README.md ([#2340](https://github.com/streetsidesoftware/cspell/issues/2340)) ([5554ecb](https://github.com/streetsidesoftware/cspell/commit/5554ecbcdee4c25998b327918f9461c266558ce0))

### Features

* add `--fail-fast` cli option ([#2338](https://github.com/streetsidesoftware/cspell/issues/2338)) ([7c17c22](https://github.com/streetsidesoftware/cspell/commit/7c17c226f8037f7d90cf64277f1ff8e1815e1750)), closes [#2294](https://github.com/streetsidesoftware/cspell/issues/2294)
* Add `failFast` config option to exit as soon as an issue encountered ([#2307](https://github.com/streetsidesoftware/cspell/issues/2307)) ([26dd25a](https://github.com/streetsidesoftware/cspell/commit/26dd25af41ea6a15e98f82b1853e942e333085c0))
* Add cli command to show suggestions. ([#2299](https://github.com/streetsidesoftware/cspell/issues/2299)) ([1db4777](https://github.com/streetsidesoftware/cspell/commit/1db47775e7903a9b5838bdc5b49229258f5e683b))
* Support REPL style reading from stdin  ([#2342](https://github.com/streetsidesoftware/cspell/issues/2342)) ([78bf751](https://github.com/streetsidesoftware/cspell/commit/78bf751930dff94320326e97b91fea2a39edc6e1)), closes [#2294](https://github.com/streetsidesoftware/cspell/issues/2294)
* Support using `stdin` for trace. ([#2300](https://github.com/streetsidesoftware/cspell/issues/2300)) ([7967ffe](https://github.com/streetsidesoftware/cspell/commit/7967ffec9f2dbbed0bf73eb8f2e648e9f67a7f95))

# [5.16.0](https://github.com/streetsidesoftware/cspell/compare/v5.15.3...v5.16.0) (2022-01-20)

**Note:** Version bump only for package cspell

## [5.15.3](https://github.com/streetsidesoftware/cspell/compare/v5.15.2...v5.15.3) (2022-01-20)

### Bug Fixes

* Handle missing files when spell checking from a file list. ([#2286](https://github.com/streetsidesoftware/cspell/issues/2286)) ([fd1e7e2](https://github.com/streetsidesoftware/cspell/commit/fd1e7e24492864318cc19229f44e18f6beff668f)), closes [#2285](https://github.com/streetsidesoftware/cspell/issues/2285)

## [5.15.2](https://github.com/streetsidesoftware/cspell/compare/v5.15.1...v5.15.2) (2022-01-11)

### Bug Fixes

* Fix backwards compatibility for Reporters ([#2229](https://github.com/streetsidesoftware/cspell/issues/2229)) ([38d17b2](https://github.com/streetsidesoftware/cspell/commit/38d17b299a974d4a93e505d42987f1fb1d62fcf8))

## [5.15.1](https://github.com/streetsidesoftware/cspell/compare/v5.15.0...v5.15.1) (2022-01-07)

**Note:** Version bump only for package cspell

# [5.15.0](https://github.com/streetsidesoftware/cspell/compare/v5.14.0...v5.15.0) (2022-01-07)

### Bug Fixes

* Invalidate cache when config has changed ([#2160](https://github.com/streetsidesoftware/cspell/issues/2160)) ([705c638](https://github.com/streetsidesoftware/cspell/commit/705c638bb305ab448e04d231d03a4310561eb6d1))

### Features

* Add support for cache options in config files. ([#2184](https://github.com/streetsidesoftware/cspell/issues/2184)) ([7256919](https://github.com/streetsidesoftware/cspell/commit/7256919ea4c4d8a924e21906f602fb160e2f96c9))

# [5.14.0](https://github.com/streetsidesoftware/cspell/compare/v5.14.0-alpha.0...v5.14.0) (2021-12-29)

**Note:** Version bump only for package cspell

# [5.14.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.13.4...v5.14.0-alpha.0) (2021-12-29)

### Bug Fixes

* Make sure help is not shown if the file list is empty. ([#2150](https://github.com/streetsidesoftware/cspell/issues/2150)) ([67c975a](https://github.com/streetsidesoftware/cspell/commit/67c975a8c87bb5265edb73cda194de057f4d3aef))

### Features

* Support `--file-list` cli option ([#2130](https://github.com/streetsidesoftware/cspell/issues/2130)) ([eef7b92](https://github.com/streetsidesoftware/cspell/commit/eef7b92a36750cdb1d22c4e44fe900f1f81f0a81)), closes [#1850](https://github.com/streetsidesoftware/cspell/issues/1850)

## [5.13.4](https://github.com/streetsidesoftware/cspell/compare/v5.13.3...v5.13.4) (2021-12-18)

### Features

* report error and fail for unsupported NodeJS versions ([#1984](https://github.com/streetsidesoftware/cspell/issues/1984)) ([#2111](https://github.com/streetsidesoftware/cspell/issues/2111)) ([52bb33e](https://github.com/streetsidesoftware/cspell/commit/52bb33ea7114a179e931203423a328e5508fd037))

## [5.13.3](https://github.com/streetsidesoftware/cspell/compare/v5.13.2...v5.13.3) (2021-12-11)

**Note:** Version bump only for package cspell

## [5.13.2](https://github.com/streetsidesoftware/cspell/compare/v5.13.1...v5.13.2) (2021-12-07)

**Note:** Version bump only for package cspell

## [5.13.1](https://github.com/streetsidesoftware/cspell/compare/v5.13.0...v5.13.1) (2021-11-24)

### Bug Fixes

* fix [#2011](https://github.com/streetsidesoftware/cspell/issues/2011) ([#2013](https://github.com/streetsidesoftware/cspell/issues/2013)) ([15abecb](https://github.com/streetsidesoftware/cspell/commit/15abecba58bf940f6fe49852363649dde6f86beb))

# [5.13.0](https://github.com/streetsidesoftware/cspell/compare/v5.12.6...v5.13.0) (2021-11-17)

### Features

* Support `--dot` command line option. ([#1985](https://github.com/streetsidesoftware/cspell/issues/1985)) ([fa1aa11](https://github.com/streetsidesoftware/cspell/commit/fa1aa116f0cc7468cbcf38320deba3bd0b62cc9c))

## [5.12.6](https://github.com/streetsidesoftware/cspell/compare/v5.12.5...v5.12.6) (2021-11-04)

**Note:** Version bump only for package cspell

## [5.12.5](https://github.com/streetsidesoftware/cspell/compare/v5.12.4...v5.12.5) (2021-11-02)

### Bug Fixes

* Add trace options ([#1939](https://github.com/streetsidesoftware/cspell/issues/1939)) ([191fc52](https://github.com/streetsidesoftware/cspell/commit/191fc52361d3f68d10be169b86d76359c848bf90))
* Fix reading dictionary test to use `path` ([#1938](https://github.com/streetsidesoftware/cspell/issues/1938)) ([fa4ea3f](https://github.com/streetsidesoftware/cspell/commit/fa4ea3f0a379c5175fe3e930e1915f4521295583))

## [5.12.4](https://github.com/streetsidesoftware/cspell/compare/v5.12.3...v5.12.4) (2021-10-31)

### Bug Fixes

* Change `--wordsOnly` option to `--words-only` ([#1928](https://github.com/streetsidesoftware/cspell/issues/1928)) ([aac621f](https://github.com/streetsidesoftware/cspell/commit/aac621f46b6f1f60185e33cd06d9aab06438bf8f))

## [5.12.3](https://github.com/streetsidesoftware/cspell/compare/v5.12.2...v5.12.3) (2021-10-08)

### Bug Fixes

* Fix `.gitignore` glob matching ([#1847](https://github.com/streetsidesoftware/cspell/issues/1847)) ([d36449b](https://github.com/streetsidesoftware/cspell/commit/d36449b125c9f02556f2306164dd32d32392bed8)), closes [#1846](https://github.com/streetsidesoftware/cspell/issues/1846)
* Use the repository root by default when no root is specified. ([#1851](https://github.com/streetsidesoftware/cspell/issues/1851)) ([81d005e](https://github.com/streetsidesoftware/cspell/commit/81d005e17774ea0163b1fc3ff83afe253624fce6)), closes [#1846](https://github.com/streetsidesoftware/cspell/issues/1846)

## [5.12.2](https://github.com/streetsidesoftware/cspell/compare/v5.12.1...v5.12.2) (2021-10-06)

**Note:** Version bump only for package cspell

## [5.12.1](https://github.com/streetsidesoftware/cspell/compare/v5.12.0...v5.12.1) (2021-10-06)

### Bug Fixes

* fix [#1807](https://github.com/streetsidesoftware/cspell/issues/1807) ([#1837](https://github.com/streetsidesoftware/cspell/issues/1837)) ([9608b77](https://github.com/streetsidesoftware/cspell/commit/9608b772f0ee09e55de66b8dc4dcb868ab4d7d32))

# [5.12.0](https://github.com/streetsidesoftware/cspell/compare/v5.12.0-alpha.0...v5.12.0) (2021-10-05)

**Note:** Version bump only for package cspell

# [5.12.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.11.1...v5.12.0-alpha.0) (2021-10-05)

### Bug Fixes

* support `--no-gitignore` option ([#1833](https://github.com/streetsidesoftware/cspell/issues/1833)) ([0b89fed](https://github.com/streetsidesoftware/cspell/commit/0b89fedc515c4ee237ea5404db791f6663332716))

### Features

* Add support for `.gitignore` ([#1823](https://github.com/streetsidesoftware/cspell/issues/1823)) ([9b0dfe4](https://github.com/streetsidesoftware/cspell/commit/9b0dfe4e50f6b8210d16f9a63ae47949c706c462))

## [5.11.1](https://github.com/streetsidesoftware/cspell/compare/v5.11.0...v5.11.1) (2021-09-29)

### Bug Fixes

* Move `[@types](https://github.com/types)` dependencies to dev ([#1811](https://github.com/streetsidesoftware/cspell/issues/1811)) ([c29fdcb](https://github.com/streetsidesoftware/cspell/commit/c29fdcb8dc5f5d2766a9dd139bd428e532739b3c))

# [5.11.0](https://github.com/streetsidesoftware/cspell/compare/v5.11.0-alpha.0...v5.11.0) (2021-09-28)

**Note:** Version bump only for package cspell

# [5.11.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.10.1...v5.11.0-alpha.0) (2021-09-28)

### Bug Fixes

* Display filenames instead of URI's ([#1773](https://github.com/streetsidesoftware/cspell/issues/1773)) ([5a9542e](https://github.com/streetsidesoftware/cspell/commit/5a9542e1818ff68e89edc9a5c968741ad1b8751f))
* Ensure cli-reporter displays the correct message. ([#1774](https://github.com/streetsidesoftware/cspell/issues/1774)) ([c0aaf45](https://github.com/streetsidesoftware/cspell/commit/c0aaf45ea1f147fda3514149a85d2c2bd70a749f))
* make sure `issue.uri` is actually a URI. ([#1746](https://github.com/streetsidesoftware/cspell/issues/1746)) ([4268057](https://github.com/streetsidesoftware/cspell/commit/4268057c772db4242dde033c69a4448c26739863))

### Features

* add --cache option to lint only changed files ([#1763](https://github.com/streetsidesoftware/cspell/issues/1763)) ([4bdfd09](https://github.com/streetsidesoftware/cspell/commit/4bdfd09677e7b744f79f4e35675760e7083d68e7))

## [5.10.1](https://github.com/streetsidesoftware/cspell/compare/v5.10.0...v5.10.1) (2021-09-17)

**Note:** Version bump only for package cspell

# [5.10.0](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.6...v5.10.0) (2021-09-17)

**Note:** Version bump only for package cspell

# [5.10.0-alpha.6](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.5...v5.10.0-alpha.6) (2021-09-17)

### Bug Fixes

* Make dict-en-gb version 2 optional because of license. ([#1710](https://github.com/streetsidesoftware/cspell/issues/1710)) ([046a704](https://github.com/streetsidesoftware/cspell/commit/046a704e7c5f4a45c065d33d815faa2e464e08c9))

# [5.10.0-alpha.5](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.4...v5.10.0-alpha.5) (2021-09-16)

**Note:** Version bump only for package cspell

# [5.10.0-alpha.4](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.3...v5.10.0-alpha.4) (2021-09-16)

**Note:** Version bump only for package cspell

# [5.10.0-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.2...v5.10.0-alpha.3) (2021-09-16)

### Bug Fixes

* Fix accidental promise returned by reporters. ([#1702](https://github.com/streetsidesoftware/cspell/issues/1702)) ([8c125c2](https://github.com/streetsidesoftware/cspell/commit/8c125c2b2f671bfb6c97b06ecc138a7f7dc8bb84))

# [5.10.0-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.0...v5.10.0-alpha.2) (2021-09-13)

**Note:** Version bump only for package cspell

# [5.10.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.1...v5.10.0-alpha.0) (2021-09-13)

### Features

- Custom reporters support ([#1643](https://github.com/streetsidesoftware/cspell/issues/1643)) ([3b9ac1b](https://github.com/streetsidesoftware/cspell/commit/3b9ac1b50972527288aa076970f657546a3ad551))

## [5.9.1](https://github.com/streetsidesoftware/cspell/compare/v5.9.1-alpha.1...v5.9.1) (2021-09-12)

**Note:** Version bump only for package cspell

## [5.9.1-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.9.1-alpha.0...v5.9.1-alpha.1) (2021-09-12)

### Reverts

- Revert "enable incremental typescript builds (#1671)" ([65664b2](https://github.com/streetsidesoftware/cspell/commit/65664b213e67a4108a2d38692f8fbd471b00afb7)), closes [#1671](https://github.com/streetsidesoftware/cspell/issues/1671)

## [5.9.1-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.0...v5.9.1-alpha.0) (2021-09-11)

### Bug Fixes

- drop need for iconv-lite and iterable-to-stream ([#1677](https://github.com/streetsidesoftware/cspell/issues/1677)) ([c7ffcc7](https://github.com/streetsidesoftware/cspell/commit/c7ffcc786ed360fc1a59f84915ea7d204d51d3a5))
- Fix version number reference ([#1640](https://github.com/streetsidesoftware/cspell/issues/1640)) ([1c18b36](https://github.com/streetsidesoftware/cspell/commit/1c18b366382d6044e633e41bda99f3d180e36d3c)), closes [#1638](https://github.com/streetsidesoftware/cspell/issues/1638)

# [5.9.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.0-alpha.0...v5.9.0) (2021-08-31)

**Note:** Version bump only for package cspell

# [5.9.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.8.2...v5.9.0-alpha.0) (2021-08-31)

**Note:** Version bump only for package cspell

## [5.8.2](https://github.com/streetsidesoftware/cspell/compare/v5.8.1...v5.8.2) (2021-08-25)

**Note:** Version bump only for package cspell

## [5.8.1](https://github.com/streetsidesoftware/cspell/compare/v5.8.0...v5.8.1) (2021-08-24)

### Bug Fixes

- Fix some minor issues ([#1562](https://github.com/streetsidesoftware/cspell/issues/1562)) ([8512920](https://github.com/streetsidesoftware/cspell/commit/851292088a6681d72165f6a498c854abcaef5d3e))
- fix wrapping issue in `trace` command with compound words. ([#1574](https://github.com/streetsidesoftware/cspell/issues/1574)) ([e6ebda8](https://github.com/streetsidesoftware/cspell/commit/e6ebda86a11aaea06b3d04611426579ac0e87c41))

# [5.8.0](https://github.com/streetsidesoftware/cspell/compare/v5.7.2...v5.8.0) (2021-08-21)

### Features

- Improve `trace` words command results. ([#1558](https://github.com/streetsidesoftware/cspell/issues/1558)) ([ed8a5dc](https://github.com/streetsidesoftware/cspell/commit/ed8a5dc17ffa6de901887d3bd5b6bacf67217866))

## [5.7.2](https://github.com/streetsidesoftware/cspell/compare/v5.7.1...v5.7.2) (2021-08-16)

### Bug Fixes

- Add software licenses dictionary ([#1523](https://github.com/streetsidesoftware/cspell/issues/1523)) ([43910d5](https://github.com/streetsidesoftware/cspell/commit/43910d526b97402239b0ad38aef74cd8add1b749))
- Detect when module default is used with `cspell.config.js` files. ([#1529](https://github.com/streetsidesoftware/cspell/issues/1529)) ([e05aeff](https://github.com/streetsidesoftware/cspell/commit/e05aeffaa398366f4b6ce4c10728df8d2fa1860f))
- Update `cspell` README.md ([#1530](https://github.com/streetsidesoftware/cspell/issues/1530)) ([9c0dfd6](https://github.com/streetsidesoftware/cspell/commit/9c0dfd61ba3236f5fee9b113c36a089d2ca11000))

## [5.7.1](https://github.com/streetsidesoftware/cspell/compare/v5.7.0...v5.7.1) (2021-08-14)

**Note:** Version bump only for package cspell

# [5.7.0](https://github.com/streetsidesoftware/cspell/compare/v5.7.0-alpha.0...v5.7.0) (2021-08-14)

**Note:** Version bump only for package cspell

# [5.7.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.6.7...v5.7.0-alpha.0) (2021-08-14)

### Features

- Support forbidden words in dictionaries ([#1516](https://github.com/streetsidesoftware/cspell/issues/1516)) ([8d7596b](https://github.com/streetsidesoftware/cspell/commit/8d7596b004100dd296e1058659e39eefc56c6f56))

## [5.6.7](https://github.com/streetsidesoftware/cspell/compare/v5.6.6...v5.6.7) (2021-08-13)

**Note:** Version bump only for package cspell

## [5.6.6](https://github.com/streetsidesoftware/cspell/compare/v5.6.5...v5.6.6) (2021-06-18)

**Note:** Version bump only for package cspell

## [5.6.5](https://github.com/streetsidesoftware/cspell/compare/v5.6.4...v5.6.5) (2021-06-18)

### Bug Fixes

- fix regression related to trailing accents missing in legacy dicts ([#1345](https://github.com/streetsidesoftware/cspell/issues/1345)) ([b8d8810](https://github.com/streetsidesoftware/cspell/commit/b8d8810fafb585a4ffc77f3cb350888d9a6a52ed))

## [5.6.4](https://github.com/streetsidesoftware/cspell/compare/v5.6.3...v5.6.4) (2021-06-15)

### Bug Fixes

- early out on checking binary files. ([#1337](https://github.com/streetsidesoftware/cspell/issues/1337)) ([a948808](https://github.com/streetsidesoftware/cspell/commit/a9488080daf99ed992ac55e450d522a78e5708d7))

## [5.6.3](https://github.com/streetsidesoftware/cspell/compare/v5.6.2...v5.6.3) (2021-06-11)

**Note:** Version bump only for package cspell

## [5.6.2](https://github.com/streetsidesoftware/cspell/compare/v5.6.1...v5.6.2) (2021-06-10)

**Note:** Version bump only for package cspell

## [5.6.1](https://github.com/streetsidesoftware/cspell/compare/v5.6.0...v5.6.1) (2021-06-09)

**Note:** Version bump only for package cspell

# [5.6.0](https://github.com/streetsidesoftware/cspell/compare/v5.5.2...v5.6.0) (2021-06-05)

### Features

- support `.pnp.js` when loading configurations. ([#1307](https://github.com/streetsidesoftware/cspell/issues/1307)) ([76da68c](https://github.com/streetsidesoftware/cspell/commit/76da68cf6a13586598689d01bce3a24bc255530a))

## [5.5.2](https://github.com/streetsidesoftware/cspell/compare/v5.5.1...v5.5.2) (2021-05-30)

**Note:** Version bump only for package cspell

## [5.5.1](https://github.com/streetsidesoftware/cspell/compare/v5.5.0...v5.5.1) (2021-05-29)

### Bug Fixes

- Update CHANGELOG.md ([#1291](https://github.com/streetsidesoftware/cspell/issues/1291)) ([7129c1b](https://github.com/streetsidesoftware/cspell/commit/7129c1bdaa107ae8990ecf8ca2120e82031f2c05))

# [5.5.0](https://github.com/streetsidesoftware/cspell/compare/v5.4.1...v5.5.0) (2021-05-29)

### Features

- Remove incorrect Ignore Hex Digits Regexp ([#1277](https://github.com/streetsidesoftware/cspell/issues/1277)) ([2621eb0](https://github.com/streetsidesoftware/cspell/commit/2621eb02f487d9e466b4936bde8650c338b320b8)), closes [#1276](https://github.com/streetsidesoftware/cspell/issues/1276)

  Minor **BREAKING** change.

  `cspell` used to ignore all words that had just hex characters `[a-f]`. This lead to issues like [#1276](https://github.com/streetsidesoftware/cspell/issues/1276). `cspell` will no longer ignore words with only hex characters. To avoid load of false positives (cases where a hex number was intended)
  some new patterns were added:

  - `CStyleHexValue`: C Style `0x[a-f0-9]+`
  - `CSSHexValue`: CSS Style `#[a-f0-9]+`
  - `CommitHash`: GitHub Style commit hashes. - this ignores hex only words that are 7 characters or longer
    might still lead to false negatives.
  - `UnicodeRef`: ignores `U+0000` style codes and ranges `U+0000-ffff`
  - `UUID`: ignores formatted UUIDs

  **Related Changes**

  - fix: Remove incorrect Ignore Hex Digits Regexp
    Fix: #1276
  - fix: Ignore commit hashes and C Style Hex numbers
  - fix: Ignore CSS Hex Values and UUIDs
  - fix: Add more common patterns to ignore
    Try to detect common hex and Unicode patterns to ignore.

## [5.4.1](https://github.com/streetsidesoftware/cspell/compare/v5.4.0...v5.4.1) (2021-05-11)

### Bug Fixes

- correct how dictionaries are disabled ([#1229](https://github.com/streetsidesoftware/cspell/issues/1229)) ([60975ea](https://github.com/streetsidesoftware/cspell/commit/60975ea03ad11cc92d2841ca0baf0d60e3d39907)), closes [#1215](https://github.com/streetsidesoftware/cspell/issues/1215)

# [5.4.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.12...v5.4.0) (2021-05-05)

**Note:** Version bump only for package cspell

## [5.3.12](https://github.com/streetsidesoftware/cspell/compare/v5.3.11...v5.3.12) (2021-04-06)

### Bug Fixes

- Update dictionaries ([#1136](https://github.com/streetsidesoftware/cspell/issues/1136)) ([64eba51](https://github.com/streetsidesoftware/cspell/commit/64eba51b75e0e2dde0568f46b4312c949b884a73))

## [5.3.11](https://github.com/streetsidesoftware/cspell/compare/v5.3.10...v5.3.11) (2021-04-03)

### Bug Fixes

- Fix command line exclusions ([#1119](https://github.com/streetsidesoftware/cspell/issues/1119)) ([c191fc5](https://github.com/streetsidesoftware/cspell/commit/c191fc5c4901059cddf1ea70479563bbf054c395))

## [5.3.10](https://github.com/streetsidesoftware/cspell/compare/v5.3.9...v5.3.10) (2021-04-02)

### Bug Fixes

- file globs listed on the command line override files in the config. ([#1117](https://github.com/streetsidesoftware/cspell/issues/1117)) ([25c501d](https://github.com/streetsidesoftware/cspell/commit/25c501d2267b8aca93624e0c4e036df5fdef7d20)), closes [#1115](https://github.com/streetsidesoftware/cspell/issues/1115)
- issue [#1114](https://github.com/streetsidesoftware/cspell/issues/1114) ([#1116](https://github.com/streetsidesoftware/cspell/issues/1116)) ([77ae68a](https://github.com/streetsidesoftware/cspell/commit/77ae68ae346dcf27f780d4139be57a234b7a1485))

## [5.3.9](https://github.com/streetsidesoftware/cspell/compare/v5.3.8...v5.3.9) (2021-03-19)

**Note:** Version bump only for package cspell

## [5.3.8](https://github.com/streetsidesoftware/cspell/compare/v5.3.7...v5.3.8) (2021-03-17)

**Note:** Version bump only for package cspell

## [5.3.7](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.3...v5.3.7) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.2...v5.3.7-alpha.3) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.1...v5.3.7-alpha.2) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.0...v5.3.7-alpha.1) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.6...v5.3.7-alpha.0) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.6](https://github.com/streetsidesoftware/cspell/compare/v5.3.5...v5.3.6) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.5](https://github.com/streetsidesoftware/cspell/compare/v5.3.4...v5.3.5) (2021-03-05)

### Bug Fixes

- make sure glob patterns match on windows ([#1039](https://github.com/streetsidesoftware/cspell/issues/1039)) ([1e58e4c](https://github.com/streetsidesoftware/cspell/commit/1e58e4c0c1fb706fc61fb82512d6fe92ad0b58fc))

## [5.3.4](https://github.com/streetsidesoftware/cspell/compare/v5.3.3...v5.3.4) (2021-03-01)

**Note:** Version bump only for package cspell

## [5.3.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.2...v5.3.3) (2021-02-26)

### Bug Fixes

- Report the root cause of a dictionary error. ([#1014](https://github.com/streetsidesoftware/cspell/issues/1014)) ([8c1debd](https://github.com/streetsidesoftware/cspell/commit/8c1debde5de8c040b0110644e9b45f60d42bafc3))

## [5.3.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.1...v5.3.2) (2021-02-26)

### Bug Fixes

- do not check binary files and add Ada dictionary ([#1011](https://github.com/streetsidesoftware/cspell/issues/1011)) ([af04ead](https://github.com/streetsidesoftware/cspell/commit/af04ead1dcd517b5de813a24d4d17424971a5606))

## [5.3.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.0...v5.3.1) (2021-02-25)

### Bug Fixes

- make sure to export all needed cspell types. ([#1006](https://github.com/streetsidesoftware/cspell/issues/1006)) ([c625479](https://github.com/streetsidesoftware/cspell/commit/c625479be185f287e297a1dcddbcfa2aa24b0d0d))

# [5.3.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.4...v5.3.0) (2021-02-25)

**Note:** Version bump only for package cspell

# [5.3.0-alpha.4](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.3...v5.3.0-alpha.4) (2021-02-25)

### Bug Fixes

- [#1000](https://github.com/streetsidesoftware/cspell/issues/1000) ([#1002](https://github.com/streetsidesoftware/cspell/issues/1002)) ([d82a4a2](https://github.com/streetsidesoftware/cspell/commit/d82a4a2921fd70a790d8b0839e6be6f342501c26))

# [5.3.0-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.2...v5.3.0-alpha.3) (2021-02-23)

### Bug Fixes

- Improve reporting on files matching glob patterns. ([#994](https://github.com/streetsidesoftware/cspell/issues/994)) ([da991f9](https://github.com/streetsidesoftware/cspell/commit/da991f93a061c5b64ce437332c7107ef2ef89472))

# [5.3.0-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.1...v5.3.0-alpha.2) (2021-02-22)

**Note:** Version bump only for package cspell

# [5.3.0-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.0...v5.3.0-alpha.1) (2021-02-19)

### Bug Fixes

- Display suggestions -- regression ([#976](https://github.com/streetsidesoftware/cspell/issues/976)) ([e3970c7](https://github.com/streetsidesoftware/cspell/commit/e3970c7fa4932ab0a610fcb9c0907b45ffa7f0df))
- Fix schema generation to use `deprecatedMessage` ([#972](https://github.com/streetsidesoftware/cspell/issues/972)) ([492dca9](https://github.com/streetsidesoftware/cspell/commit/492dca91466773bdf247fdb87f93d64914d5e3e1))

# [5.3.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.2.4...v5.3.0-alpha.0) (2021-02-18)

### Features

- Be able to specify files to spell check within the config. ([#948](https://github.com/streetsidesoftware/cspell/issues/948)) ([23f7a48](https://github.com/streetsidesoftware/cspell/commit/23f7a488ef500fb1df5cd234c7d3c2ab4ec02961)), closes [#571](https://github.com/streetsidesoftware/cspell/issues/571)
- Glob patterns are relative to the config file. ([#921](https://github.com/streetsidesoftware/cspell/issues/921)) ([a250448](https://github.com/streetsidesoftware/cspell/commit/a2504484ec38f15804cc0a203317266f83566b7c))
- Support local configuration files ([#966](https://github.com/streetsidesoftware/cspell/issues/966)) ([0ccc5fe](https://github.com/streetsidesoftware/cspell/commit/0ccc5fe9eb70ca3a4c6e5a3fc0b653465e76983c))

## [5.2.4](https://github.com/streetsidesoftware/cspell/compare/v5.2.3...v5.2.4) (2021-01-28)

**Note:** Version bump only for package cspell

## [5.2.3](https://github.com/streetsidesoftware/cspell/compare/v5.2.2...v5.2.3) (2021-01-27)

**Note:** Version bump only for package cspell

## [5.2.2](https://github.com/streetsidesoftware/cspell/compare/v5.2.1...v5.2.2) (2021-01-26)

**Note:** Version bump only for package cspell

## [5.2.1](https://github.com/streetsidesoftware/cspell/compare/v5.2.0...v5.2.1) (2021-01-23)

### Bug Fixes

- make sure version and help do not exit with non-zero code. ([#883](https://github.com/streetsidesoftware/cspell/issues/883)) ([b8e91f3](https://github.com/streetsidesoftware/cspell/commit/b8e91f35e2cdebc14dda9b73de1dd31183f5d91d)), closes [#880](https://github.com/streetsidesoftware/cspell/issues/880)

# [5.2.0](https://github.com/streetsidesoftware/cspell/compare/v5.1.3...v5.2.0) (2021-01-23)

### Features

- Add options --show-context and --relative ([#878](https://github.com/streetsidesoftware/cspell/issues/878)) ([1fddaac](https://github.com/streetsidesoftware/cspell/commit/1fddaac4d80f8a28e12677e0953e8443116c24c2))
- support .yaml and .js configuration files ([#875](https://github.com/streetsidesoftware/cspell/issues/875)) ([4a07acc](https://github.com/streetsidesoftware/cspell/commit/4a07acc507f3106e1f09805b8ee019ea200ae08f))
- support displaying suggestions ([#881](https://github.com/streetsidesoftware/cspell/issues/881)) ([e3f207f](https://github.com/streetsidesoftware/cspell/commit/e3f207f802231cc7915015d2c2924e08745e4f8e))

## [5.1.3](https://github.com/streetsidesoftware/cspell/compare/v5.1.2...v5.1.3) (2021-01-05)

**Note:** Version bump only for package cspell

## [5.1.2](https://github.com/streetsidesoftware/cspell/compare/v5.1.1...v5.1.2) (2020-12-31)

**Note:** Version bump only for package cspell

## [5.1.1](https://github.com/streetsidesoftware/cspell/compare/v5.1.0...v5.1.1) (2020-12-28)

### Bug Fixes

- remove dependency upon `@types/glob` ([#810](https://github.com/streetsidesoftware/cspell/issues/810)) ([03fab52](https://github.com/streetsidesoftware/cspell/commit/03fab5288d971ced4c49da6765194653d8f73f96))

# [5.1.0](https://github.com/streetsidesoftware/cspell/compare/v5.0.8...v5.1.0) (2020-12-27)

### Features

- improve spell checking speed and allow multiple exclude arguments ([#806](https://github.com/streetsidesoftware/cspell/issues/806)) ([7a4c8f8](https://github.com/streetsidesoftware/cspell/commit/7a4c8f8d968aba520122ad94feb21096e8190898))

## [5.0.8](https://github.com/streetsidesoftware/cspell/compare/v5.0.7...v5.0.8) (2020-12-17)

### Bug Fixes

- Docs and minor edits ([#757](https://github.com/streetsidesoftware/cspell/issues/757)) ([e5f4567](https://github.com/streetsidesoftware/cspell/commit/e5f4567f25a90ee52105e50c99c7ad90cfb9fdb0))
- issue with importing cspell ([ff32d0c](https://github.com/streetsidesoftware/cspell/commit/ff32d0cab987026e13d131961667e10b6cd83831))

## [5.0.7](https://github.com/streetsidesoftware/cspell/compare/v5.0.6...v5.0.7) (2020-12-16)

**Note:** Version bump only for package cspell

## [5.0.6](https://github.com/streetsidesoftware/cspell/compare/v5.0.5...v5.0.6) (2020-12-15)

**Note:** Version bump only for package cspell

## [5.0.5](https://github.com/streetsidesoftware/cspell/compare/v5.0.4...v5.0.5) (2020-12-15)

**Note:** Version bump only for package cspell

## [5.0.4](https://github.com/streetsidesoftware/cspell/compare/v5.0.3...v5.0.4) (2020-12-15)

**Note:** Version bump only for package cspell

## [5.0.3](https://github.com/streetsidesoftware/cspell/compare/v5.0.2...v5.0.3) (2020-12-04)

### Bug Fixes

- Expose Emitter types ([#718](https://github.com/streetsidesoftware/cspell/issues/718)) ([3ef9030](https://github.com/streetsidesoftware/cspell/commit/3ef903097de0819025ba74eb9bf978eb1f57fc12))

## [5.0.2](https://github.com/streetsidesoftware/cspell/compare/v5.0.2-alpha.1...v5.0.2) (2020-11-26)

**Note:** Version bump only for package cspell

## [5.0.1](https://github.com/streetsidesoftware/cspell/compare/v5.0.1-alpha.15...v5.0.1) (2020-11-20)

### Bug Fixes

- make sure the error code is correctly set ([#619](https://github.com/streetsidesoftware/cspell/issues/619)) ([09e358c](https://github.com/streetsidesoftware/cspell/commit/09e358c3b7d3c485df92d7d9c5a652cf6a85f635))

## [5.0.1-alpha.15](https://github.com/streetsidesoftware/cspell/compare/v5.0.1-alpha.14...v5.0.1-alpha.15) (2020-11-18)

### Bug Fixes

- force new version ([3ab08ab](https://github.com/streetsidesoftware/cspell/commit/3ab08ab5ae1939d934b2f0fb23d33defc60c1a7f))

## 5.0.1-alpha.14 (2020-11-17)

**Note:** Version bump only for package cspell

## [5.0.1-alpha.0](https://github.com/streetsidesoftware/cspell/compare/cspell@4.0.44...cspell@5.0.1-alpha.0) (2020-02-20)

**Note:** Version bump only for package cspell

# Release Notes

## [4.0.16]

- Speed improvements to address slowdown to support case sensitivity.

## [4.0.14]

- Add basic case sensitivity support.

## [4.0.0]

- **Breaking Change** drop support for Node 8 and 9.

## [3.2.14]

- Updated `package.json` references to point to the new monorepo
- [Resolve paths beginning with tilde as \$HOME by `tribut` · Pull Request #83](https://github.com/streetsidesoftware/cspell/pull/83)
- Fixed: [English words between Japanese characters are not correctly checked. · Issue #89](https://github.com/streetsidesoftware/cspell/issues/89)

## [3.2.10]

- Move to a monorepo

## [3.2.9]

- Update dictionaries

## [3.2.2]

- cspell-cli: Added option to not show the summary at the end.
- Updated dictionaries

## [3.2.1]

- Updated dictionaries
- Updated packages
- Added a dictionary for fullstack development defaults on for `php` and `javascript`
- Moved the companies dictionary to [cspell-dicts/packages/companies](https://github.com/streetsidesoftware/cspell-dicts/tree/main/packages/companies)
- Updated Tooling

## [3.1.4]

- Support `~/` references for dictionary files.

## [3.1.3]

- Add `Elixir` dictionary to cspell.

## [3.1.2]

- Add `lorem-ipsum` dictionary to cspell.

## [3.1.1]

- Fix [Can't set language via config file #49](https://github.com/streetsidesoftware/cspell/issues/49)

## [3.1.0]

- Change the default output for issues to address: [linter output format is not standardized #35](https://github.com/streetsidesoftware/cspell/issues/35).
  The old output can be achieved with the `--legacy` flag.
- Added `--languageId` options to force the programming language. This is useful if the extension is unknown.
- `check` command now supports overrides in the `cspell.json` file.
- `check` command now supports `local` option.

## [3.0.3]

- Add Scala and Java dictionaries.

## [3.0.2]

- Do not crash if configstore is not available. [Server crashes on Ubuntu #207](https://github.com/streetsidesoftware/vscode-spell-checker/issues/207)

## [3.0.1]

- Move to RxJs 6

## [3.0.0]

- Fix code coverage generation issues with respect to Node 10 builds.
- Pull in English spelling fixes.

## [2.x] to [3.x] Breaking changes

- Move to RxJs version 6

## [2.1.10]

- Fix an issue with matching too much text for a url:
  [Misspelled first word after HTML element with absolute URL is not detected #201](https://github.com/streetsidesoftware/vscode-spell-checker/issues/201)
- [Better LaTeX support](https://github.com/streetsidesoftware/vscode-spell-checker/issues/167#issuecomment-373682530)
- Ignore SHA-1, SHA-256, SHA-512 hashes by default
- Ignore HTML href urls by default.

## [2.1.9]

- Fix a common spelling mistake in the English Dictionary
- Make cSpell aware of AsciiDocs.

## [2.1.8]

- Update the English dictionary.

## [2.1.7]

- Add the ability to set the allowed URI schemas when filtering filenames.

## [2.1.6]

- Update Golang dictionary

## [2.1.5]

- Migrate LaTex to cspell-dicts

## [2.1.4]

- Fix an issue with the sub command where the options were not making it through. This prevented specifying the config file to use.
- Improve LaTeX support for text commands.
- Fix [String Regex too greedy](https://github.com/streetsidesoftware/vscode-spell-checker/issues/185)

## [2.1.3]

- Make sure title, section, etc. is spell checked: [LaTeX: No spell check for chapter/section titles #179](https://github.com/streetsidesoftware/vscode-spell-checker/issues/179)

## [2.1.2]

- Add dictionary for Rust
- Improved LaTex macro detection based upon [Bludkey's suggestion](https://github.com/streetsidesoftware/vscode-spell-checker/issues/172#issuecomment-366523937)
- Improved verbose output by displaying the language detected and dictionaries used.
- Updated `cpp` dictionary to address: [incorrect spelling of "successful"](https://github.com/streetsidesoftware/vscode-spell-checker/issues/176)

## [2.1.1]

- Add the ability to ignore the next line or the current line: `cspell:disable-line` and `cspell:disable-next-line`
  See [No spell-checker:disable-line](https://github.com/streetsidesoftware/cspell/issues/24)

## [2.1.0]

- Add `check` command to command line tool. This will check the text of a file and show any errors highlighted in red.
- improve `LaTex` support by excluding macros. (Regex by [James-Yu](https://github.com/James-Yu))

## [2.0.9]

- Correct the CSpellUserSettings interface for compatibility

## [2.0.8]

- Allow variable width output for trace based upon the terminal width.

## [2.0.6]

- Add `trace` command to the cli. This makes it easier to see if a word exists in one of the dictionaries

## [2.0.5]

- Use `configstore-fork` to enable cspell usage in a CI environment [#25](https://github.com/streetsidesoftware/cspell/issues/25)
- Experiment with improved suggestion speed.

## [2.0.4]

- Update Python dictionary

## [2.0.0]

- Better support for checking compound words.

## [1.10.5]

- Migrate PHP dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)
- Migrate C++ dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)

## 1.10.4

- Improved support for compound word suggestions.
- Sped up suggestions on large compound words by a factor of 10x.
  Large compound words suggestions are still slow: ~4000ms to generate 8 suggestions for a 27 character word.
  This time can be reduced to about 1 second by changing the number of suggestions to 1.

## 1.10.3

- Initial support for compound word suggestions.

## 1.10.0 - 1.10.2

- Add support for compound word suggestion.
- Add support for dictionaries that force compound words like Dutch and German
- Fix an issue with all caps words net getting good suggestions.

## 1.9.7

- Fix [#16](https://github.com/streetsidesoftware/cspell/issues/16) where words beginning with capitol letters were not getting good suggestions.

## 1.9.6

- Make sure all Settings interfaces are exposed.

## 1.9.4

- Migrate Go Lang dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)
- Migrate Python dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)
- Support Python Django Framework

## 1.9.3

- Add support for 'untitled' file scheme types.
- Add basic support for handlebars

## 1.9.2

- Add better support for .jsx and .tsx files.
- Ignore #include lines on .cpp and .c files.

## 1.9.0

- Add support to set the local / language within a file using in document settings.
- Add support for overrides based upon the filename.

## 1.8.1

- Add support for dictionary level replacement maps. This allows for things like ij -> ĳ because that is how it is stored in the dictionary.
- Fix issue [#10](https://github.com/streetsidesoftware/cspell/issues/10) - handle right quotes.
- Fix an issue where \' should be seen as ' when checking contractions.

## 1.7.3

- Be able to clear the cached settings files.
- Make sure the global config file is not created by default.

## 1.7.0

- Use `configstore` to store persistent config settings. That way it is possible for settings to be changed programmatically.
- The two English dictionaries have been moved into [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts) for easier maintenance.
- It is now possible to import other settings files from with in a cspell.json file using `"import": ["../path/to/other/cspell.json"]`

## 1.6.1

- Minor update of packages

## 1.6.0

- Updated package dependencies (removed deprecated packages)
- Fix issue #9 - add a fix for Python unicode and byte strings.
- Language level overrides now work
  - It is now possible to add language level exclude / include patterns.

## 1.5.0

- Fix issue #7 - where trailing characters on long words were ignored.

## 1.4.0

- Support the new cspell-trie file format. This is useful for very large dictionaries.

## 1.3.3

- Use latest version of cspell-tools.

## 1.3.2

- More terms Added
- Now builds on appveyor to make sure we run on Windows.
- Update packages

## 1.3.1

- Code coverage improvements
- Update the README

## 1.3.0

- Add color output
- Fixed the way excludes are handled
- Fixed and issue with the cspell.json loading
- updated rxjs to 5.1.0

## 1.2.1

- Fix an issue with Spelling Issue reporting.
- Make sure ignorePaths are included in the exclusions.

## 1.1.0

- Load time speed improvement
- Code refactor along lines of responsibility.
- Added dictionary support for LaTex
- Added option to only output the words not found in the dictionaries
- Added option to only output the first instance of a word not found in the dictionaries
- Improve typescript dictionary by basing it upon the typescript/lib/lib.\*.d.ts
- Add code coverage

## 1.0.0 - 1.0.8

- These were the initial release used for the vscode spell checker.

<!-- cspell:ignore appveyor Bludkey's tribut -->
