---
nav_order: 8
---

# Dictionaries

The spell checker includes a set of default dictionaries.

Hint: You can use the `[trace](commands/trace.md)` command to see a list of the dictionaries that are currently installed on your system.

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
- **filetypes** - list of file typescript
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
// Define each dictionary.  Relative paths are relative to the config file.
"dictionaryDefinitions": [
    { "name": "spanish", "path": "./spanish-words.txt"},
    { "name": "ruby", "path": "./ruby.txt"},
    { "name": "company-terms", "path": "./corp-terms.txt"}
],
```

## Disabling a Dictionary

It is possible to prevent a dictionary from being loaded. This is useful if you want to use your own dictionary or just
turn off an existing dictionary.

### Disable Default cpp Dictionary

```javascript
"dictionaries": ["!cpp"],
"overrides": [
  {
      "filename": "legacy/**/*.cpp",
      "dictionaries": ["!!cpp"], // add it back for *.cpp files under the legacy folder
  },
]
```

The number of `!`'s is important.

- `!cpp` remove `cpp` dictionary
- `!!cpp` add it back
- `!!!cpp` remove it again.

<!-- markdownlint-disable-file MD031 -->
