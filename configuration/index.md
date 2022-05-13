---
title: Configuration
nav_order: 4
description: 'Customizing CSpell'
has_children: true
---

# Configuration

_CSpell_'s behavior can be controlled through a config file.

By default it looks for any of the following files:

- `.cspell.json`
- `cspell.json`
- `.cSpell.json`
- `cSpell.json`
- `cspell.config.js`
- `cspell.config.cjs`
- `cspell.config.json`
- `cspell.config.yaml`
- `cspell.config.yml`
- `cspell.yaml`
- `cspell.yml`
- [`package.json`](#packagejson)

Or you can specify a path to a config file with the `--config <path>` argument on the command line.

## `cspell.json`

#### Example `cspell.json` file

<!--- cspell:ignore hte -->

```javascript
// cSpell Settings
{
    // Version of the setting file.  Always 0.2
    "version": "0.2",
    // language - current active spelling language
    "language": "en",
    // words - list of words to be always considered correct
    "words": [
        "mkdirp",
        "tsmerge",
        "githubusercontent",
        "streetsidesoftware",
        "vsmarketplacebadge",
        "visualstudio"
    ],
    // flagWords - list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors.
    // For example "hte" should be "the"
    "flagWords": [
        "hte"
    ]
}
```

### cspell.json sections

- `version` - currently always 0.2 - controls how the settings in the configuration file behave.
- `language` - this specifies the language locale to use in choosing the general dictionary.
  For example: `"language": "en-GB"` tells cspell to use British English instead of US English.
- `words` - a list of words to be considered correct.
- `flagWords` - a list of words to be always considered incorrect
- `ignoreWords` - a list of words to be ignored (even if they are in the flagWords).
- `ignorePaths` - a list of globs to specify which files are to be ignored.

  **Example**

  ```json
  "ignorePaths": ["node_modules/**"]
  ```

  will cause cspell to ignore anything in the `node_modules` directory.

- `maxNumberOfProblems` - defaults to **_100_** per file.
- `minWordLength` - defaults to **_4_** - the minimum length of a word before it is checked.
- `allowCompoundWords` - defaults to **_false_**; set to **true** to allow compound words by default.
- `dictionaries` - list of the names of the dictionaries to use. See [Dictionaries](#Dictionaries) below.
- `dictionaryDefinitions` - this list defines any custom dictionaries to use. This is how you can include other languages like Spanish.

  **Example**

  ```javascript
  "language": "en",
  // Dictionaries "spanish", "ruby", and "corp-term" will always be checked.
  // Including "spanish" in the list of dictionaries means both Spanish and English
  // words will be considered correct.
  "dictionaries": ["spanish", "ruby", "corp-terms", "fonts"],
  // Define each dictionary.  Relative paths are relative to the config file.
  "dictionaryDefinitions": [
      { "name": "spanish", "path": "./spanish-words.txt"},
      { "name": "ruby", "path": "./ruby.txt"},
      { "name": "company-terms", "path": "./corp-terms.txt"}
  ],
  ```

- `ignoreRegExpList` - list of patterns to be ignored
- `includeRegExpList` - _(Advanced)_ limits the text checked to be only that matching the expressions in the list.
- `patterns` - this allows you to define named patterns to be used with
  `ignoreRegExpList` and `includeRegExpList`.

  **Example**

  ```javascript
  "patterns": [
      {
          "name": "comment-single-line",
          "pattern": "/#.*/g"
      },
      {
          "name": "comment-multi-line",
          "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
      },
      // You can also combine multiple named patterns into one single named pattern
      {
          "name": "comments",
          "pattern": ["comment-single-line", "comment-multi-line"]
      }
  ],

  "ignoreRegExpList": ["comments"]
  ```

- `languageSettings` - this allow for per programming language configuration settings. See [LanguageSettings](./language-settings.md#LanguageSettings)

## `package.json`

It is possible to store CSpell configuration in the `package.json` file of a project. CSpell looks
for the configuration in the `cspell` field of the `.json` file.

```js
{
  "name": "cspell-docs",
  "description": "Documentation for CSpell",
  // ...
  "cspell": {
    "version": "0.2",
    "useGitignore": true
  }
}
```

<!---
cspell:ignore packagejson
--->
