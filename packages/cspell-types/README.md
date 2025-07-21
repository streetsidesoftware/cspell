# Cspell Types

Contains cspell types and json-schema.

This package contains no dependencies to avoid any security issues.

## Support Future Development

<!--- @@inject: ../../static/sponsor.md --->

- [![GitHub Sponsors](https://img.shields.io/badge/-black?style=social&logo=githubsponsors&label=GitHub%20Sponsor%3A%20Street%20Side%20Software)](https://github.com/sponsors/streetsidesoftware)
- [![PayPal](https://img.shields.io/badge/-black?style=social&logo=paypal&label=PayPal%20Donate%3A%20Street%20Side%20Software)](https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY)
- [![Open Collective](https://img.shields.io/badge/-black?style=social&logo=opencollective&label=Open%20Collective%3A%20CSpell)](https://opencollective.com/cspell)

<!---
- [![Patreon](https://img.shields.io/badge/-black?style=social&logo=patreon&label=Patreon%3A%20Street%20Side%20Software)](https://patreon.com/streetsidesoftware)
  --->

<!--- @@inject-end: ../../static/sponsor.md --->

## Installation

```
npm i -S @cspell/cspell-types
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

## API

`CSpellSettings` alias `CSpellUserSettings` is the formal definition of the configuration that controls the spell checker.

## CSpell for Enterprise

<!--- @@inject: ../../static/tidelift.md --->

Available as part of the Tidelift Subscription.

The maintainers of cspell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

<!--- @@inject-end: ../../static/tidelift.md --->

<!--- @@inject: ../../static/footer.md --->

<br/>

---

<p align="center">Brought to you by<a href="https://streetsidesoftware.com" title="Street Side Software"><img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software</a></p>

<!--- @@inject-end: ../../static/footer.md --->
