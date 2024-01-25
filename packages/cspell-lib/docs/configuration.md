# CSpell Configuration Files

## Supported Configuration Files

The spell checker will look for the following configuration files.

- `.cspell.json`
- `cspell.json`
- `.cSpell.json`
- `cSpell.json`
- `.vscode/cspell.json`
- `.vscode/cSpell.json`
- `.vscode/.cspell.json`
- `cspell.config.js`
- `cspell.config.cjs`
- `cspell.config.json`
- `cspell.config.yaml`
- `cspell.config.yml`
- `cspell.yaml`
- `cspell.yml`

## Configuration Search

While spell checking files, the spell checker will look for the nearest configuration file in the directory hierarchy.
This allows for folder level configurations to be honored.
It is possible to stop this behavior by adding adding `"noConfigSearch": true` to the top level configuration.

A Monorepo Example:

```
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

The following command will search the repo start at `repo-root` looking for `.md` files.

```
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

## Example Configurations:

### Example `cspell.config.js`

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
          pattern: /^\s*#include.*/g
        }
      ],
      ignoreRegExpList: ['pound-includes']
    }
  ],
  dictionaryDefinitions: [
    {
      name: 'custom-words',
      path: './custom-words.txt'
    }
  ],
  dictionaries: ['custom-words']
};

module.exports = cspell;
```

### Example import from `cspell.json`

Import a `cspell.config.js` file from a `cspell.json` file.

```javascript
{
    "import": ["../cspell.config.js"]
}
```
