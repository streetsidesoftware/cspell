---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
title: CSpell
nav_order: 1
description: 'CSpell - A spell checker for code!'
permalink: /
---

# Welcome to CSpell

A Spell Checker for Code!

`cspell` is a command line tool and library for spell checking code.

## Support Future Development

[![](https://github.com/streetsidesoftware/cspell/raw/main/resources/100px-Green_Patreon_Donate_Shield_Badge.png)](https://www.patreon.com/streetsidesoftware)

## Features

- Spell Checks Code -- Able to spell check code by parsing it into words before checking against the dictionaries.
- Supports CamelCase, snake_case, and compoundwords naming styles.
- Self contained -- does not depend upon OS libraries like Hunspell or aspell. Nor does it depend upon online services.
- Fast -- checks 1000's of lines of code in seconds.
- Programming Language Specific Dictionaries -- Has dedicated support for:
  - JavaScript, TypeScript, Python, PHP, C#, C++, LaTex, Go, HTML, CSS, etc.
- Customizable -- supports custom dictionaries and word lists.
- Continuous Integration Support -- Can easily be added as a linter to Travis-CI.

CSpell was initially built as the spell checking service for the [spell checker extension](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) for
[Visual Studio Code](https://code.visualstudio.com/).

## CSpell for Enterprise

Available as part of the Tidelift Subscription.

The maintainers of CSpell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Installation

```sh
npm install -g cspell
```

## Basic Usage

Example: recursively spell check all JavaScript files in `src`

**JavaScript files**

```sh
cspell "src/**/*.js"
# or
cspell lint "src/**/*.js"
```

**Check everything**

```sh
cspell "**"
```

## Command: `lint` -- Spell Checking

The `lint` command is used for spell checking files.

### Help

```sh
cspell lint --help
```

### Options

```text
Usage: cspell lint [options] [files...]

Check spelling

Options:
  -c, --config <cspell.json>  Configuration file to use.  By default cspell
                              looks for cspell.json in the current directory.

  -v, --verbose               display more information about the files being
                              checked and the configuration

  --locale <locale>           Set language locales. i.e. "en,fr" for English
                              and French, or "en-GB" for British English.

  --language-id <language>    Force programming language for unknown
                              extensions. i.e. "php" or "scala"

  --wordsOnly                 Only output the words not found in the
                              dictionaries.

  -u, --unique                Only output the first instance of a word not
                              found in the dictionaries.

  --debug                     Output information useful for debugging
                              cspell.json files.

  -e, --exclude <glob>        Exclude files matching the glob pattern. This
                              option can be used multiple times to add multiple
                              globs.

  --no-issues                 Do not show the spelling errors.
  --no-progress               Turn off progress messages
  --no-summary                Turn off summary message in console
  -s, --silent                Silent mode, suppress error messages
  -r, --root <root folder>    Root directory, defaults to current directory.
  --relative                  Issues are displayed relative to root.
  --show-context              Show the surrounding text around an issue.
  --show-suggestions          Show spelling suggestions.
  --must-find-files           Error if no files are found (default: true)
  --no-must-find-files        Do not error is no files are found
  --no-color                  Turn off color.
  --color                     Force color
  -h, --help                  display help for command


Examples:
    cspell "*.js"                   Check all .js files in the current directory
    cspell "**/*.js"                Check all .js files from the current directory
    cspell "src/**/*.js"            Only check .js under src
    cspell "**/*.txt" "**/*.js"     Check both .js and .txt files.
    cspell "**/*.{txt,js,md}"       Check .txt, .js, and .md files.
    cat LICENSE | cspell stdin      Check stdin
```

## Requirements

cspell needs Node 12 and above.

## How it works

The concept is simple, split camelCase and snake_case words before checking them against a list of known words.

- `camelCase` -> `camel case`
- `HTMLInput` -> `html input`
- `srcCode` -> `src code`
- `snake_case_words` -> `snake case words`
- `camel2snake` -> `camel snake` -- (the 2 is ignored)
- `function parseJson(text: string)` -> `function parse json text string`

### Special cases

- Escape characters like `\n`, `\t` are removed if the word does not match:
  - `\narrow` -> `narrow` - because `narrow` is a word
  - `\ncode` -> `code` - because `ncode` is not a word.
  - `\network` -> `network` - but it might be hiding a spelling error, if `\n` was an escape character.

### Things to note

- This spellchecker is case insensitive. It will not catch errors like `english` which should be `English`.
- The spellchecker uses dictionaries stored locally. It does not send anything outside your machine.
- The words in the dictionaries can and do contain errors.
- There are missing words.
- Only words longer than 3 characters are checked. "jsj" is ok, while "jsja" is not.
- All symbols and punctuation are ignored.

### Dictionaries

The _dictionaries_ list allows you to specify dictionaries to use for the file.

```javascript
// cSpell:dictionaries lorem-ipsum
const companyName = 'Lorem ipsum dolor sit amet';
```

**Note:** dictionaries specified with `dictionaries` will be used for the entire file.

## Predefined RegExp expressions

### Exclude patterns

- `Urls`<sup>1</sup> -- Matches urls
- `HexValues` -- Matches common hex format like #aaa, 0xfeef, \\u0134
- `Base64`<sup>1</sup> -- matches base64 blocks of text longer than 40 characters.
- `Email` -- matches most email addresses.

### Include Patterns

- `Everything`<sup>1</sup> -- By default we match an entire document and remove the excludes.
- `string` -- This matches common string formats like '...', "...", and \`...\`
- `CStyleComment` -- These are C Style comments /\* \*/ and //
- `PhpHereDoc` -- This matches PHPHereDoc strings.

<sup>1.</sup> These patterns are part of the default include/exclude list for every file.

## Dictionaries

The spell checker includes a set of default dictionaries.

### General Dictionaries

- **en_US** - Derived from Hunspell US English words.
- **en-gb** - Derived from Hunspell GB English words.
- **companies** - List of well known companies
- **softwareTerms** - Software Terms and concepts like "coroutine", "debounce", "tree", etc.
- **misc** - Terms that do not belong in the other dictionaries.

### Programming Language Dictionaries

- **typescript** - keywords for TypeScript and JavaScript
- **node** - terms related to using nodejs.
- **php** - _php_ keywords and library methods
- **go** - _go_ keywords and library methods
- **python** - _python_ keywords
- **powershell** - _powershell_ keywords
- **html** - _html_ related keywords
- **css** - _css_, _less_, and _scss_ related keywords
- **cpp** - _C++_ related keywords
- **csharp** - _C#_ related keywords
- **latex** - LaTex related words
- **bash** - Bash/shell script keywords

### Miscellaneous Dictionaries

- **fonts** - long list of fonts - to assist with _css_
- **filetypes** - list of file typescript
- **npm** - list of top 500+ package names on npm.

### Dictionary Definition

- **name** - The reference name of the dictionary, used with program language settings
- **description** - Optional description
- **path** - Path to the file, can be relative or absolute. Relative path is relative to the
  current `cspell.json` file.
- **repMap** - Optional replacement map use to replace character prior to searching the dictionary.
  Example:
  ```javascript
      // Replace various tick marks with a single '
      "repMap": [["'|`|’", "'"]]
  ```
  // Use Compounds
- **useCompounds** - allow compound words

```javascript
// Define each dictionary.  Relative paths are relative to the config file.
"dictionaryDefinitions": [
    { "name": "spanish", "path": "./spanish-words.txt"},
    { "name": "ruby", "path": "./ruby.txt"},
    { "name": "company-terms", "path": "./corp-terms.txt"}
],
```

### Disabling a Dictionary

It is possible to prevent a dictionary from being loaded. This is useful if you want to use your own dictionary or just
turn off an existing dictionary.

#### Disable Default cpp Dictionary

```javascript
"dictionaries": ["!cpp"],
"overrides": [
  {
      "filename": "legacy/**/*.cpp",
      "dictionaries": ["!!cpp"], // add it back for *.cpp files under the legacy folder
  },
]
```

The number of `!`s is important.

- `!cpp` remove `cpp` dictionary
- `!!cpp` add it back
- `!!!cpp` remove it again.

## LanguageSettings

The Language Settings allow configuration to be based upon the programming language and/or the e.
There are two selector fields `locale` and `languageId`.

- `languageId` defines which programming languages to match against.
  A value of `"python,javascript"` will match against _python_ and _javascript_ files. To match against ALL programming languages,
  use `"*"`.
- `locale` defines which spoken languages to match against. A value of `"en-GB,nl"` will match against British English or Dutch.
  A value of `"*"` will match all spoken languages.
- Most configuration values allowed in a `cspell.json` file can be define or redefine within the `languageSettings`.

```javascript
    "languageSettings": [
        {
            // VSCode languageId. i.e. typescript, java, go, cpp, javascript, markdown, latex
            // * will match against any file type.
            "languageId": "c,cpp",
            // Language locale. i.e. en-US, de-AT, or ru. * will match all locales.
            // Multiple locales can be specified like: "en, en-US" to match both English and English US.
            "locale": "*",
            // To exclude patterns, add them to "ignoreRegExpList"
            "ignoreRegExpList": [
                "/#include.*/"
            ],
            // List of dictionaries to enable by name in `dictionaryDefinitions`
            "dictionaries": ["cpp"],
            // Dictionary definitions can also be supplied here. They are only used iff "languageId" and "locale" match.
            "dictionaryDefinitions": []
        }
    ]
```

## Overrides

Overrides are useful for forcing configuration on a per file basis.

Example:

```javascript
    "overrides": [
        // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
        {
            "filename": "**/{*.hrr,*.crr}",
            "languageId": "cpp"
        },
        // Force `*.txt` to use the Dutch dictionary (Dutch dictionary needs to be installed separately):
        {
            "language": "nl",
            "filename": "**/dutch/**/*.txt"
        }
    ]
```

<!---
    These are at the bottom because the VSCode Marketplace leaves a bit space at the top

    cSpell:disableCompoundWords
    cSpell:ignore  compoundwords stringlength errornumber
    cSpell:ignore jsja goededag alek wheerd behaviour tsmerge QQQQQ ncode
    cSpell:includeRegExp Everything
    cSpell:ignore hte variabele alinea
    cSpell:ignore mkdirp githubusercontent streetsidesoftware vsmarketplacebadge visualstudio
    cSpell:words Verdana
    cSpell:ignore ieeees beees treeees
    cSpell:ignore amet
-->

<!---
You can use the [editor on GitHub](https://github.com/streetsidesoftware/cspell/edit/main/docs/index.md) to maintain and preview the content for your website in Markdown files.
--->
