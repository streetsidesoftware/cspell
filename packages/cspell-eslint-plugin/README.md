# CSpell ESLint Plugin

A spell checker plugin for ESLint based upon CSpell.

## Feedback Welcome

This plugin is still in active development as part of the CSpell suite of tools and applications.

## Quick Setup

- Install `@cspell/eslint-plugin` as a dev-dependency

  ```sh
  npm install --save-dev @cspell/eslint-plugin
  ```

- Add to it to `.eslintrc.json`
  ```json
  "extends": ["plugin:@cspell/recommended"]
  ```

## Options

````ts
interface Options {
  /**
   * Automatically fix common mistakes.
   * This is only possible if a single preferred suggestion is available.
   * @default false
   */
  autoFix: boolean;
  /**
   * Number of spelling suggestions to make.
   * @default 8
   */
  numSuggestions: number;
  /**
   * Generate suggestions
   * @default true
   */
  generateSuggestions: boolean;
  /**
   * Ignore import and require names
   * @default true
   */
  ignoreImports?: boolean;
  /**
   * Ignore the properties of imported variables, structures, and types.
   *
   * Example:
   * ```
   * import { example } from 'third-party';
   *
   * const msg = example.property; // `property` is not spell checked.
   * ```
   *
   * @default true
   */
  ignoreImportProperties?: boolean;
  /**
   * Spell check identifiers (variables names, function names, and class names)
   * @default true
   */
  checkIdentifiers?: boolean;
  /**
   * Spell check strings
   * @default true
   */
  checkStrings?: boolean;
  /**
   * Spell check template strings
   * @default true
   */
  checkStringTemplates?: boolean;
  /**
   * Spell check JSX Text
   * @default true
   */
  checkJSXText?: boolean;
  /**
   * Spell check comments
   * @default true
   */
  checkComments?: boolean;
  /**
   * Specify a path to a custom word list file.
   *
   * example:
   * ```js
   * customWordListFile: "./myWords.txt"
   * ```
   */
  customWordListFile?: string | { path: string };
  /**
   * Output debug logs
   * @default false
   */
  debugMode?: boolean;
}
````

Example:

```json
{
  "plugins": ["@cspell"],
  "rules": {
    "@cspell/spellchecker": ["warn", { "checkComments": false, "autoFix": true }]
  }
}
```

## `autoFix`

When enabled, `autoFix` corrects any spelling issues that have a single "preferred" suggestion. It attempts to match
case and style, but it cannot guarantee correctness of code.

### Preferred Suggestions

CSpell offers the ability to flag words as incorrect and to provide suggestions.

**`cspell.config.yaml`**

```yaml
words:
  - allowlist
flagWords:
  - blacklist->allowlist
```

With this configuration, `blacklist` is flagged as forbidden and `allowlist` is the "preferred" suggestion. When `autoFix` is enabled, all instances of `blacklist` will be replaced with `allowlist`.

CSpell will match case, but not word stems. `blacklist` and `Blacklist` will get replaced, but not `blacklists`.

## In Combination with CSpell

Due to the nature of how files are parsed, the `cspell` command line tool and this ESLint plugin will give different results.
It is recommended that either ESLint or `cspell` checks a file, but not both. Use `ignorePaths` setting in `cspell.json` to
tell the `cspell` command line tool to ignore files checked by ESLint.

Differences:

- The CSpell parser is generic across all file types. It just breaks an entire document into words and tests them against the dictionaries. Everything is checked, comments, code, strings, etc.

- The CSpell ESLint plugin uses the [AST](https://dev.to/akshay9677/what-the-heck-is-an-abstract-syntax-tree-ast--3kk5) (a way to identify the meaning of the individual parts of your code) provided by ESLint to only check literal strings, identifiers, and comments. See [Options](#options) on selecting what to check.

Example spell checked with ESLint CSpell Plugin:
<img width="749" alt="image" src="https://user-images.githubusercontent.com/3740137/216295162-38ddf6a0-3873-4e48-b3a5-65fd421dae94.png">

Example spell checked with just `cspell`:
<img width="744" alt="image" src="https://user-images.githubusercontent.com/3740137/216295368-024c1065-2432-4d10-b204-7eb0589695e6.png">

## CSpell for Enterprise

<!--- @@inject: ../../static/tidelift.md --->

<!--- @@inject: ../../static/footer.md --->
