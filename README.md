# CSpell

[![unit tests](https://github.com/streetsidesoftware/cspell/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![integration tests](https://github.com/streetsidesoftware/cspell/actions/workflows/integration-test.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![lint](https://github.com/streetsidesoftware/cspell/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![coverage](https://github.com/streetsidesoftware/cspell/actions/workflows/coverage.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)

[![codecov](https://codecov.io/gh/streetsidesoftware/cspell/branch/main/graph/badge.svg?token=Dr4fi2Sy08)](https://codecov.io/gh/streetsidesoftware/cspell)
[![Coverage Status](https://coveralls.io/repos/github/streetsidesoftware/cspell/badge.svg?branch=main)](https://coveralls.io/github/streetsidesoftware/cspell)

The cspell mono-repo, a spell checker for code.

## Support Future Development

- Become a [<img src="https://github.githubassets.com/images/modules/site/icons/funding_platforms/patreon.svg" width="16" height="16" alt="Patreon">Patreon!](https://patreon.com/streetsidesoftware)
- [Support through ![PayPal](https://raw.githubusercontent.com/streetsidesoftware/vscode-spell-checker/main/images/PayPal/paypal-logo-wide-18.png)](https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY)
- [Open Collective](https://opencollective.com/cspell)

## Documentation

[Documentation - CSpell](https://streetsidesoftware.github.io/cspell/)

## Packages

- [cspell](packages/cspell) [![Verified on Openbase](https://badges.openbase.com/js/verified/cspell.svg?token=N5IXZIAqMY+0I+KuQhPpfoZYw0QUz/LiSYlOerD8Pio=)](https://openbase.com/js/cspell?utm_source=embedded&utm_medium=badge&utm_campaign=verified-badge&utm_term=js/cspell) -- cspell command-line application
- [@cspell/eslint-plugin](packages/cspell-eslint-plugin) [![Verified on Openbase](https://badges.openbase.com/js/verified/@cspell/eslint-plugin.svg?token=SVzjSaHtOWCFmjBOgw1W6CuYHDw29Vx77pNj7v5lPRE=)](https://openbase.com/js/@cspell/eslint-plugin?utm_source=embedded&utm_medium=badge&utm_campaign=rate-badge) -- CSpell ESLint Plugin
- [cspell-bundled-dicts](packages/cspell-bundled-dicts) -- collection of dictionaries bundled with cspell.
- [cspell-glob](packages/cspell-glob) -- glob library.
- [cspell-io](packages/cspell-io) -- i/o library.
- [cspell-lib](packages/cspell-lib) -- cspell library used for code driven spelling checking (used by the application).
- [cspell-types](packages/cspell-types) -- cspell types and JSON schema for cspell configuration files.
- [cspell-tools](packages/cspell-tools) -- tool used to compile dictionaries.
- [cspell-trie-lib](packages/cspell-trie-lib) -- trie data structure used to store words.
- [cspell-trie](packages/cspell-trie) -- trie data tool used to store words.
- [hunspell-reader](packages/hunspell-reader) -- reads Hunspell files and outputs words.

## Related Packages

- [cspell-cli](https://github.com/streetsidesoftware/cspell-cli) -- `cspell-cli` is useful for including `cspell` directly from GitHub.

  Example install: `npm install -g git+https://github.com/streetsidesoftware/cspell-cli`.

  This will add the `cspell-cli` command, which is an alias of the `cspell` command.

## RFCs

| Link                                                           | Description                     | Status      |
| -------------------------------------------------------------- | ------------------------------- | ----------- |
| [rfc-0001](rfc/rfc-0001%20suggestions/)                        | Fixing common misspellings      | No started  |
| [rfc-0002](rfc/rfc-0002%20improve%20dictionary%20suggestions/) | Improving Generated Suggestions | Done        |
| [rfc-0003](rfc/rfc-0003%20parsing%20files/)                    | Plug-ins: Adding file parsers   | In Progress |
| [rfc-0004](rfc/rfc-0004%20known%20issues/)                     | Support Marking Issues as Known | No started  |

## CSpell for enterprise

Available as part of the Tidelift Subscription.

The maintainers of CSpell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Security contact information

To report a security vulnerability, please use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure.

## Versions

|        | version | Node | Support                | End-Of-Life |
| :----- | :------ | :--- | :--------------------- | :---------- |
| cspell | 6.x     | 14.x | In Active Development  | TBD         |
| cspell | 5.x     | 12.x | Security and bug fixes | 2023-05-01  |
| cspell | 4.x     | 10.x | Paid support only[^1]  | 2022-05-01  |

[^1]: [Support - Street Side Software](https://streetsidesoftware.com/support/#maintenance-agreements)
