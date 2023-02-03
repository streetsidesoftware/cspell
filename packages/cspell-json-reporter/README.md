# `@cspell/cspell-json-reporter`

> CSpell reporter with JSON output

## Installation

Install it as a development package in the repository that will use it.

```sh
npm install -SD @cspell/cspell-json-reporter
```

## Usage

Add this to `cspell.yaml`:

```yaml
reporters: [['@cspell/cspell-json-reporter', { outFile: 'out.json' }]]
```

or `cspell.json`

```json
{
  "reporters": [["@cspell/cspell-json-reporter", { "outFile": "out.json" }]]
}
```

## Output file format

`@cspell/cspell-json-reporter` emits a JSON file with the following fields:

- `issues` - found spelling issues
- `result` - CSpell linting results
- `error` - CSell error messages
- `progress` - file linting progress messages if `settings.progress` is enabled
- `info` - CSpell execution logs if `settings.verbose` is enabled
- `debug` - CSpell debug logs if `settings.debug` is enabled

<details>
<summary>JSON Output Definition</summary>

<!--- @@inject: src/CSpellJSONReporterOutput.ts --->

```ts
import type {
  ErrorLike,
  Issue,
  MessageType,
  ProgressFileComplete,
  ProgressItem,
  RunResult,
} from '@cspell/cspell-types';

export type CSpellJSONReporterOutput = {
  /**
   * Found spelling issues
   */
  issues: Array<Issue>;
  /**
   * CSpell execution logs
   */
  info?: Array<{ message: string; msgType: MessageType }>;
  /**
   * CSpell debug logs
   */
  debug?: Array<{ message: string }>;
  /**
   * CSpell error logs
   */
  error?: Array<{ message: string; error: ErrorLike }>;
  /**
   * CSpell file progress logs
   */
  progress?: Array<ProgressItem | ProgressFileComplete>;
  /**
   * Execution result
   */
  result: RunResult;
};
```

<!--- @@inject-end: src/CSpellJSONReporterOutput.ts --->

</details>

## Settings

Possible settings:

- `outFile` (required) - path for JSON file to emit
- `verbose` (default: false) - enable saving of execution logs
- `debug` (default: false) - enable saving of debug logs
- `progress` (default: false) - enable saving of file progress logs

<details>
<summary>Reporter Settings</summary>

<!--- @@inject: src/CSpellJSONReporterSettings.ts --->

```ts
/**
 * CSpell-json-reporter settings type definition
 */
export type CSpellJSONReporterSettings = {
  /**
   * Path to the output file.
   *
   * Relative paths are relative to the current working directory.
   *
   * Special values:
   * - `stdout` - write the JSON to `stdout`.
   * - `stderr` - write the JSON to `stderr`.
   *
   * @default stdout
   */
  outFile?: string;
  /**
   * Add more information about the files being checked and the configuration
   * @default false
   */
  verbose?: boolean;
  /**
   * Add information useful for debugging cspell.json files
   * @default false
   */
  debug?: boolean;
  /**
   * Add progress messages
   * @default false
   */
  progress?: boolean;
};
```

<!--- @@inject-end: src/CSpellJSONReporterSettings.ts --->

</details>
