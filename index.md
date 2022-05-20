---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
title: CSpell
nav_order: 1
description: 'CSpell - A spell checker for code!'
permalink: /
---

# Welcome to CSpell

A Spell Checker for Code!

`cspell` is a command line tool and library for spell checking code.

## Support Future Development

- Become a [<img src="https://github.githubassets.com/images/modules/site/icons/funding_platforms/patreon.svg" width="16" height="16" alt="Patreon">Patreon!](https://patreon.com/streetsidesoftware)
- [Support through ![PayPal](./assets/images/paypal-logo-wide-16.png)](https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY)

## Features

- Spell Checks Code -- Able to spell check code by parsing it into words before checking against the dictionaries.
- Supports CamelCase, snake_case, and compoundwords naming styles.
- Self contained -- does not depend upon OS libraries like Hunspell or aspell. Nor does it depend upon online services.
- Fast -- checks 1000's of lines of code in seconds.
- Programming Language Specific Dictionaries -- Has dedicated support for:
  - JavaScript, TypeScript, Python, PHP, C#, C++, LaTex, Go, HTML, CSS, etc.
- Customizable -- supports custom dictionaries and word lists.
- Continuous Integration Support -- Can easily be added as a linter to Travis-CI.

CSpell was initially built as the spell checking service for the [spell checker extension](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) for
[Visual Studio Code](https://code.visualstudio.com/).

## CSpell for Enterprise

Available as part of the Tidelift Subscription.

The maintainers of CSpell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Installation

```sh
npm install -g cspell
```

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

## Getting Started

See: [Getting Started](./docs/getting-started.md)

## Requirements

|        | version | Node | Support                     |
| :----- | :------ | :--- | :-------------------------- |
| cspell | 6.x     | 14.x | In Active Development       |
| cspell | 5.x     | 12.x | Security and bug fixes      |
| cspell | 4.x     | 10.x | Paid support only[^support] |

<!---
cspell:ignore compoundwords paypal
--->

[^support]: [Support - Street Side Software](https://streetsidesoftware.com/support/#maintenance-agreements)
