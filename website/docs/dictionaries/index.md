---
layout: default
title: Dictionaries
categories: docs
# parent: Docs
sidebar_position: 1
sidebar_label: Default Dictionaries
---

# Dictionaries

CSpell includes default dictionaries. This page lists some common ones.

Use the `trace` command to see a list of dictionaries: See [Searching Dictionaries](./dictionaries/searching-dictionaries)

## General Dictionaries

- **en_US** - Derived from Hunspell US English words.
- **en-gb** - Derived from Hunspell GB English words.
- **companies** - List of well known companies
- **softwareTerms** - Software Terms and concepts like "coroutine", "debounce", "tree", etc.
- **misc** - Terms that do not belong in the other dictionaries.

## Programming Language Dictionaries

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

## Miscellaneous Dictionaries

- **fonts** - long list of fonts - to assist with _css_
- **filetypes** - list of file types
- **npm** - list of top 500+ package names on npm.

## Dictionary Definition

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
- **useCompounds** - _Deprecated_ - allow all possible combinations of words in the dictionary.

```javascript
// Define each dictionary. Relative paths are relative to the config file.
"dictionaryDefinitions": [
    { "name": "spanish", "path": "./spanish-words.txt"},
    { "name": "ruby", "path": "./ruby.txt"},
    { "name": "company-terms", "path": "./corp-terms.txt"}
],
```

## Disabling a Dictionary

<span id="disable-default-cpp-dictionary" />

See [Turning dictionaries on and off](./turning-dictionaries-on-and-off.md) to disable a dictionary globally or for
matching files.
