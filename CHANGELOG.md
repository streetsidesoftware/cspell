# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.5.2](https://github.com/streetsidesoftware/cspell/compare/v5.5.1...v5.5.2) (2021-05-30)


### Bug Fixes

* Ignore hash links like `[abcdefa]` ([#1293](https://github.com/streetsidesoftware/cspell/issues/1293)) ([888e25d](https://github.com/streetsidesoftware/cspell/commit/888e25d48254cc57c9fb4f3c5a65d57dfffacff0))





## [5.5.1](https://github.com/streetsidesoftware/cspell/compare/v5.5.0...v5.5.1) (2021-05-29)


### Bug Fixes

* Update CHANGELOG.md ([#1291](https://github.com/streetsidesoftware/cspell/issues/1291)) ([7129c1b](https://github.com/streetsidesoftware/cspell/commit/7129c1bdaa107ae8990ecf8ca2120e82031f2c05))





# [5.5.0](https://github.com/streetsidesoftware/cspell/compare/v5.4.1...v5.5.0) (2021-05-29)


### Bug Fixes

* Fix Performance issue when checking long strings of non-words ([#1285](https://github.com/streetsidesoftware/cspell/issues/1285)) ([bdb43d6](https://github.com/streetsidesoftware/cspell/commit/bdb43d6947acb7c41fc04d73f3b9e1ba29097511))


### Features

* Remove incorrect Ignore Hex Digits Regexp ([#1277](https://github.com/streetsidesoftware/cspell/issues/1277)) ([2621eb0](https://github.com/streetsidesoftware/cspell/commit/2621eb02f487d9e466b4936bde8650c338b320b8)), closes [#1276](https://github.com/streetsidesoftware/cspell/issues/1276) [#1276](https://github.com/streetsidesoftware/cspell/issues/1276)





## [5.4.1](https://github.com/streetsidesoftware/cspell/compare/v5.4.0...v5.4.1) (2021-05-11)


### Bug Fixes

* correct how dictionaries are disabled ([#1229](https://github.com/streetsidesoftware/cspell/issues/1229)) ([60975ea](https://github.com/streetsidesoftware/cspell/commit/60975ea03ad11cc92d2841ca0baf0d60e3d39907)), closes [#1215](https://github.com/streetsidesoftware/cspell/issues/1215)





# [5.4.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.12...v5.4.0) (2021-05-05)


### Features

* Support `package.json` as a configuration location. ([#1178](https://github.com/streetsidesoftware/cspell/issues/1178)) ([2ce2410](https://github.com/streetsidesoftware/cspell/commit/2ce241052a5addc2240326f42abcfc909e618707))


### Reverts

* Revert "Revert "fix: Correctly handle leading and trailing single quote"" (#1203) ([1738993](https://github.com/streetsidesoftware/cspell/commit/17389939659ccc2148aef3779844e4f58ba7b966)), closes [#1203](https://github.com/streetsidesoftware/cspell/issues/1203)





## [5.3.12](https://github.com/streetsidesoftware/cspell/compare/v5.3.11...v5.3.12) (2021-04-06)


### Bug Fixes

* Update dictionaries ([#1136](https://github.com/streetsidesoftware/cspell/issues/1136)) ([64eba51](https://github.com/streetsidesoftware/cspell/commit/64eba51b75e0e2dde0568f46b4312c949b884a73))





## [5.3.11](https://github.com/streetsidesoftware/cspell/compare/v5.3.10...v5.3.11) (2021-04-03)


### Bug Fixes

* Fix command line exclusions ([#1119](https://github.com/streetsidesoftware/cspell/issues/1119)) ([c191fc5](https://github.com/streetsidesoftware/cspell/commit/c191fc5c4901059cddf1ea70479563bbf054c395))





## [5.3.10](https://github.com/streetsidesoftware/cspell/compare/v5.3.9...v5.3.10) (2021-04-02)


### Bug Fixes

* file globs listed on the command line override files in the config. ([#1117](https://github.com/streetsidesoftware/cspell/issues/1117)) ([25c501d](https://github.com/streetsidesoftware/cspell/commit/25c501d2267b8aca93624e0c4e036df5fdef7d20)), closes [#1115](https://github.com/streetsidesoftware/cspell/issues/1115)
* issue [#1114](https://github.com/streetsidesoftware/cspell/issues/1114) ([#1116](https://github.com/streetsidesoftware/cspell/issues/1116)) ([77ae68a](https://github.com/streetsidesoftware/cspell/commit/77ae68ae346dcf27f780d4139be57a234b7a1485))





## [5.3.9](https://github.com/streetsidesoftware/cspell/compare/v5.3.8...v5.3.9) (2021-03-19)


### Bug Fixes

* If the global config is not found, do not pretend it was. ([#1079](https://github.com/streetsidesoftware/cspell/issues/1079)) ([fb07679](https://github.com/streetsidesoftware/cspell/commit/fb07679c34e3f5669b54e91b53b4a3d5b5b50bab))





## [5.3.8](https://github.com/streetsidesoftware/cspell/compare/v5.3.7...v5.3.8) (2021-03-17)


### Bug Fixes

* export default configuration filenames ([#1070](https://github.com/streetsidesoftware/cspell/issues/1070)) ([8c3b65e](https://github.com/streetsidesoftware/cspell/commit/8c3b65e59a4156573cdf9bf8106d92689a9fa9bc))
* update schema generator ([#1074](https://github.com/streetsidesoftware/cspell/issues/1074)) ([528b7d0](https://github.com/streetsidesoftware/cspell/commit/528b7d0b67e1f947832de24e7b66c3d7dfd5fb7f))





## [5.3.7](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.3...v5.3.7) (2021-03-05)


### Bug Fixes

* build issue due to spelling ([#1041](https://github.com/streetsidesoftware/cspell/issues/1041)) ([11cb0c0](https://github.com/streetsidesoftware/cspell/commit/11cb0c0edfa5fcfdf2d07b1031d4c604d4960841))





## [5.3.7-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.2...v5.3.7-alpha.3) (2021-03-05)

**Note:** Version bump only for package cspell-monorepo





## [5.3.7-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.1...v5.3.7-alpha.2) (2021-03-05)

**Note:** Version bump only for package cspell-monorepo





## [5.3.7-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.0...v5.3.7-alpha.1) (2021-03-05)

**Note:** Version bump only for package cspell-monorepo





## [5.3.7-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.6...v5.3.7-alpha.0) (2021-03-05)

**Note:** Version bump only for package cspell-monorepo





## [5.3.6](https://github.com/streetsidesoftware/cspell/compare/v5.3.5...v5.3.6) (2021-03-05)


### Bug Fixes

* issue cause by commit d1a7fa7 ([#1040](https://github.com/streetsidesoftware/cspell/issues/1040)) ([da9ca51](https://github.com/streetsidesoftware/cspell/commit/da9ca512265a6f068d26a6b240e1a4699fca2ba7)), closes [/github.com/streetsidesoftware/cspell/commit/d1a7fa78759257d692598bf712254201ed0dd126#commitcomment-47719278](https://github.com//github.com/streetsidesoftware/cspell/commit/d1a7fa78759257d692598bf712254201ed0dd126/issues/commitcomment-47719278)





## [5.3.5](https://github.com/streetsidesoftware/cspell/compare/v5.3.4...v5.3.5) (2021-03-05)


### Bug Fixes

* adjust order in which files are loaded. ([#1037](https://github.com/streetsidesoftware/cspell/issues/1037)) ([84c7aa1](https://github.com/streetsidesoftware/cspell/commit/84c7aa11323f0453dedb3659550ef7976fb6c4f6))
* fix schema pattern for language IDs. ([#1034](https://github.com/streetsidesoftware/cspell/issues/1034)) ([591dde2](https://github.com/streetsidesoftware/cspell/commit/591dde2532a7698f41c5bf824ead226a7ae78cfe))
* make sure glob patterns match on windows ([#1039](https://github.com/streetsidesoftware/cspell/issues/1039)) ([1e58e4c](https://github.com/streetsidesoftware/cspell/commit/1e58e4c0c1fb706fc61fb82512d6fe92ad0b58fc))





## [5.3.4](https://github.com/streetsidesoftware/cspell/compare/v5.3.3...v5.3.4) (2021-03-01)


### Bug Fixes

* Adjust the way glob roots are calculated ([d1a7fa7](https://github.com/streetsidesoftware/cspell/commit/d1a7fa78759257d692598bf712254201ed0dd126))





## [5.3.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.2...v5.3.3) (2021-02-26)


### Bug Fixes

* Report the root cause of a dictionary error. ([#1014](https://github.com/streetsidesoftware/cspell/issues/1014)) ([8c1debd](https://github.com/streetsidesoftware/cspell/commit/8c1debde5de8c040b0110644e9b45f60d42bafc3))





## [5.3.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.1...v5.3.2) (2021-02-26)


### Bug Fixes

* do not check binary files and add Ada dictionary ([#1011](https://github.com/streetsidesoftware/cspell/issues/1011)) ([af04ead](https://github.com/streetsidesoftware/cspell/commit/af04ead1dcd517b5de813a24d4d17424971a5606))





## [5.3.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.0...v5.3.1) (2021-02-25)


### Bug Fixes

* Make sure relative globRoot is resolved correctly. ([#1004](https://github.com/streetsidesoftware/cspell/issues/1004)) ([29977c4](https://github.com/streetsidesoftware/cspell/commit/29977c466935948f092527e0300bb0a310394cdc))
* make sure to export all needed cspell types. ([#1006](https://github.com/streetsidesoftware/cspell/issues/1006)) ([c625479](https://github.com/streetsidesoftware/cspell/commit/c625479be185f287e297a1dcddbcfa2aa24b0d0d))





# [5.3.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.4...v5.3.0) (2021-02-25)

**Note:** Version bump only for package cspell-monorepo





# [5.3.0-alpha.4](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.3...v5.3.0-alpha.4) (2021-02-25)


### Bug Fixes

* [#1000](https://github.com/streetsidesoftware/cspell/issues/1000) ([#1002](https://github.com/streetsidesoftware/cspell/issues/1002)) ([d82a4a2](https://github.com/streetsidesoftware/cspell/commit/d82a4a2921fd70a790d8b0839e6be6f342501c26))
* be able to report on glob source. ([#1001](https://github.com/streetsidesoftware/cspell/issues/1001)) ([1020d56](https://github.com/streetsidesoftware/cspell/commit/1020d56ba04e8418d162d4bde8e4948546a8f7d2))





# [5.3.0-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.2...v5.3.0-alpha.3) (2021-02-23)


### Bug Fixes

* Improve reporting on files matching glob patterns. ([#994](https://github.com/streetsidesoftware/cspell/issues/994)) ([da991f9](https://github.com/streetsidesoftware/cspell/commit/da991f93a061c5b64ce437332c7107ef2ef89472))





# [5.3.0-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.1...v5.3.0-alpha.2) (2021-02-22)


### Bug Fixes

* Add schema support for `enableFiletypes`. ([#979](https://github.com/streetsidesoftware/cspell/issues/979)) ([d18706e](https://github.com/streetsidesoftware/cspell/commit/d18706e3ffd7a6446396d339b85a753b4ae451e0))
* Add support for custom dictionaries ([#982](https://github.com/streetsidesoftware/cspell/issues/982)) ([196921d](https://github.com/streetsidesoftware/cspell/commit/196921dc635dce7cfdd5b6c300af54beeebde91a))





# [5.3.0-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.0...v5.3.0-alpha.1) (2021-02-19)


### Bug Fixes

* Display suggestions -- regression ([#976](https://github.com/streetsidesoftware/cspell/issues/976)) ([e3970c7](https://github.com/streetsidesoftware/cspell/commit/e3970c7fa4932ab0a610fcb9c0907b45ffa7f0df))
* Fix schema generation to use `deprecatedMessage` ([#972](https://github.com/streetsidesoftware/cspell/issues/972)) ([492dca9](https://github.com/streetsidesoftware/cspell/commit/492dca91466773bdf247fdb87f93d64914d5e3e1))





# [5.3.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.2.4...v5.3.0-alpha.0) (2021-02-18)


### Bug Fixes

* Working towards a standard way to spell check files. ([#900](https://github.com/streetsidesoftware/cspell/issues/900)) ([5d38b2a](https://github.com/streetsidesoftware/cspell/commit/5d38b2a6c918fc9c8cfb2040cc49c9675c4c4b8a))


### Features

* Be able to specify files to spell check within the config. ([#948](https://github.com/streetsidesoftware/cspell/issues/948)) ([23f7a48](https://github.com/streetsidesoftware/cspell/commit/23f7a488ef500fb1df5cd234c7d3c2ab4ec02961)), closes [#571](https://github.com/streetsidesoftware/cspell/issues/571)
* cspell-glob matches only files under the root ([#913](https://github.com/streetsidesoftware/cspell/issues/913)) ([a2d700d](https://github.com/streetsidesoftware/cspell/commit/a2d700dfaf3f762aad5d13d56c3918afca7be458))
* Part 1 - glob patterns are relative to the config file. ([#921](https://github.com/streetsidesoftware/cspell/issues/921)) ([a250448](https://github.com/streetsidesoftware/cspell/commit/a2504484ec38f15804cc0a203317266f83566b7c))
* Support local configuration files ([#966](https://github.com/streetsidesoftware/cspell/issues/966)) ([0ccc5fe](https://github.com/streetsidesoftware/cspell/commit/0ccc5fe9eb70ca3a4c6e5a3fc0b653465e76983c))
* Support negation matches in languageSettings for languageIds ([#967](https://github.com/streetsidesoftware/cspell/issues/967)) ([cea9114](https://github.com/streetsidesoftware/cspell/commit/cea9114249feb718e4497681c520e1de2c985dc2))





## [5.2.4](https://github.com/streetsidesoftware/cspell/compare/v5.2.3...v5.2.4) (2021-01-28)

**Note:** Version bump only for package cspell-monorepo





## [5.2.3](https://github.com/streetsidesoftware/cspell/compare/v5.2.2...v5.2.3) (2021-01-27)


### Bug Fixes

* support `cspell.config.js` and remove support for `cspell.js` ([#895](https://github.com/streetsidesoftware/cspell/issues/895)) ([6fbb4b2](https://github.com/streetsidesoftware/cspell/commit/6fbb4b29e7b0f84258b33e90788df9c9fb298fd3))





## [5.2.2](https://github.com/streetsidesoftware/cspell/compare/v5.2.1...v5.2.2) (2021-01-26)

**Note:** Version bump only for package cspell-monorepo





## [5.2.1](https://github.com/streetsidesoftware/cspell/compare/v5.2.0...v5.2.1) (2021-01-23)


### Bug Fixes

* make sure version and help do not exit with non-zero code. ([#883](https://github.com/streetsidesoftware/cspell/issues/883)) ([b8e91f3](https://github.com/streetsidesoftware/cspell/commit/b8e91f35e2cdebc14dda9b73de1dd31183f5d91d)), closes [#880](https://github.com/streetsidesoftware/cspell/issues/880)





# [5.2.0](https://github.com/streetsidesoftware/cspell/compare/v5.1.3...v5.2.0) (2021-01-23)


### Bug Fixes

* Improve suggestions for short words ([#872](https://github.com/streetsidesoftware/cspell/issues/872)) ([9c62d04](https://github.com/streetsidesoftware/cspell/commit/9c62d04fd987f807e9a20ba5326b578bce854d16)), closes [#753](https://github.com/streetsidesoftware/cspell/issues/753)


### Features

* Add options --show-context and --relative ([#878](https://github.com/streetsidesoftware/cspell/issues/878)) ([1fddaac](https://github.com/streetsidesoftware/cspell/commit/1fddaac4d80f8a28e12677e0953e8443116c24c2))
* improve word splitting options ([#846](https://github.com/streetsidesoftware/cspell/issues/846)) ([b4dc108](https://github.com/streetsidesoftware/cspell/commit/b4dc108a7409c72f7862fe8f08b9f6f7458db9d3))
* support .yaml and .js configuration files ([#875](https://github.com/streetsidesoftware/cspell/issues/875)) ([4a07acc](https://github.com/streetsidesoftware/cspell/commit/4a07acc507f3106e1f09805b8ee019ea200ae08f))
* support displaying suggestions ([#881](https://github.com/streetsidesoftware/cspell/issues/881)) ([e3f207f](https://github.com/streetsidesoftware/cspell/commit/e3f207f802231cc7915015d2c2924e08745e4f8e))





## [5.1.3](https://github.com/streetsidesoftware/cspell/compare/v5.1.2...v5.1.3) (2021-01-05)


### Bug Fixes

* Support dictionaries having words with numbers. ([#828](https://github.com/streetsidesoftware/cspell/issues/828)) ([856f04a](https://github.com/streetsidesoftware/cspell/commit/856f04a3bec45088ec7d79dd089fe0c80e517d5e))





## [5.1.2](https://github.com/streetsidesoftware/cspell/compare/v5.1.1...v5.1.2) (2020-12-31)

**Note:** Version bump only for package cspell-monorepo





## [5.1.1](https://github.com/streetsidesoftware/cspell/compare/v5.1.0...v5.1.1) (2020-12-28)


### Bug Fixes

* remove dependency upon `@types/glob` ([#810](https://github.com/streetsidesoftware/cspell/issues/810)) ([03fab52](https://github.com/streetsidesoftware/cspell/commit/03fab5288d971ced4c49da6765194653d8f73f96))





# [5.1.0](https://github.com/streetsidesoftware/cspell/compare/v5.0.8...v5.1.0) (2020-12-27)


### Bug Fixes

* Improve speed of testing for email ([#779](https://github.com/streetsidesoftware/cspell/issues/779)) ([be1329d](https://github.com/streetsidesoftware/cspell/commit/be1329da818ff9658399a1765cc40cda5ddd927d))


### Features

* improve spell checking speed and allow multiple exclude arguments ([#806](https://github.com/streetsidesoftware/cspell/issues/806)) ([7a4c8f8](https://github.com/streetsidesoftware/cspell/commit/7a4c8f8d968aba520122ad94feb21096e8190898))





## [5.0.8](https://github.com/streetsidesoftware/cspell/compare/v5.0.7...v5.0.8) (2020-12-17)


### Bug Fixes

* Docs and minor edits ([#757](https://github.com/streetsidesoftware/cspell/issues/757)) ([e5f4567](https://github.com/streetsidesoftware/cspell/commit/e5f4567f25a90ee52105e50c99c7ad90cfb9fdb0))
* issue with importing cspell ([ff32d0c](https://github.com/streetsidesoftware/cspell/commit/ff32d0cab987026e13d131961667e10b6cd83831))





## [5.0.7](https://github.com/streetsidesoftware/cspell/compare/v5.0.6...v5.0.7) (2020-12-16)

**Note:** Version bump only for package cspell-monorepo





## [5.0.6](https://github.com/streetsidesoftware/cspell/compare/v5.0.5...v5.0.6) (2020-12-15)


### Bug Fixes

* missing cspell-default.json file ([#752](https://github.com/streetsidesoftware/cspell/issues/752)) ([e13b2e0](https://github.com/streetsidesoftware/cspell/commit/e13b2e0212b50e9278710c67a044a56c368f4f42))





## [5.0.5](https://github.com/streetsidesoftware/cspell/compare/v5.0.4...v5.0.5) (2020-12-15)

**Note:** Version bump only for package cspell-monorepo





## [5.0.4](https://github.com/streetsidesoftware/cspell/compare/v5.0.3...v5.0.4) (2020-12-15)

**Note:** Version bump only for package cspell-monorepo





## [5.0.3](https://github.com/streetsidesoftware/cspell/compare/v5.0.2...v5.0.3) (2020-12-04)


### Bug Fixes

* cleanup folder for cspell-glob ([#698](https://github.com/streetsidesoftware/cspell/issues/698)) ([7081eb5](https://github.com/streetsidesoftware/cspell/commit/7081eb5e68f27b4596ae1423ff67888c315daa3e))
* Expose Emitter types ([#718](https://github.com/streetsidesoftware/cspell/issues/718)) ([3ef9030](https://github.com/streetsidesoftware/cspell/commit/3ef903097de0819025ba74eb9bf978eb1f57fc12))
* improve resolve search logic ([#697](https://github.com/streetsidesoftware/cspell/issues/697)) ([75be89b](https://github.com/streetsidesoftware/cspell/commit/75be89b17bb0f5515db1eafbda04c3a35f70aadd))
* use node resolver by default ([#695](https://github.com/streetsidesoftware/cspell/issues/695)) ([0d95869](https://github.com/streetsidesoftware/cspell/commit/0d958692741d5d06f888bfe2d400f399b32988f4))





## [5.0.2](https://github.com/streetsidesoftware/cspell/compare/v5.0.2-alpha.1...v5.0.2) (2020-11-26)

**Note:** Version bump only for package cspell-monorepo





## [5.0.1](https://github.com/streetsidesoftware/cspell/compare/v5.0.1-alpha.15...v5.0.1) (2020-11-20)


### Bug Fixes

* make sure the error code is correctly set ([#619](https://github.com/streetsidesoftware/cspell/issues/619)) ([09e358c](https://github.com/streetsidesoftware/cspell/commit/09e358c3b7d3c485df92d7d9c5a652cf6a85f635))





## [5.0.1-alpha.15](https://github.com/streetsidesoftware/cspell/compare/v5.0.1-alpha.14...v5.0.1-alpha.15) (2020-11-18)


### Bug Fixes

* force new version ([3ab08ab](https://github.com/streetsidesoftware/cspell/commit/3ab08ab5ae1939d934b2f0fb23d33defc60c1a7f))





## 5.0.1-alpha.14 (2020-11-17)

**Note:** Version bump only for package cspell-monorepo

<!---
cspell: ignore abcdefa
--->
