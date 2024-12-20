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

<!--- @@inject: static/contributors.md --->

<!--- cspell:disable --->

[<img alt="Contributor Jason3S" src="https://private-avatars.githubusercontent.com/u/3740137?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyODAsIm5iZiI6MTczNDY3OTA4MCwicGF0aCI6Ii91LzM3NDAxMzcifQ.QuzZ7PV0Gi7DNFcAXrDq-WRouu-dubbAn7EvwOsnkgE&v=4&size=128" width=64>](https://github.com/Jason3S)
[<img alt="Contributor street-side-software-automation[bot]" src="https://private-avatars.githubusercontent.com/u/50543896?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxMDAsIm5iZiI6MTczNDY3ODkwMCwicGF0aCI6Ii91LzUwNTQzODk2In0.5ZbtZp9hC8UfrY8oeuZhPrhf_t9Bi_5yOiqa-3kW5ZU&v=4&size=128" width=64>](https://github.com/apps/street-side-software-automation)
[<img alt="Contributor dependabot[bot]" src="https://private-avatars.githubusercontent.com/in/29110?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxNjAsIm5iZiI6MTczNDY3ODk2MCwicGF0aCI6Ii9pbi8yOTExMCJ9.aFhQiCACAQpu3__d5LnBlaf5_ll-Zt9KTpH2VFOyyd0&v=4&size=128" width=64>](https://github.com/apps/dependabot)
[<img alt="Contributor nschonni" src="https://private-avatars.githubusercontent.com/u/1297909?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1ODAsIm5iZiI6MTczNDY3OTM4MCwicGF0aCI6Ii91LzEyOTc5MDkifQ.aGVVXN7TM-Bze8lCi968UaWy4tpddsNTxw2L7nrrGDI&v=4&size=128" width=64>](https://github.com/nschonni)
[<img alt="Contributor Jason-Rev" src="https://private-avatars.githubusercontent.com/u/4850573?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3MDAsIm5iZiI6MTczNDY3OTUwMCwicGF0aCI6Ii91LzQ4NTA1NzMifQ.OkNNGQ9qx_axcHUmr8DtpMctbkW5IybGSzhaUtIVi_k&v=4&size=128" width=64>](https://github.com/Jason-Rev)
[<img alt="Contributor amanoji" src="https://private-avatars.githubusercontent.com/u/17751138?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2Nzk5ODAsIm5iZiI6MTczNDY3ODc4MCwicGF0aCI6Ii91LzE3NzUxMTM4In0.2VQgIPbrTA63mZYU8DTQZO49PgvsKloAOUm0077COlA&v=4&size=128" width=64>](https://github.com/amanoji)
[<img alt="Contributor jrylan" src="https://private-avatars.githubusercontent.com/u/178806156?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyODAsIm5iZiI6MTczNDY3OTA4MCwicGF0aCI6Ii91LzE3ODgwNjE1NiJ9.qV9eO8FS897KG4vmpvrmtNSoLBaTynTtg-eScppr97U&v=4&size=128" width=64>](https://github.com/jrylan)
[<img alt="Contributor mad-gooze" src="https://private-avatars.githubusercontent.com/u/1188779?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyMjAsIm5iZiI6MTczNDY3OTAyMCwicGF0aCI6Ii91LzExODg3NzkifQ.NztzADp0uk6Vi0wNuX7ln7J_NZmVQG4HE47bDL-jVzk&v=4&size=128" width=64>](https://github.com/mad-gooze)
[<img alt="Contributor snyk-bot" src="https://private-avatars.githubusercontent.com/u/19733683?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxNjAsIm5iZiI6MTczNDY3ODk2MCwicGF0aCI6Ii91LzE5NzMzNjgzIn0.fN6VSKlIuVTnbTS7jHt_hOtcSYSOoPIqRUFJN1xAqq8&v=4&size=128" width=64>](https://github.com/snyk-bot)
[<img alt="Contributor zo" src="https://private-avatars.githubusercontent.com/u/518711?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxMDAsIm5iZiI6MTczNDY3ODkwMCwicGF0aCI6Ii91LzUxODcxMSJ9.BEoYnmpTgRiPK-vQAeySoDX4JactOnzbxMOe8XBsEFg&v=4&size=128" width=64>](https://github.com/zo)
[<img alt="Contributor dsanders11" src="https://private-avatars.githubusercontent.com/u/5820654?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA0MDAsIm5iZiI6MTczNDY3OTIwMCwicGF0aCI6Ii91LzU4MjA2NTQifQ.y7-pJEhVAfL9jhE0JOAd172qDHJpeqgBvEHkH4wemFU&v=4&size=128" width=64>](https://github.com/dsanders11)
[<img alt="Contributor coliff" src="https://private-avatars.githubusercontent.com/u/1212885?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA0NjAsIm5iZiI6MTczNDY3OTI2MCwicGF0aCI6Ii91LzEyMTI4ODUifQ.-W7qQAP4Lzzy0DAtX5pKR7agDcvESW9-tebQ4Imr8bc&v=4&size=128" width=64>](https://github.com/coliff)
[<img alt="Contributor github-actions[bot]" src="https://private-avatars.githubusercontent.com/in/15368?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3NjAsIm5iZiI6MTczNDY3OTU2MCwicGF0aCI6Ii9pbi8xNTM2OCJ9.JQdDR0xmKrYYDlUjfmicR0HX_YwaeuVcHmdK2cDHbq8&v=4&size=128" width=64>](https://github.com/apps/github-actions)
[<img alt="Contributor dakotaJang" src="https://private-avatars.githubusercontent.com/u/22528264?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2Nzk5ODAsIm5iZiI6MTczNDY3ODc4MCwicGF0aCI6Ii91LzIyNTI4MjY0In0.iK-bao8201EMVuxR5cOgEEcy2xsjlTKwl8wLdYlFvZQ&v=4&size=128" width=64>](https://github.com/dakotaJang)
[<img alt="Contributor bisubus" src="https://private-avatars.githubusercontent.com/u/2905949?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA0NjAsIm5iZiI6MTczNDY3OTI2MCwicGF0aCI6Ii91LzI5MDU5NDkifQ.vPINDzIvOaSe_pOEOmyRARmeRBFOWLl195rtUEF8N34&v=4&size=128" width=64>](https://github.com/bisubus)
[<img alt="Contributor aimagic" src="https://private-avatars.githubusercontent.com/u/40253639?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1MjAsIm5iZiI6MTczNDY3OTMyMCwicGF0aCI6Ii91LzQwMjUzNjM5In0.xUSlF1z8fkrUeV_lD368IuSWHAD2i-kzYJul8XHSjJg&v=4&size=128" width=64>](https://github.com/aimagic)
[<img alt="Contributor abdusabri" src="https://private-avatars.githubusercontent.com/u/25670682?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1MjAsIm5iZiI6MTczNDY3OTMyMCwicGF0aCI6Ii91LzI1NjcwNjgyIn0.m2J8jVI9pxu4NxUzaqw9Vo728_lzpzCtFNMTrg39rkA&v=4&size=128" width=64>](https://github.com/abdusabri)
[<img alt="Contributor caaatisgood" src="https://private-avatars.githubusercontent.com/u/12913401?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3MDAsIm5iZiI6MTczNDY3OTUwMCwicGF0aCI6Ii91LzEyOTEzNDAxIn0.TbA59Sbri702MJsFDVrNHsZxRPYWvbWqX3qP0CSM0gY&v=4&size=128" width=64>](https://github.com/caaatisgood)
[<img alt="Contributor pzmarzly" src="https://private-avatars.githubusercontent.com/u/8074163?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1ODAsIm5iZiI6MTczNDY3OTM4MCwicGF0aCI6Ii91LzgwNzQxNjMifQ.lifIvkcYebjaRY_uQsDqjaEhD3GZK-Zyd8gLz4OUtvo&v=4&size=128" width=64>](https://github.com/pzmarzly)
[<img alt="Contributor naveensrinivasan" src="https://private-avatars.githubusercontent.com/u/172697?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3NjAsIm5iZiI6MTczNDY3OTU2MCwicGF0aCI6Ii91LzE3MjY5NyJ9.rVJp4sTzFp1L61odd1wqknq1lyNVvmG1NH2KWHBy3hU&v=4&size=128" width=64>](https://github.com/naveensrinivasan)
[<img alt="Contributor matt9ucci" src="https://private-avatars.githubusercontent.com/u/8044346?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxMDAsIm5iZiI6MTczNDY3ODkwMCwicGF0aCI6Ii91LzgwNDQzNDYifQ.VLWugcGgjaSlvCiKtNkd0NOun_uzEA8x7rdFWT6s33E&v=4&size=128" width=64>](https://github.com/matt9ucci)
[<img alt="Contributor lostintangent" src="https://private-avatars.githubusercontent.com/u/116461?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAzNDAsIm5iZiI6MTczNDY3OTE0MCwicGF0aCI6Ii91LzExNjQ2MSJ9.MhbPbkKK-WOWcIFiY-IqDUw7IGXCxAOW7VT4PI3K49I&v=4&size=128" width=64>](https://github.com/lostintangent)
[<img alt="Contributor Zamiell" src="https://private-avatars.githubusercontent.com/u/5511220?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1MjAsIm5iZiI6MTczNDY3OTMyMCwicGF0aCI6Ii91LzU1MTEyMjAifQ.-ZQq-e-LTnJm4DbX8VjeIOEIV81DBc1lKH2Q3e-1LZU&v=4&size=128" width=64>](https://github.com/Zamiell)
[<img alt="Contributor dflock" src="https://private-avatars.githubusercontent.com/u/47756?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1ODAsIm5iZiI6MTczNDY3OTM4MCwicGF0aCI6Ii91LzQ3NzU2In0.lYhmaKRWocWAEUKzhhChy6X3WEgzTzFjLTLvhew8KyA&v=4&size=128" width=64>](https://github.com/dflock)
[<img alt="Contributor DenysVuika" src="https://private-avatars.githubusercontent.com/u/503991?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1MjAsIm5iZiI6MTczNDY3OTMyMCwicGF0aCI6Ii91LzUwMzk5MSJ9.mB-YxeAV5EZs2xFaholbk4DviqQU_WVxlAkrifB11Qo&v=4&size=128" width=64>](https://github.com/DenysVuika)
[<img alt="Contributor benmccann" src="https://private-avatars.githubusercontent.com/u/322311?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1ODAsIm5iZiI6MTczNDY3OTM4MCwicGF0aCI6Ii91LzMyMjMxMSJ9.a5b6Or_1kI4eqHiohLAw54v-MPzCOgd__a9M2ArADwQ&v=4&size=128" width=64>](https://github.com/benmccann)
[<img alt="Contributor ScottRudiger" src="https://private-avatars.githubusercontent.com/u/26824724?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA4MjAsIm5iZiI6MTczNDY3OTYyMCwicGF0aCI6Ii91LzI2ODI0NzI0In0.-DLq04wuEIwu_FnF4bKfJdvPO65y2FleOiq3GOJgiMU&v=4&size=128" width=64>](https://github.com/ScottRudiger)
[<img alt="Contributor rivy" src="https://private-avatars.githubusercontent.com/u/80132?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAzNDAsIm5iZiI6MTczNDY3OTE0MCwicGF0aCI6Ii91LzgwMTMyIn0.KFeBuZtn05q9GKKkGWniFpJIQA9XLs7l4j03O85ZqWg&v=4&size=128" width=64>](https://github.com/rivy)
[<img alt="Contributor rasa" src="https://private-avatars.githubusercontent.com/u/220772?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxNjAsIm5iZiI6MTczNDY3ODk2MCwicGF0aCI6Ii91LzIyMDc3MiJ9.2afjyNNxcAwMqdosn0_sIpsCSnomnBECPzqwLIsfhxU&v=4&size=128" width=64>](https://github.com/rasa)
[<img alt="Contributor roman-petrov" src="https://private-avatars.githubusercontent.com/u/18419515?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAwNDAsIm5iZiI6MTczNDY3ODg0MCwicGF0aCI6Ii91LzE4NDE5NTE1In0.9tOd2lq-nfn6b7NBBInCO4nCdUIRgmEqrOC9Ya6xmhM&v=4&size=128" width=64>](https://github.com/roman-petrov)
[<img alt="Contributor orta" src="https://private-avatars.githubusercontent.com/u/49038?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3NjAsIm5iZiI6MTczNDY3OTU2MCwicGF0aCI6Ii91LzQ5MDM4In0.q5zRH-ff3DSFeRzMUv4KyGSR8WwlGPuNmXrvrmHXEsw&v=4&size=128" width=64>](https://github.com/orta)
[<img alt="Contributor ollelauribostrom" src="https://private-avatars.githubusercontent.com/u/16004130?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxMDAsIm5iZiI6MTczNDY3ODkwMCwicGF0aCI6Ii91LzE2MDA0MTMwIn0.NhOe1_YNDeP6eamYUCxMCG2tIYB1fQ--zAHjCP8I3z0&v=4&size=128" width=64>](https://github.com/ollelauribostrom)
[<img alt="Contributor alexandear" src="https://private-avatars.githubusercontent.com/u/3228886?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1ODAsIm5iZiI6MTczNDY3OTM4MCwicGF0aCI6Ii91LzMyMjg4ODYifQ.cvgp4b14dPo1ryXAgOtGy_JeHkD_XIcQiS7ieGRSe7o&v=4&size=128" width=64>](https://github.com/alexandear)
[<img alt="Contributor ndelangen" src="https://private-avatars.githubusercontent.com/u/3070389?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyMjAsIm5iZiI6MTczNDY3OTAyMCwicGF0aCI6Ii91LzMwNzAzODkifQ.9dXqb_aseLAmd5VuH7TZCGEeP-qUfZXy5FKswjISAzE&v=4&size=128" width=64>](https://github.com/ndelangen)
[<img alt="Contributor nvuillam" src="https://private-avatars.githubusercontent.com/u/17500430?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyMjAsIm5iZiI6MTczNDY3OTAyMCwicGF0aCI6Ii91LzE3NTAwNDMwIn0.FxtsTdCALujQbEX3QRsRUESt7ezWI0x3LCHQXClZbGU&v=4&size=128" width=64>](https://github.com/nvuillam)
[<img alt="Contributor exhuma" src="https://private-avatars.githubusercontent.com/u/65717?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyMjAsIm5iZiI6MTczNDY3OTAyMCwicGF0aCI6Ii91LzY1NzE3In0.kE5WHl8KE7_Jf_XzsJz7RwOJBQkNVTydE2PyHWghN2E&v=4&size=128" width=64>](https://github.com/exhuma)
[<img alt="Contributor 74th" src="https://private-avatars.githubusercontent.com/u/1060011?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA2NDAsIm5iZiI6MTczNDY3OTQ0MCwicGF0aCI6Ii91LzEwNjAwMTEifQ.ONZpYG1kH4IpW2E5ABWvTf1f8g7FFLXrZS4k4Rkuhcw&v=4&size=128" width=64>](https://github.com/74th)
[<img alt="Contributor ssbarnea" src="https://private-avatars.githubusercontent.com/u/102495?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3NjAsIm5iZiI6MTczNDY3OTU2MCwicGF0aCI6Ii91LzEwMjQ5NSJ9.n2TUj6z_jbIWOqZTAFaMNUz-tnIZewoN926btPKK150&v=4&size=128" width=64>](https://github.com/ssbarnea)
[<img alt="Contributor regseb" src="https://private-avatars.githubusercontent.com/u/1262990?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA4MjAsIm5iZiI6MTczNDY3OTYyMCwicGF0aCI6Ii91LzEyNjI5OTAifQ.jQV9NQlH8fB_7cNsZHGHeiu1Wm9fIoQ1Ugi1tYGg4Fg&v=4&size=128" width=64>](https://github.com/regseb)
[<img alt="Contributor zwaldowski" src="https://private-avatars.githubusercontent.com/u/170812?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1MjAsIm5iZiI6MTczNDY3OTMyMCwicGF0aCI6Ii91LzE3MDgxMiJ9.dxsh1EQu93a1EGzJ6nl1FNXObuAvVjBUAMofdWJhMAY&v=4&size=128" width=64>](https://github.com/zwaldowski)
[<img alt="Contributor fisker" src="https://private-avatars.githubusercontent.com/u/172584?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1ODAsIm5iZiI6MTczNDY3OTM4MCwicGF0aCI6Ii91LzE3MjU4NCJ9.jDjUa8rdzdpQ10bMbHYw5_r7K0-HN3j6wh55nBSESvU&v=4&size=128" width=64>](https://github.com/fisker)
[<img alt="Contributor hzhu" src="https://private-avatars.githubusercontent.com/u/1811365?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAwNDAsIm5iZiI6MTczNDY3ODg0MCwicGF0aCI6Ii91LzE4MTEzNjUifQ.u8cYt3XKUCHBCYPqe95BubxYu-S4djKckde5Sr5Vsug&v=4&size=128" width=64>](https://github.com/hzhu)
[<img alt="Contributor jonz94" src="https://private-avatars.githubusercontent.com/u/16042676?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyODAsIm5iZiI6MTczNDY3OTA4MCwicGF0aCI6Ii91LzE2MDQyNjc2In0.y0lCA2p1vaRiwOnQ8hSIZrt0hyDqKQ6fF2v6uwQuDH4&v=4&size=128" width=64>](https://github.com/jonz94)
[<img alt="Contributor mrazauskas" src="https://private-avatars.githubusercontent.com/u/72159681?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3NjAsIm5iZiI6MTczNDY3OTU2MCwicGF0aCI6Ii91LzcyMTU5NjgxIn0._vHbevHkAJYY8QWJfq8532Ss1oTeYxAoUuT9t6sg4Gk&v=4&size=128" width=64>](https://github.com/mrazauskas)
[<img alt="Contributor wtgtybhertgeghgtwtg" src="https://private-avatars.githubusercontent.com/u/18507762?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA0NjAsIm5iZiI6MTczNDY3OTI2MCwicGF0aCI6Ii91LzE4NTA3NzYyIn0.32pvtekfY-fiqVvK9HcrdCgTvUSoMrTpvGfykodvUO8&v=4&size=128" width=64>](https://github.com/wtgtybhertgeghgtwtg)
[<img alt="Contributor wujekbogdan" src="https://private-avatars.githubusercontent.com/u/533954?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3MDAsIm5iZiI6MTczNDY3OTUwMCwicGF0aCI6Ii91LzUzMzk1NCJ9.VCN9ZfiH5DVqu_cD3ZuRsXww1ox6C2VqYNXI5bo_pvk&v=4&size=128" width=64>](https://github.com/wujekbogdan)
[<img alt="Contributor siosio34" src="https://private-avatars.githubusercontent.com/u/7166022?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyMjAsIm5iZiI6MTczNDY3OTAyMCwicGF0aCI6Ii91LzcxNjYwMjIifQ.iFUsluxV_8bZnHQ7DjHwXukVkkcrcE27HUM9ShJKVFU&v=4&size=128" width=64>](https://github.com/siosio34)
[<img alt="Contributor ADTC" src="https://private-avatars.githubusercontent.com/u/6047296?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxMDAsIm5iZiI6MTczNDY3ODkwMCwicGF0aCI6Ii91LzYwNDcyOTYifQ.LCzXavJmDre0k51Ocl-7TXZuYsMZA05Lt5cAOs4XBvY&v=4&size=128" width=64>](https://github.com/ADTC)
[<img alt="Contributor kachkaev" src="https://private-avatars.githubusercontent.com/u/608862?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAzNDAsIm5iZiI6MTczNDY3OTE0MCwicGF0aCI6Ii91LzYwODg2MiJ9.GWKpXOuoe5fHZEH0fZFpouXAfnLV-wIzmLVRTypl-4I&v=4&size=128" width=64>](https://github.com/kachkaev)
[<img alt="Contributor AlexJameson" src="https://private-avatars.githubusercontent.com/u/33040934?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA0NjAsIm5iZiI6MTczNDY3OTI2MCwicGF0aCI6Ii91LzMzMDQwOTM0In0.XduoWU3OUJyGGaMdv-ELRmNB9Go-0gOel9L-22VBjNY&v=4&size=128" width=64>](https://github.com/AlexJameson)
[<img alt="Contributor AlekSi" src="https://private-avatars.githubusercontent.com/u/11512?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1MjAsIm5iZiI6MTczNDY3OTMyMCwicGF0aCI6Ii91LzExNTEyIn0.pFUIcD1kNRWecNsJzXumzz-X7-SiN07_HhoEa9yVxKg&v=4&size=128" width=64>](https://github.com/AlekSi)
[<img alt="Contributor alicewriteswrongs" src="https://private-avatars.githubusercontent.com/u/6207644?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA4MjAsIm5iZiI6MTczNDY3OTYyMCwicGF0aCI6Ii91LzYyMDc2NDQifQ.I0WHD_x1cJKFGyAlaCGOHEZHdIQY1YCsMUaerSqcEmU&v=4&size=128" width=64>](https://github.com/alicewriteswrongs)
[<img alt="Contributor aminya" src="https://private-avatars.githubusercontent.com/u/16418197?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA2NDAsIm5iZiI6MTczNDY3OTQ0MCwicGF0aCI6Ii91LzE2NDE4MTk3In0.YfYOMzutcBGtY7xtr0pKd6kyG1vHhX0_KX9TwOcUh6I&v=4&size=128" width=64>](https://github.com/aminya)
[<img alt="Contributor screendriver" src="https://private-avatars.githubusercontent.com/u/149248?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3MDAsIm5iZiI6MTczNDY3OTUwMCwicGF0aCI6Ii91LzE0OTI0OCJ9.LLg8jv4tuaRf1KeTUBI4hPWwXFnVuMW8Ee_M6yv5vlY&v=4&size=128" width=64>](https://github.com/screendriver)
[<img alt="Contributor Namchee" src="https://private-avatars.githubusercontent.com/u/32661241?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAwNDAsIm5iZiI6MTczNDY3ODg0MCwicGF0aCI6Ii91LzMyNjYxMjQxIn0.afvkWWF6WU3OTgSNkXgWRYyxdrCxCfb9JO6upC0RU4w&v=4&size=128" width=64>](https://github.com/Namchee)
[<img alt="Contributor d2s" src="https://private-avatars.githubusercontent.com/u/135053?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA1MjAsIm5iZiI6MTczNDY3OTMyMCwicGF0aCI6Ii91LzEzNTA1MyJ9.GnohqBhvRAZK-Oai9Yp3k9QZLWWbFgmu_y-czIaqVsk&v=4&size=128" width=64>](https://github.com/d2s)
[<img alt="Contributor dimitropoulos" src="https://private-avatars.githubusercontent.com/u/15232461?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA3MDAsIm5iZiI6MTczNDY3OTUwMCwicGF0aCI6Ii91LzE1MjMyNDYxIn0.Kmoqh3ihzn40_4Oqb2xbnePUv9P1RJRddSaIWZFFdIo&v=4&size=128" width=64>](https://github.com/dimitropoulos)
[<img alt="Contributor evenstensberg" src="https://private-avatars.githubusercontent.com/u/16735925?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2Nzk5ODAsIm5iZiI6MTczNDY3ODc4MCwicGF0aCI6Ii91LzE2NzM1OTI1In0.HTZBC0k3qz0YuxfYr8zI3q31UT0XcVr-qpHJ25kL7vs&v=4&size=128" width=64>](https://github.com/evenstensberg)
[<img alt="Contributor tribut" src="https://private-avatars.githubusercontent.com/u/719105?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAwNDAsIm5iZiI6MTczNDY3ODg0MCwicGF0aCI6Ii91LzcxOTEwNSJ9.3kIbqaoa4FfjJfnBtpWlIoqyibBYfvtcHN9uhpq-yyQ&v=4&size=128" width=64>](https://github.com/tribut)
[<img alt="Contributor HoussemDellai" src="https://private-avatars.githubusercontent.com/u/6548359?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxMDAsIm5iZiI6MTczNDY3ODkwMCwicGF0aCI6Ii91LzY1NDgzNTkifQ.jDzZLqSopCFn29VMlXe7_NBLkyOMKpw7pJMqtfJwPB0&v=4&size=128" width=64>](https://github.com/HoussemDellai)
[<img alt="Contributor jmatsuzawa" src="https://private-avatars.githubusercontent.com/u/545426?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxMDAsIm5iZiI6MTczNDY3ODkwMCwicGF0aCI6Ii91LzU0NTQyNiJ9.TXGua-jWDPieROwZO8CGW_JE3pLoUowwcr2K1JIw8eM&v=4&size=128" width=64>](https://github.com/jmatsuzawa)
[<img alt="Contributor joshje" src="https://private-avatars.githubusercontent.com/u/813784?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAwNDAsIm5iZiI6MTczNDY3ODg0MCwicGF0aCI6Ii91LzgxMzc4NCJ9.eFUpPyAkqmtiFX0z3d498bnl7Zsc4syc4Wh4w9Fo6yo&v=4&size=128" width=64>](https://github.com/joshje)
[<img alt="Contributor kamontat" src="https://private-avatars.githubusercontent.com/u/14089557?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAxNjAsIm5iZiI6MTczNDY3ODk2MCwicGF0aCI6Ii91LzE0MDg5NTU3In0.iA6GsF9R7ZYAxNBNzk2cLhHVAh116SlFKVKFHm8_aKg&v=4&size=128" width=64>](https://github.com/kamontat)
[<img alt="Contributor kenji-miyake" src="https://private-avatars.githubusercontent.com/u/31987104?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAyMjAsIm5iZiI6MTczNDY3OTAyMCwicGF0aCI6Ii91LzMxOTg3MTA0In0.RVvOyZfqw20xDRGlgd4OaSz-5BMPgIIdjsNNuBY-n88&v=4&size=128" width=64>](https://github.com/kenji-miyake)
[<img alt="Contributor fughilli" src="https://private-avatars.githubusercontent.com/u/6869039?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODA4MjAsIm5iZiI6MTczNDY3OTYyMCwicGF0aCI6Ii91LzY4NjkwMzkifQ.NZ-QpDBNvEEbbtjF5sCJ1WSHBD1rzoCiLn834eMe8bI&v=4&size=128" width=64>](https://github.com/fughilli)
[<img alt="Contributor Ki-er" src="https://private-avatars.githubusercontent.com/u/32241933?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2Nzk5ODAsIm5iZiI6MTczNDY3ODc4MCwicGF0aCI6Ii91LzMyMjQxOTMzIn0.MCe_mx9WQJCZFk_wRHARysRlhyePmhRLlC4CTZf7mBE&v=4&size=128" width=64>](https://github.com/Ki-er)
[<img alt="Contributor Maxim-Mazurok" src="https://private-avatars.githubusercontent.com/u/7756211?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTEiLCJleHAiOjE3MzQ2ODAzNDAsIm5iZiI6MTczNDY3OTE0MCwicGF0aCI6Ii91Lzc3NTYyMTEifQ.OiJZl3rZy9X4UfRFhL9k21xO2tUR0SEM9_CeV6No-ik&v=4&size=128" width=64>](https://github.com/Maxim-Mazurok)

<!--- cspell:enable --->

<!--- @@inject-end: static/contributors.md --->

<!--- @@inject: static/footer.md --->

<br/>

---

<p align="center">Brought to you by<a href="https://streetsidesoftware.com" title="Street Side Software"><img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software</a></p>

<!--- @@inject-end: static/footer.md --->

<!---
cspell:ignore Houssem Dellai
--->
