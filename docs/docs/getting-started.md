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
Usage: cspell lint [options] [globs...]

Check spelling

Options:
  -c, --config <cspell.json>   Configuration file to use.  By default cspell
                               looks for cspell.json in the current directory.

  -v, --verbose                Display more information about the files being
                               checked and the configuration.

  --locale <locale>            Set language locales. i.e. "en,fr" for English
                               and French, or "en-GB" for British English.

  --language-id <language>     Force programming language for unknown
                               extensions. i.e. "php" or "scala"

  --words-only                 Only output the words not found in the
                               dictionaries.

  -u, --unique                 Only output the first instance of a word not
                               found in the dictionaries.

  -e, --exclude <glob>         Exclude files matching the glob pattern. This
                               option can be used multiple times to add
                               multiple globs.

  --file-list <path or stdin>  Specify a list of files to be spell checked. The
                               list is filtered against the glob file patterns.
                               Note: the format is 1 file path per line.

  --no-issues                  Do not show the spelling errors.
  --no-progress                Turn off progress messages
  --no-summary                 Turn off summary message in console.
  -s, --silent                 Silent mode, suppress error messages.
  -r, --root <root folder>     Root directory, defaults to current directory.
  --relative                   Issues are displayed relative to root.
  --show-context               Show the surrounding text around an issue.
  --show-suggestions           Show spelling suggestions.
  --no-must-find-files         Do not error if no files are found.

  --cache                      Only check changed files. (default: false)

  --cache-strategy <strategy>  Strategy to use for detecting changed files.
                               (choices: "metadata", "content")

  --cache-location <path>      Path to the cache file or directory. (default:
                               ".cspellcache")

  --dot                        Include files and directories starting with `.`
                               (period) when matching globs.

  --gitignore                  Ignore files matching glob patterns found in
                               .gitignore files.

  --no-gitignore               Do NOT use .gitignore files.
  --gitignore-root <path>      Prevent searching for .gitignore files past
                               root.

  --no-color                   Turn off color.
  --color                      Force color.
  --debug                      Output information useful for debugging
                               cspell.json files.
  -h, --help                   display help for command


Examples:
    cspell "*.js"                   Check all .js files in the current directory
    cspell "**/*.js"                Check all .js files from the current directory
    cspell "src/**/*.js"            Only check .js under src
    cspell "**/*.txt" "**/*.js"     Check both .js and .txt files.
    cspell "**/*.{txt,js,md}"       Check .txt, .js, and .md files.
    cat LICENSE | cspell stdin      Check stdin
```
