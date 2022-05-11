---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
nav_order: 1
permalink: /
---

# CSpell

`cspell` is a command line tool and library for spell checking code, documents, or anything else.

## Features

- **Spell checks.** Compare one or more files against a set of dictionaries.
- **Parses compound words automatically.** Supports `CamelCase`, `snake_case`, and `compoundwords`. <!-- cspell:ignore compoundwords -->
- **Self contained.** Comes with dictionaries and everything else you need. (It does not depend on OS libraries. It does not depend on online services.)
- **Fast.** Checks thousands of lines in seconds.
- **Customizable.** Supports custom dictionaries and word lists.
- **Programming language support.** Depending on the file type, words for popular programming languages are automatically whitelisted. Has support for JavaScript, TypeScript, Python, PHP, C#, C++, LaTex, Go, HTML, CSS, and more.
- **Continuous integration support.** Can easily be added as a linter in CI (i.e. [GitHub Actions](https://github.com/features/actions)).

## Support Future Development

- Become a [<img src="https://github.githubassets.com/images/modules/site/icons/funding_platforms/patreon.svg" width="16" height="16" alt="Patreon">Patreon!](https://patreon.com/streetsidesoftware)
- [Support through ![PayPal](./assets/images/paypal-logo-wide-16.png)](https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY)

## CSpell for Enterprise

Available as part of the Tidelift Subscription.

The maintainers of CSpell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## History

CSpell started out as [an extension](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) for [VS Code](https://code.visualstudio.com/).

When I started using VS Code, it did not have a spell checker. As a person that has trouble with spelling, I found this to be a great hinderance. Thus, the extension was born.

At the suggestion of users, `cspell` was pulled out of the extension and made into its own library / command line tools.
