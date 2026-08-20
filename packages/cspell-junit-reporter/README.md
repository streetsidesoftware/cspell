# `@cspell/cspell-junit-reporter`

> CSpell reporter with JUnit XML output

Emits a [JUnit](https://github.com/testmoapp/junitxml) compatible XML report of a cspell run, suitable for
consumption by CI systems (GitHub Actions, GitLab, Jenkins, CircleCI, etc.) that understand the JUnit test
result format.

## Installation

Install it as a development package in the repository that will use it.

```sh
npm install -SD @cspell/cspell-junit-reporter
```

## Usage

### Using Command Line

```sh
cspell . --reporter @cspell/cspell-junit-reporter
```

### Using CSpell Configuration

Add this to `cspell.yaml`:

```yaml
reporters: [['@cspell/cspell-junit-reporter', { outFile: 'cspell-junit.xml' }]]
```

or `cspell.json`

```json
{
  "reporters": [["@cspell/cspell-junit-reporter", { "outFile": "cspell-junit.xml" }]]
}
```

## Output format

`@cspell/cspell-junit-reporter` maps a cspell run onto JUnit XML as follows:

- one `<testsuites>` root element for the whole run
- one `<testsuite>` per file checked, named after the file
- one `<testcase>` per spelling issue found in a file, containing a `<failure>` with the misspelled word,
  location, and message
- a file with no issues gets a single passing `<testcase>` so the suite is never empty
- a skipped file gets a single `<testcase>` containing a `<skipped>` element
- processing errors that are not tied to a specific spelling issue (for example, a bad config file) are
  reported in a dedicated `cspell-errors` testsuite using `<error>` instead of `<failure>`

All file paths, words, and messages are escaped so the output is valid XML even when they contain
`& < > " '` characters.

Example output for a single file with one issue:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="cspell" tests="1" failures="1" errors="0" time="0.001">
  <testsuite name="src/example.ts" tests="1" failures="1" errors="0" time="0.001">
    <testcase name="teh (3:5)" classname="src/example.ts">
      <failure type="spelling" message="Unknown word: &quot;teh&quot;">Unknown word: "teh"</failure>
    </testcase>
  </testsuite>
</testsuites>
```

## Settings

Possible settings:

- `outFile` (default: stdout) - path for the XML file to emit
- `suiteName` (default: `cspell`) - name used for the root `<testsuites>` element

<details>
<summary>Reporter Settings</summary>

<!--- @@inject: src/CSpellJUnitReporterSettings.ts --->

```ts
/**
 * cspell-junit-reporter settings type definition
 */
export type CSpellJUnitReporterSettings = {
  /**
   * Path to the output JUnit XML file.
   *
   * Relative paths are relative to the current working directory.
   *
   * Special values:
   * - `stdout` - write the XML to `stdout`.
   * - `stderr` - write the XML to `stderr`.
   *
   * @default stdout
   */
  outFile?: string;
  /**
   * Name to use for the root `<testsuites>` element.
   *
   * @default cspell
   */
  suiteName?: string;
};
```

<!--- @@inject-end: src/CSpellJUnitReporterSettings.ts --->

</details>
