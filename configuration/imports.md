---
layout: default
title: Importing / Extending Configuration
categories: configuration
parent: Configuration
nav_order: 11
---

<!--- Remove nav_exclude and published when the page is ready  --->

# Importing Configuration

By default the spell checker searches the current directory and up the hierarchy for the following files:

1. `package.json` - looking for a `cspell` field.
1. `.cspell.json`
1. `cspell.json`
1. `.cSpell.json`
1. `cSpell.json`
1. `cspell.config.js`
1. `cspell.config.cjs`
1. `cspell.config.json`
1. `cspell.config.yaml`
1. `cspell.config.yml`
1. `cspell.yaml`
1. `cspell.yml`

The first configuration file found will be loaded, the others will be ignored. To leverage multiple CSpell configuration files, the spell checker supports an `import` field. The `import` field is used to list files to be imported in order.

The spell checker "merges" configuration to build the settings used to check a document.

- `import` - Each configuration file can `import` more configuration files. The files listed in the import are merged from first to last with the parent (the one that did the import) merged at the end.

## Merging

`cspell.yml`

```yml
language: fr
import:
  - cspell-a.yml
  - cspell-b.yml
words:
  - root
```

`cspell-a.yml`

```yml
dictionaries:
  - aws # enable aws dictionary
  - '!html' # Disable `html` dictionary
words:
  - apple
```

`cspell-b.yml`

```yml
language: en
dictionaries:
  - '!softwareTerms' # Disable software-terms dictionary.
  - html # enable html
words:
  - banana
```

Merged Result:

```yml
language: fr
dictionaries:
  - aws
  - '!html'
  - '!softwareTerms'
  - html
words:
  - root
  - apple
  - banana
```

Dictionary order does not matter. The number of `!`s is more important. In this case the `html` and `softwareTerms` dictionaries will NOT be used, nor will the English dictionary due to the `language` being `fr`.

## Conditional Configuration

- `overrides` - Overrides are used to apply settings based upon the file / path name of the file being checked matching the globs defined in `filename`.
- `languageSettings` - Language settings are used to apply settings based upon matching the file type (`languageId`) or `locale`. A `languageId` or `locale` of `*` will match any file type or natural language respectively. `languageId` is a bit confusing because it originally referred to programming language, but it is really just a file type like `json` or `python`.
