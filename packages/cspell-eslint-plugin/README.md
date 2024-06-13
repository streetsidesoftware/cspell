# CSpell ESLint Plugin

A spell checker plugin for ESLint based upon CSpell.

## Feedback Welcome

This plugin is still in active development as part of the CSpell suite of tools and applications.

## Quick Setup

- Install `@cspell/eslint-plugin` as a dev-dependency

  ```sh
  npm install --save-dev @cspell/eslint-plugin
  ```

- Add the plugin to the ESLint configuration (see below:)
  - [Configuration (new: `eslint.config.js`)](#configuration-new-eslintconfigjs)
  - [Configuration (Legacy: `.eslintrc`)](#configuration-legacy-eslintrc)

### Configuration (new: `eslint.config.js`)

**`eslint.config.js` using recommended.**

```js
import cspellESLintPluginRecommended from '@cspell/eslint-plugin/recommended';

export default [
  // other config imports
  cspellESLintPluginRecommended
  // other configs
];
```

**Or**

**`eslint.config.js` using configs.**

```js
import cspellConfigs from '@cspell/eslint-plugin/configs';

export default [
  // other config imports
  cspellConfigs.recommended
  // other configs
];
```

**Or**

**`eslint.config.js` using `plugins`**

```js
import cspellPlugin from '@cspell/eslint-plugin';

export default [
  // other config imports
  {
    plugins: { '@cspell': cspellPlugin },
    rules: {
      '@cspell/spellchecker': ['warn', {}]
    }
  }
  // other configs
];
```

### Configuration (Legacy: `.eslintrc`)

Add `"plugin:@cspell/recommended"` to the `extends` section of the configuration.

**`.eslintrc`**

```json
{
  "extends": ["plugin:@cspell/recommended"]
}
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
   * Path to the cspell configuration file.
   * Relative paths, will be relative to the current working directory.
   * @since 8.8.0
   */
  configFile?: string;
  /**
   * Some CSpell Settings
   */
  cspell?: {
    /**
     * The language locale to use, i.e. `en-US,en-GB` to enable both
     * American and British English.
     */
    language?: string;
    /** List of words to be considered correct. */
    words?: string[];
    /**
     * List of words to be ignored.
     * An ignored word will not show up as an error, even if it is also
     * in the `flagWords`.
     */
    ignoreWords?: string[];
    /**
     * List of words to always be considered incorrect.
     * Words found in `flagWords` override `words`.
     * Format of `flagWords`
     * - single word entry - `word`
     * - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
     */
    flagWords?: string[];
    /**
     * List of regular expression patterns or pattern names to exclude
     * from spell checking.
     */
    ignoreRegExpList?: string[];
    /**
     * List of regular expression patterns or defined pattern names to
     * match for spell checking.
     * If this property is defined, only text matching the included
     * patterns will be checked.
     */
    includeRegExpList?: string[];
    /** Allows words to be glued together. */
    allowCompoundWords?: boolean;
    /** Import cspell config file. */
    import?: string[];
    /** List of dictionaries to enable */
    dictionaries?: string[];
    /** Define dictionaries. */
    dictionaryDefinitions?: DictionaryDefinition[];
  };

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
   * Scope selectors to spell check.
   * This is a list of scope selectors to spell check.
   *
   * Example:
   * ```js
   * checkScope: [
   *     ['YAMLPair[key] YAMLScalar', true],
   *     ['YAMLPair[value] YAMLScalar', true],
   *     ['YAMLSequence[entries] YAMLScalar', true],
   *     ['JSONProperty[key] JSONLiteral', true],
   *     ['JSONProperty[value] JSONLiteral', true],
   *     ['JSONArrayExpression JSONLiteral', true],
   * ],
   * ```
   *
   * To turn off checking JSON keys, use the following:
   *
   * ```js
   * checkScope: [
   *     ['JSONProperty[key] JSONLiteral', false],
   * ],
   * ```
   *
   * @since 8.9.0
   */
  checkScope?: ScopeSelectorList;

  /**
   * Output debug logs
   * @default false
   */
  debugMode?: boolean;
}
````

Examples:

**`eslint.config.js`**

```js
import cspellPlugin from '@cspell/eslint-plugin';

export default [
  {
    plugins: { '@cspell': cspellPlugin },
    rules: {
      '@cspell/spellchecker': ['warn', { checkComments: false, autoFix: true }]
    }
  }
];
```

**`eslint.config.js`**

```js
import cspellConfigs from '@cspell/eslint-plugin/configs';

export default [
  cspellConfigs.recommended,
  {
    rules: {
      '@cspell/spellchecker': ['warn', { checkComments: false, autoFix: true }]
    }
  }
];
```

**`.eslintrc.json`**

```json
{
  "plugins": ["@cspell"],
  "rules": {
    "@cspell/spellchecker": ["warn", { "checkComments": false, "autoFix": true }]
  }
}
```

## `configFile` - Using a CSpell Configuration File

**`eslint.config.mjs`**

```js
  rules: {
      '@cspell/spellchecker': [
          'error',
          {
              //
              configFile: new URL('./cspell.config.yaml', import.meta.url).toString(),
          },
      ],
  },
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
suggestWords:
  - colour->color
```

With this configuration, `blacklist` is flagged as forbidden and `allowlist` is the "preferred" suggestion. When `autoFix` is enabled, all instances of `blacklist` will be replaced with `allowlist`.

When spell checking, if `colour` is not in one of the dictionaries, then `color` will be offered as the preferred suggestion. `suggestWords` are used to provide preferred suggestions, but will not flag any words as incorrect.

CSpell will match case, but not word stems. `blacklist` and `Blacklist` will get replaced, but not `blacklists`.

## Checking Custom AST Nodes

The `checkScope` setting is used to enable / disable checking AST Nodes. Parsers are used to generate the AST (Abstract Syntax Tree) used by ESLint to evaluate a document. Each PlugIn gets access to the AST. `checkScope` can be used to handle new AST node when a custom parser is added.

```js
rules: {
  '@cspell/spellchecker': ['warn', { checkScope: [
    ['JSONLiteral': true],  // will match AST Nodes of type `JSONLiteral` and spell check the value.
    ['JSONProperty[key] JSONLiteral', false]  // will turn off checking the JSON Property keys.
    ['JSONProperty JSONLiteral', false]  // will turn off checking the JSON Property keys and values.
    ['JSONProperty[value] JSONLiteral', true]  // will turn on checking the JSON Property values.
    ['YAMLPair[key] YAMLScalar', true],
    ['YAMLPair[value] YAMLScalar', true],
    ['YAMLSequence YAMLScalar', true],
  ] }],
},
```

## In Combination with CSpell

Due to the nature of how files are parsed, the `cspell` command line tool and this ESLint plugin will give different results.
It is recommended that either ESLint or `cspell` checks a file, but not both. Use `ignorePaths` setting in `cspell.json` to
tell the `cspell` command line tool to ignore files checked by ESLint.

Differences:

- The CSpell parser is generic across all file types. It just breaks an entire document into words and tests them against the dictionaries. Everything is checked, comments, code, strings, etc.

- The CSpell ESLint plugin uses the [AST](https://dev.to/akshay9677/what-the-heck-is-an-abstract-syntax-tree-ast--3kk5) (a way to identify the meaning of the individual parts of your code) provided by ESLint to only check literal strings, identifiers, and comments. See [Options](#options) on selecting what to check.

Example spell checked with ESLint CSpell Plugin: <img width="749" alt="image" src="https://user-images.githubusercontent.com/3740137/216295162-38ddf6a0-3873-4e48-b3a5-65fd421dae94.png">

Example spell checked with just `cspell`: <img width="744" alt="image" src="https://user-images.githubusercontent.com/3740137/216295368-024c1065-2432-4d10-b204-7eb0589695e6.png">

## CSpell for Enterprise

<!--- @@inject: ../../static/tidelift.md --->

Available as part of the Tidelift Subscription.

The maintainers of cspell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

<!--- @@inject-end: ../../static/tidelift.md --->

<!--- @@inject: ../../static/footer.md --->

<br/>

---

<p align="center">Brought to you by<a href="https://streetsidesoftware.com" title="Street Side Software"><img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software</a></p>

<!--- @@inject-end: ../../static/footer.md --->

<!--- cspell:ignore colour --->
