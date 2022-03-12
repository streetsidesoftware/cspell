# [WIP] CSpell ESLint Plugin

A spell checker plugin for ESLint based upon CSpell.

## [WIP] - Work In Progress

This plugin is still in active development. Due to the nature of how files are parsed, the `cspell` command line tool and this ESLint plugin will give different results. It is recommended that ESLint or `cspell` checks a file, but not both. Use `ignorePaths` setting in `cspell.json` to tell the `cspell` command line tool to ignore files checked by ESLint.

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

```ts
interface Options {
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
   * Output debug logs
   * @default false
   */
  debugMode?: boolean;
  /**
   * Ignore import and require names
   * @default true
   */
  ignoreImports?: boolean;
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
   * Spell check comments
   * @default true
   */
  checkComments?: boolean;
}
```

Example:

```json
{
  "plugins": ["@cspell"],
  "rules": {
    "@cspell/spellchecker": ["warn", { "checkComments": false }]
  }
}
```
