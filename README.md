# cspell

[![](https://github.com/streetsidesoftware/cspell/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![](https://github.com/streetsidesoftware/cspell/actions/workflows/integration-test.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![](https://github.com/streetsidesoftware/cspell/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![](https://github.com/streetsidesoftware/cspell/actions/workflows/coverage.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)

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

- [cspell](packages/cspell) -- cspell command-line application
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

## CSpell for enterprise

Available as part of the Tidelift Subscription.

The maintainers of CSpell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Security contact information

To report a security vulnerability, please use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure.
