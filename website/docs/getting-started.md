---
title: 'Getting Started with CSpell'
categories: docs
# parent: Docs
sidebar_position: 1
sidebar_label: Getting Started
---

# Spell Checking

## Installation

See: [Installation](./installation.md)

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

# Adding CSpell to an existing project

In the steps below we will create a cspell configuration file and setup a single custom dictionary for the project.

Steps:

1. [Create a configuration file](#1-create-a-configuration-file)
1. [Add words to the project dictionary](#2-add-words-to-the-project-dictionary)

## 1. Create a configuration file.

CSpell can use JSON, Yaml, and JavaScript files for configuration. It automatically searches for one of the following: `cspell.json`, `cspell.config.yaml`, `cspell.config.cjs`.

For now choose to use either JSON or Yaml. Below are examples of each that include a custom dictionary definition. Both of them are equivalent. If you have both, CSpell will look for the `.json` file first.

**`cspell.json`**

```json
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
  "version": "0.2",
  "dictionaryDefinitions": [
    {
      "name": "project-words",
      "path": "./project-words.txt",
      "addWords": true
    }
  ],
  "dictionaries": ["project-words"],
  "ignorePaths": ["node_modules", "/project-words.txt"]
}
```

**`cspell.config.yaml`**

```yaml
---
$schema: https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json
version: '0.2'
dictionaryDefinitions:
  - name: project-words
    path: './project-words.txt'
    addWords: true
dictionaries:
  - project-words
ignorePaths:
  - 'node_modules'
  - '/project-words.txt'
```

These configuration files do three things:

1. Define the custom dictionary `project-words`.
1. Tell the spell checker to use the custom dictionary.
1. Tell the spell checker to ignore any files inside of `node_modules` and the file `project-words.txt`.

## 2. Add words to the project dictionary

It might take a few iterations to get fully setup, but the process in the same.

Steps:

1. Create the dictionary file

   ```sh
   touch project-words.txt
   ```

1. Choose a set of files to start with, like all Markdown files, `**/*.md` and run the spell checker.

   ```sh
   cspell "**/*.md"
   ```

1. Look for any directories that need to be ignored and add them to `ignorePaths`. Example:

   - `"bin"` - to ignore any directory / file called `bin`.
   - `"translations/**"` - to ignore all files under the `translations` directory.
   - `"packages/*/dist"` - to ignore the `dist` directory in each _package_.

   Once you have finished identifying directories and files to be ignored, it is now time to add words to the custom dictionary.

1. Have CSpell populate it with the words from your project.

   ```sh
   echo "# New Words" >> project-words.txt
   cspell --words-only --unique "**/*.md" | sort --ignore-case >> project-words.txt
   ```

   This will append all new issues to the end of `project-words.txt`

1. Review the words in `project-words.txt` to check for any actual misspellings and remove them (the spell checker already thinks they are wrong).

1. Fix spelling issues.

   To show the issues and suggestions, use:

   ```sh
   cspell --no-progress --show-suggestions --show-context "**/*.md"
   ```

1. Repeat the process with the other file types you want to check.

## 3. Fine-tuning

The following resources can help you with fine-tuning your configurations:

- [Making words forbidden](./forbidden-words.md)
- [Defining Custom Dictionaries](./dictionaries-custom.md)
- [About Dictionaries](./dictionaries.md)
- [Understanding CSpell Globs](./globs.md)

# Help

## Command: `lint` -- Spell Checking

The `lint` command is used for spell checking files.

### Help

```sh
cspell lint --help
```

### Options

<!-- {% include  generated-docs/help-lint.md %} -->
