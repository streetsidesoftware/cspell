@cspell/cspell-types / [Exports](modules.md)

# Cspell Types

Contains cspell types and json-schema.

This package contains no dependencies to avoid any security issues.

## Support Future Development

- Become a [<img src="https://github.githubassets.com/images/modules/site/icons/funding_platforms/patreon.svg" width="16" height="16" alt="Patreon">Patreon!](https://patreon.com/streetsidesoftware)

## cspell for enterprise

Available as part of the Tidelift Subscription.

The maintainers of cspell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Installation

```
npm i -SD @cspell/cspell-types
```

## Usage

Can be use to make writing `cspell.config.js` files easier.

```js
'use strict';

/** @type { import("@cspell/cspell-types").CSpellUserSettings } */
const cspell = {
  description: 'cspell.config.js file in samples/js-config',
  languageSettings: [
    {
      languageId: 'cpp',
      allowCompoundWords: false,
      patterns: [
        {
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

## API

`CSpellSettings` alias `CSpellUserSettings` is the formal definition of the configuration that controls the spell checker.
