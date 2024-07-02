# CSpell

[![unit tests](https://github.com/streetsidesoftware/cspell/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![integration tests](https://github.com/streetsidesoftware/cspell/actions/workflows/integration-test.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![lint](https://github.com/streetsidesoftware/cspell/actions/workflows/lint.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![coverage](https://github.com/streetsidesoftware/cspell/actions/workflows/coverage.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)

[![codecov](https://codecov.io/gh/streetsidesoftware/cspell/branch/main/graph/badge.svg?token=Dr4fi2Sy08)](https://codecov.io/gh/streetsidesoftware/cspell)
[![Coverage Status](https://coveralls.io/repos/github/streetsidesoftware/cspell/badge.svg?branch=main)](https://coveralls.io/github/streetsidesoftware/cspell)

The CSpell mono-repo, a spell checker for code.

## Support Future Development

<!--- @@inject: static/sponsor.md --->

- [![GitHub Sponsors](https://img.shields.io/badge/-black?style=social&logo=githubsponsors&label=GitHub%20Sponsor%3A%20Street%20Side%20Software)](https://github.com/sponsors/streetsidesoftware)
- [![Patreon](https://img.shields.io/badge/-black?style=social&logo=patreon&label=Patreon%3A%20Street%20Side%20Software)](https://patreon.com/streetsidesoftware)
- [![PayPal](https://img.shields.io/badge/-black?style=social&logo=paypal&label=PayPal%20Donate%3A%20Street%20Side%20Software)](https://www.paypal.com/donate/?hosted_button_id=26LNBP2Q6MKCY)
- [![Open Collective](https://img.shields.io/badge/-black?style=social&logo=opencollective&label=Open%20Collective%3A%20CSpell)](https://opencollective.com/cspell)

<!--- @@inject-end: static/sponsor.md --->

## Documentation

[Documentation - CSpell](https://streetsidesoftware.github.io/cspell/)

## Third-Party Video Presentations

Some videos related to CSpell and the [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker) for VS Code.

- [Spell Checking Documentation in DevOps Pipelines](https://www.youtube.com/watch?v=w8gGi3aeVpc) by Houssem Dellai
- [Don't Worry About Spelling...VS Code Can Do It For You!!](https://www.youtube.com/watch?v=MfxFMFMsBP4) by [James Q Quick](https://www.youtube.com/@JamesQQuick)
- [Spell Checking In VSCode - VSCode Pro Tips](https://www.youtube.com/watch?v=_GwpPJgH1Gw)
- [Spell Check in VS Code with Code Spell Checker - Extension Highlight](https://www.youtube.com/watch?v=ZxNnOjWetH4)
- [Spell check your code from the command line with Cspell](https://www.youtube.com/watch?v=nwmJ9h_zPJc)
- [How to Use VS Code Spell Checker](https://www.youtube.com/watch?v=Ix5bMd0kZeY) - Detailed walkthrough to setup and use multiple languages
- [Code Spell Checker Extension for Visual Studio Code](https://www.youtube.com/watch?v=dUn1mrJYMrM)

## Packages

- [cspell](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell) -- cspell command-line application
- [@cspell/eslint-plugin](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-eslint-plugin) -- CSpell ESLint Plugin
- [cspell-bundled-dicts](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-bundled-dicts) -- collection of dictionaries bundled with cspell.
- [cspell-glob](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-glob) -- glob library.
- [cspell-io](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-io) -- i/o library.
- [cspell-lib](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-lib) -- cspell library used for code driven spelling checking (used by the application).
- [cspell-types](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-types) -- cspell types and JSON schema for cspell configuration files.
- [cspell-tools](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-tools) -- tool used to compile dictionaries.
- [cspell-trie-lib](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-trie-lib) -- trie data structure used to store words.
- [cspell-trie](https://github.com/streetsidesoftware/cspell/tree/main/packages/cspell-trie) -- trie data tool used to store words.
- [hunspell-reader](https://github.com/streetsidesoftware/cspell/tree/main/packages/hunspell-reader) -- reads Hunspell files and outputs words.

## Related Packages

- [cspell-cli](https://github.com/streetsidesoftware/cspell-cli) -- `cspell-cli` is useful for including `cspell` directly from GitHub.

  Example install: `npm install -g git+https://github.com/streetsidesoftware/cspell-cli`.

  This will add the `cspell-cli` command, which is an alias of the `cspell` command.

## Live Discussions

Join us on:

[<img src="./assets/images/zulip-icon-circle.svg" width="32">](https://cspell.zulipchat.com/)

[cspell.zulipchat.com](https://cspell.zulipchat.com/)

## RFCs

| Link                                                                                                                  | Description                     | Status      |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| [rfc-0001](https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0001%20suggestions/)                        | Fixing common misspellings      | Done        |
| [rfc-0002](https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0002%20improve%20dictionary%20suggestions/) | Improving Generated Suggestions | Done        |
| [rfc-0003](https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0003%20parsing%20files/)                    | Plug-ins: Adding file parsers   | In Progress |
| [rfc-0004](https://github.com/streetsidesoftware/cspell/tree/main/rfc/rfc-0004%20known%20issues/)                     | Support Marking Issues as Known | Not started |

## CSpell for enterprise

Available as part of the Tidelift Subscription.

The maintainers of CSpell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Security contact information

To report a security vulnerability, please email <security@streetsidesoftware.com> or use the
[Tidelift security contact](https://tidelift.com/security).
Tidelift will coordinate the fix and disclosure.

## Versions

|        | version | Node    | Status                | Maintenance | End of Free Support |
| :----- | :------ | :------ | :-------------------- | :---------- | :------------------ |
| cspell | 8.x     | 18.x    | In Active Development | TBD         | TBD                 |
| cspell | 7.x     | 16.x    | Maintenance           | 2023-10-01  | 2023-11-07          |
| cspell | 6.x     | 14.14.x | Paid support only[^1] | 2023-04-01  | 2023-05-01          |
| cspell | 5.x     | 12.x    | Paid support only[^1] | -           | 2022-10-01          |
| cspell | 4.x     | 10.x    | Paid support only[^1] | -           | 2022-05-01          |

[^1]: [Support - Street Side Software](https://streetsidesoftware.com/support/#maintenance-agreements)

## Contributing

Contributions are welcome! See our [contribution notes](CONTRIBUTING.md). **Note:** To add or remove words in a dictionary, visit [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts/issues).

🙏 _**Special thanks to all of our amazing contributors!**_ 🥰

<a href="https://github.com/streetsidesoftware/cspell/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=streetsidesoftware/cspell"  width="800px"/>
</a>

<!--- @@inject: static/footer.md --->

<br/>

---

<p align="center">Brought to you by<a href="https://streetsidesoftware.com" title="Street Side Software"><img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software</a></p>

<!--- @@inject-end: static/footer.md --->

<!---
cspell:ignore Houssem Dellai
--->
