---
nav_order: 6
has_children: true
---

# Configuration File

In addition to passing command-line flags to the program, CSpell's behavior can be controlled through a configuration file.

## Possible File Names / Languages

Usually, the CSpell configuration file is called ".cspell.json", but it also supports [several different options](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/configSearchPlaces.ts).

This means that you can have a YAML-based or JavaScript-based configuration, if you wish. There are no pros/cons to picking any particular language.

## Example File

Note that comments are not allowed in JSON, so you have to remove all of the comments for your file to be valid. (If you want to keep comments inside of your CSpell configuration, consider using a JavaScript configuration file instead.)

<!-- markdownlint-disable-next-line -->
#### **`.cspell.json`**

```javascript
// CSpell Settings
{
    // You should always specify a version; the latest version is 0.2
    "version": "0.2",
    // The current active spelling language
    "language": "en",
    // A list of words to be always considered correct
    "words": [
        "mkdirp",
        "tsmerge",
        "githubusercontent",
        "streetsidesoftware",
        "vsmarketplacebadge",
        "visualstudio"
    ],
    // A list of words to be always considered incorrect
    // This is useful for offensive words and common spelling errors
    // For example, "hte" should be "the"
    "flagWords": [
        "hte"
    ]
}
```

## Configuration File Sections

See [the auto-generated settings documentation](../types/cspell-types/interfaces/CSpellSettings.md).

## Using a `package.json` as a Configuration File

It is possible to store CSpell configuration in the `package.json` file of a project. CSpell looks for the configuration in the `cspell` field:

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

## Configuration File Path Resolution

CSpell will look for the nearest configuration file in the directory hierarchy. This allows for folder level configurations to be honored.

It is possible to stop this behavior by adding adding `"noConfigSearch": true` to the top level configuration.

For example, in the following monorepo:

```text
repo-root
├── cspell.config.json
├─┬ packages
│ ├─┬ package-A
│ │ ├── cspell.json
│ │ ├── README.md
│ │ └── CHANGELOG.md
│ ├─┬ package-B
│ │ ├── README.md
│ │ └── CHANGELOG.md
│ ├─┬ package-C
│ │ ├── cspell.yaml
│ │ ├── README.md
│ │ └── CHANGELOG.md
```

The following command will search the repo, starting at `repo-root`, looking for `.md` files:

```sh
repo-root % cspell "**/*.md"
```

The root configuration is used to determine which files to check. Files matching the globs in `ignorePaths` will not be checked. When a file is found, the directory hierarchy is searched looking for the nearest configuration file.

For example:

| File                           | Config Used                      |
| ------------------------------ | -------------------------------- |
| `packages/package-A/README.md` | `packages/package-A/cspell.json` |
| `packages/package-A/CONFIG.md` | `packages/package-A/cspell.json` |
| `packages/package-B/README.md` | `cspell.config.json`             |
| `packages/package-C/README.md` | `packages/package-C/cspell.yaml` |

### Include Patterns

- `Everything`<sup>1</sup> -- By default we match an entire document and remove the excludes.
- `string` -- This matches common string formats like '...', "...", and \`...\`
- `CStyleComment` -- These are C Style comments /\* \*/ and //
- `PhpHereDoc` -- This matches PHPHereDoc strings.

<sup>1.</sup> These patterns are part of the default include/exclude list for every file.

## Type Safety / Schema

By using the `cspell-types` library, you can add type-safety to your CSpell configuration file.

For example:

<!-- markdownlint-disable-next-line -->
#### **`cspell.config.js`**

```javascript
'use strict';

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
  description: 'Company cspell settings',
  languageSettings: [
    {
      languageId: 'cpp',
      allowCompoundWords: false,
      patterns: [
        {
          // define a pattern to ignore #includes
          name: 'pound-includes',
          pattern: /^\s*#include.*/g,
        },
      ],
      ignoreRegExpList: ['pound-includes'],
    },
  ],
  dictionaryDefinitions: [
    {
      name: 'custom-words',
      path: './custom-words.txt',
    },
  ],
  dictionaries: ['custom-words'],
};

module.exports = cspell;
```
