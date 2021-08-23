---
title: 'Getting Started with CSpell'
categories: docs
# parent: Docs
nav_order: 2
---

# Spell Checking

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
