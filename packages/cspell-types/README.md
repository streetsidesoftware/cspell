# Cspell Types

Contains cspell types and json-schema.

This package contains no dependencies to avoid any security issues.

## Support Future Development

<!--- @@inject: ../../static/sponsor.md --->

If CSpell saves you time, please consider supporting its development.

<p align="left">
  <a href="https://github.com/sponsors/streetsidesoftware" title="GitHub Sponsor"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cspell.org/img/sponsor/github-sponsor-dark.png" /><img alt="GitHub Sponsor" src="https://cspell.org/img/sponsor/github-sponsor.png" width="180" /></picture></a>
  &nbsp;
  <a href="https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY" title="PayPal"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cspell.org/img/sponsor/paypal-dark.png" /><img alt="PayPal" src="https://cspell.org/img/sponsor/paypal.png" width="180" /></picture></a>
  &nbsp;
  <a href="https://opencollective.com/cspell" title="Open Collective"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cspell.org/img/sponsor/open-collective-dark.png" /><img alt="Open Collective" src="https://cspell.org/img/sponsor/open-collective.png" width="180" /></picture></a>
  &nbsp;
  <a href="https://streetsidesoftware.com/sponsor/" title="Street Side Software"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cspell.org/img/sponsor/cspell-dark.png" /><img alt="CSpell" src="https://cspell.org/img/sponsor/cspell.png" width="180" /></picture></a>
</p>

<!--- @@inject-end: ../../static/sponsor.md --->

## Installation

```
npm i -S @cspell/cspell-types
```

## Usage

Can be used to make writing `cspell.config.js` files easier.

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

`CSpellSettings` (aliased as `CSpellUserSettings`) is the formal definition of the configuration that controls the spell checker.

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
