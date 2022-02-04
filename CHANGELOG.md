# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.18.3](https://github.com/streetsidesoftware/cspell/compare/v5.18.2...v5.18.3) (2022-02-04)


### Bug Fixes

* Add support for R ([#2394](https://github.com/streetsidesoftware/cspell/issues/2394)) ([6888d48](https://github.com/streetsidesoftware/cspell/commit/6888d482748051a795418116e09ae27ce41c474c))
* Improve cli summary and progress ([#2396](https://github.com/streetsidesoftware/cspell/issues/2396)) ([d52d68a](https://github.com/streetsidesoftware/cspell/commit/d52d68aeaf9ef301bcc1b1862867efb639ba061d))
* Upgrade to commend-json 4.2.2 ([#2399](https://github.com/streetsidesoftware/cspell/issues/2399)) ([e5f643e](https://github.com/streetsidesoftware/cspell/commit/e5f643ef026ed4175132b012ab26035638d650e9))





## [5.18.2](https://github.com/streetsidesoftware/cspell/compare/v5.18.1...v5.18.2) (2022-02-03)


### Bug Fixes

* fix suggestion output ([#2390](https://github.com/streetsidesoftware/cspell/issues/2390)) ([bda442d](https://github.com/streetsidesoftware/cspell/commit/bda442de1e529df15f0890c03d11907d4b0b86a1))


### Reverts

* Revert "ci: Workflow Bot -- Update ALL Dependencies (#2388)" (#2391) ([7f093f9](https://github.com/streetsidesoftware/cspell/commit/7f093f9429cb7b755392996d54449f29f46f138a)), closes [#2388](https://github.com/streetsidesoftware/cspell/issues/2388) [#2391](https://github.com/streetsidesoftware/cspell/issues/2391)





## [5.18.1](https://github.com/streetsidesoftware/cspell/compare/v5.18.0...v5.18.1) (2022-02-03)


### Bug Fixes

* Ensure Weighted Suggestions are generated ([#2384](https://github.com/streetsidesoftware/cspell/issues/2384)) ([7e72b91](https://github.com/streetsidesoftware/cspell/commit/7e72b918584148afe0e0fd917aa38f99f606898c))
* Fix first letter insert costs on suggestions. ([#2385](https://github.com/streetsidesoftware/cspell/issues/2385)) ([e5b7ed5](https://github.com/streetsidesoftware/cspell/commit/e5b7ed5fdb9cc6ddbc51e342dbf01970e6af2101))
* Improve suggestions when using weights. ([#2387](https://github.com/streetsidesoftware/cspell/issues/2387)) ([c9d070d](https://github.com/streetsidesoftware/cspell/commit/c9d070d86a7f021f22428b2da56a98f185c3a128))
* Make sure cspell-tool-cli keeps accents ([#2381](https://github.com/streetsidesoftware/cspell/issues/2381)) ([f6f17d0](https://github.com/streetsidesoftware/cspell/commit/f6f17d0ddd382e339c64817d499dd5ba1ed72a41))
* Update publish script to clean first ([60811f0](https://github.com/streetsidesoftware/cspell/commit/60811f010d8fc511b10098d44d5085b9793c7a49))
* Upgrade to commander 9.0.0 ([#2367](https://github.com/streetsidesoftware/cspell/issues/2367)) ([f255b70](https://github.com/streetsidesoftware/cspell/commit/f255b70b30da3002aaba477df3fa6f5ca2b90752))





# [5.18.0](https://github.com/streetsidesoftware/cspell/compare/v5.18.0-alpha.0...v5.18.0) (2022-01-31)

**Note:** Version bump only for package cspell-monorepo





# [5.18.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.17.0...v5.18.0-alpha.0) (2022-01-30)


### Bug Fixes

* Show an error if a glob starts/ends with a single quote ([#2357](https://github.com/streetsidesoftware/cspell/issues/2357)) ([924200e](https://github.com/streetsidesoftware/cspell/commit/924200e9329503cebdbac5e2b8aafffec815d978)), closes [#2350](https://github.com/streetsidesoftware/cspell/issues/2350)
* Speed up dictionaries from ([#2363](https://github.com/streetsidesoftware/cspell/issues/2363)) ([76c41ad](https://github.com/streetsidesoftware/cspell/commit/76c41ad0de3db4d695427f3e84016113532c2b3b))
* Speed up spell checking with large config files. ([#2362](https://github.com/streetsidesoftware/cspell/issues/2362)) ([41c061c](https://github.com/streetsidesoftware/cspell/commit/41c061c7b703a1483e84beb80d0e098a52676a47))


### Features

* Enable support to dictionary alphabet and accents. ([#2355](https://github.com/streetsidesoftware/cspell/issues/2355)) ([b33453b](https://github.com/streetsidesoftware/cspell/commit/b33453b2c49b1753a2fcd593d8415c92d37a02f9))





# [5.17.0](https://github.com/streetsidesoftware/cspell/compare/v5.17.0-alpha.0...v5.17.0) (2022-01-26)


### Bug Fixes

* do not depend upon @types/glob in exports. ([#2346](https://github.com/streetsidesoftware/cspell/issues/2346)) ([7740f55](https://github.com/streetsidesoftware/cspell/commit/7740f5554bf756687bb708585fd1b6c6b7b85211))





# [5.17.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.16.0...v5.17.0-alpha.0) (2022-01-26)


### Bug Fixes

* (cspell-glob) Make sure `cwd` can be set. ([#2316](https://github.com/streetsidesoftware/cspell/issues/2316)) ([80087ac](https://github.com/streetsidesoftware/cspell/commit/80087ac1028d5c34d20274f6d4d2889e485664be))
* (cspell) Mark forbidden and no suggest words ([#2302](https://github.com/streetsidesoftware/cspell/issues/2302)) ([c474cec](https://github.com/streetsidesoftware/cspell/commit/c474cec8e2983979c36b13ee1d33c334f027667f))
* add `--fail-fast` to cspell README.md ([#2340](https://github.com/streetsidesoftware/cspell/issues/2340)) ([5554ecb](https://github.com/streetsidesoftware/cspell/commit/5554ecbcdee4c25998b327918f9461c266558ce0))
* Explicitly import `types` ([#2343](https://github.com/streetsidesoftware/cspell/issues/2343)) ([7131001](https://github.com/streetsidesoftware/cspell/commit/71310012c63b7f77e8276e96f0885e8f7eec7e39)), closes [#2341](https://github.com/streetsidesoftware/cspell/issues/2341)
* Make sure `${cwd}/` works in globs. ([#2315](https://github.com/streetsidesoftware/cspell/issues/2315)) ([2dbe93e](https://github.com/streetsidesoftware/cspell/commit/2dbe93e32119425b0190e388b4a6017f6b71702f))
* Move `suggestionEditCosts` into `dictionaryInformation` ([#2296](https://github.com/streetsidesoftware/cspell/issues/2296)) ([021e781](https://github.com/streetsidesoftware/cspell/commit/021e7819c8b53e6f6b91b92723f581e4641eb224))


### Features

* add `--fail-fast` cli option ([#2338](https://github.com/streetsidesoftware/cspell/issues/2338)) ([7c17c22](https://github.com/streetsidesoftware/cspell/commit/7c17c226f8037f7d90cf64277f1ff8e1815e1750)), closes [#2294](https://github.com/streetsidesoftware/cspell/issues/2294)
* Add `failFast` config option to exit as soon as an issue encountered ([#2307](https://github.com/streetsidesoftware/cspell/issues/2307)) ([26dd25a](https://github.com/streetsidesoftware/cspell/commit/26dd25af41ea6a15e98f82b1853e942e333085c0))
* Add cli command to show suggestions. ([#2299](https://github.com/streetsidesoftware/cspell/issues/2299)) ([1db4777](https://github.com/streetsidesoftware/cspell/commit/1db47775e7903a9b5838bdc5b49229258f5e683b))
* Support REPL style reading from stdin  ([#2342](https://github.com/streetsidesoftware/cspell/issues/2342)) ([78bf751](https://github.com/streetsidesoftware/cspell/commit/78bf751930dff94320326e97b91fea2a39edc6e1)), closes [#2294](https://github.com/streetsidesoftware/cspell/issues/2294)
* Support using `stdin` for trace. ([#2300](https://github.com/streetsidesoftware/cspell/issues/2300)) ([7967ffe](https://github.com/streetsidesoftware/cspell/commit/7967ffec9f2dbbed0bf73eb8f2e648e9f67a7f95))





# [5.16.0](https://github.com/streetsidesoftware/cspell/compare/v5.15.3...v5.16.0) (2022-01-20)


### Bug Fixes

* Add ability to discourage certain types of suggestions. ([#2291](https://github.com/streetsidesoftware/cspell/issues/2291)) ([a6e1bf6](https://github.com/streetsidesoftware/cspell/commit/a6e1bf6b903ff4ff6f5f9dfaaf50f1f9505bb5a0))





## [5.15.3](https://github.com/streetsidesoftware/cspell/compare/v5.15.2...v5.15.3) (2022-01-20)


### Bug Fixes

* Handle missing files when spell checking from a file list. ([#2286](https://github.com/streetsidesoftware/cspell/issues/2286)) ([fd1e7e2](https://github.com/streetsidesoftware/cspell/commit/fd1e7e24492864318cc19229f44e18f6beff668f)), closes [#2285](https://github.com/streetsidesoftware/cspell/issues/2285)
* Implement Weighted Distance Algorithm ([#2255](https://github.com/streetsidesoftware/cspell/issues/2255)) ([3a4f9db](https://github.com/streetsidesoftware/cspell/commit/3a4f9db8d0137a606cc350f0278b93d7d8c35e36))
* Lock in `typedoc` till it is fixed. ([#2277](https://github.com/streetsidesoftware/cspell/issues/2277)) ([417fe32](https://github.com/streetsidesoftware/cspell/commit/417fe320234baf3ee6939f35830a47b62c15f6d3))





## [5.15.2](https://github.com/streetsidesoftware/cspell/compare/v5.15.1...v5.15.2) (2022-01-11)


### Bug Fixes

* Fix backwards compatibility for Reporters ([#2229](https://github.com/streetsidesoftware/cspell/issues/2229)) ([38d17b2](https://github.com/streetsidesoftware/cspell/commit/38d17b299a974d4a93e505d42987f1fb1d62fcf8))
* Fix issue with `maxDuplicateProblems` setting ([#2237](https://github.com/streetsidesoftware/cspell/issues/2237)) ([fbb3593](https://github.com/streetsidesoftware/cspell/commit/fbb35933af895e9d61a4dfd9e231f8276bd5442c))





## [5.15.1](https://github.com/streetsidesoftware/cspell/compare/v5.15.0...v5.15.1) (2022-01-07)


### Bug Fixes

* Fix type for some older TypeScript parsers. ([#2191](https://github.com/streetsidesoftware/cspell/issues/2191)) ([b195499](https://github.com/streetsidesoftware/cspell/commit/b195499d9511eb5b513f7f13d3e850f32b7e27a6))





# [5.15.0](https://github.com/streetsidesoftware/cspell/compare/v5.14.0...v5.15.0) (2022-01-07)


### Bug Fixes

* Invalidate cache when config has changed ([#2160](https://github.com/streetsidesoftware/cspell/issues/2160)) ([705c638](https://github.com/streetsidesoftware/cspell/commit/705c638bb305ab448e04d231d03a4310561eb6d1))
* make config file version `0.2` by default. ([#2186](https://github.com/streetsidesoftware/cspell/issues/2186)) ([ed8af60](https://github.com/streetsidesoftware/cspell/commit/ed8af604a6a71de5707fbb324e2c248d2f08ccf0))
* Update dictionaries ([#2173](https://github.com/streetsidesoftware/cspell/issues/2173)) ([d82aeb6](https://github.com/streetsidesoftware/cspell/commit/d82aeb62d3b486621222970bc606ae885694000f))


### Features

* Add support for cache options in config files. ([#2184](https://github.com/streetsidesoftware/cspell/issues/2184)) ([7256919](https://github.com/streetsidesoftware/cspell/commit/7256919ea4c4d8a924e21906f602fb160e2f96c9))
* Remove 40 character limit on spell checking words ([#2175](https://github.com/streetsidesoftware/cspell/issues/2175)) ([5769a0e](https://github.com/streetsidesoftware/cspell/commit/5769a0e9dbab5f68633e57345271c741cd611dad))





# [5.14.0](https://github.com/streetsidesoftware/cspell/compare/v5.14.0-alpha.0...v5.14.0) (2021-12-29)

**Note:** Version bump only for package cspell-monorepo





# [5.14.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.13.4...v5.14.0-alpha.0) (2021-12-29)


### Bug Fixes

* [#2077](https://github.com/streetsidesoftware/cspell/issues/2077) ([#2114](https://github.com/streetsidesoftware/cspell/issues/2114)) ([a3336b4](https://github.com/streetsidesoftware/cspell/commit/a3336b44a494d89a2708b172c6b9a8ec7ff73841))
* Make sure help is not shown if the file list is empty. ([#2150](https://github.com/streetsidesoftware/cspell/issues/2150)) ([67c975a](https://github.com/streetsidesoftware/cspell/commit/67c975a8c87bb5265edb73cda194de057f4d3aef))
* Upgrade HTML dictionary ([#2131](https://github.com/streetsidesoftware/cspell/issues/2131)) ([874ac37](https://github.com/streetsidesoftware/cspell/commit/874ac37ba84d8637d203de4faf77f4496d313b6a))


### Features

* Support `--file-list` cli option ([#2130](https://github.com/streetsidesoftware/cspell/issues/2130)) ([eef7b92](https://github.com/streetsidesoftware/cspell/commit/eef7b92a36750cdb1d22c4e44fe900f1f81f0a81)), closes [#1850](https://github.com/streetsidesoftware/cspell/issues/1850)





## [5.13.4](https://github.com/streetsidesoftware/cspell/compare/v5.13.3...v5.13.4) (2021-12-18)


### Bug Fixes

* hunspell - honor minimum compound word length ([#2091](https://github.com/streetsidesoftware/cspell/issues/2091)) ([c67f7b8](https://github.com/streetsidesoftware/cspell/commit/c67f7b8bdac872eee544a7f1787ba09e79d59de2))


### Features

* report error and fail for unsupported NodeJS versions ([#1984](https://github.com/streetsidesoftware/cspell/issues/1984)) ([#2111](https://github.com/streetsidesoftware/cspell/issues/2111)) ([52bb33e](https://github.com/streetsidesoftware/cspell/commit/52bb33ea7114a179e931203423a328e5508fd037))





## [5.13.3](https://github.com/streetsidesoftware/cspell/compare/v5.13.2...v5.13.3) (2021-12-11)


### Bug Fixes

* cspell-tools - limit memory usage when build dictionaries ([#2087](https://github.com/streetsidesoftware/cspell/issues/2087)) ([591860e](https://github.com/streetsidesoftware/cspell/commit/591860ec93737f943a0f76d615cdce4b25344457))
* Hunspell make sure COMPOUNDFLAG is supported ([#2088](https://github.com/streetsidesoftware/cspell/issues/2088)) ([3bd772e](https://github.com/streetsidesoftware/cspell/commit/3bd772e827edfd0aa1bdabc5d7f21e2ec29f84b7))





## [5.13.2](https://github.com/streetsidesoftware/cspell/compare/v5.13.1...v5.13.2) (2021-12-07)


### Bug Fixes

* jest/expect-expect warning ([#2062](https://github.com/streetsidesoftware/cspell/issues/2062)) ([7366b54](https://github.com/streetsidesoftware/cspell/commit/7366b54b83ecfe3f8bdb60fddd14c5b04bbf7fad))
* make cspell aware of PureScript and Dhall ([#2067](https://github.com/streetsidesoftware/cspell/issues/2067)) ([53c8457](https://github.com/streetsidesoftware/cspell/commit/53c8457627963afd52b90ee021f17d2c4b9b7d05))
* Update TypeScript extensions ([#2051](https://github.com/streetsidesoftware/cspell/issues/2051)) ([6a97177](https://github.com/streetsidesoftware/cspell/commit/6a9717702005e2790686d7884d78a3447544846b))





## [5.13.1](https://github.com/streetsidesoftware/cspell/compare/v5.13.0...v5.13.1) (2021-11-24)


### Bug Fixes

* fix [#2011](https://github.com/streetsidesoftware/cspell/issues/2011) ([#2013](https://github.com/streetsidesoftware/cspell/issues/2013)) ([15abecb](https://github.com/streetsidesoftware/cspell/commit/15abecba58bf940f6fe49852363649dde6f86beb))





# [5.13.0](https://github.com/streetsidesoftware/cspell/compare/v5.12.6...v5.13.0) (2021-11-17)


### Bug Fixes

* Add `enableCaseSensitive`/`disableCaseSensitive` ([#1951](https://github.com/streetsidesoftware/cspell/issues/1951)) ([93387b7](https://github.com/streetsidesoftware/cspell/commit/93387b7df3e83ac9d7b05df8e35167a0c0c35065))
* integration - turn off case sensitivity for German ([#1952](https://github.com/streetsidesoftware/cspell/issues/1952)) ([2465964](https://github.com/streetsidesoftware/cspell/commit/2465964ec0241984dfbab9705c58c1bea2263d10))


### Features

* Support `--dot` command line option. ([#1985](https://github.com/streetsidesoftware/cspell/issues/1985)) ([fa1aa11](https://github.com/streetsidesoftware/cspell/commit/fa1aa116f0cc7468cbcf38320deba3bd0b62cc9c))





## [5.12.6](https://github.com/streetsidesoftware/cspell/compare/v5.12.5...v5.12.6) (2021-11-04)


### Bug Fixes

* Include configuration for VUE and Swift by default. ([#1946](https://github.com/streetsidesoftware/cspell/issues/1946)) ([b57e86d](https://github.com/streetsidesoftware/cspell/commit/b57e86dfa620eab5f488b7dad9106865e1a4bcf2))





## [5.12.5](https://github.com/streetsidesoftware/cspell/compare/v5.12.4...v5.12.5) (2021-11-02)


### Bug Fixes

* Add trace options ([#1939](https://github.com/streetsidesoftware/cspell/issues/1939)) ([191fc52](https://github.com/streetsidesoftware/cspell/commit/191fc52361d3f68d10be169b86d76359c848bf90))
* Fix reading dictionary test to use `path` ([#1938](https://github.com/streetsidesoftware/cspell/issues/1938)) ([fa4ea3f](https://github.com/streetsidesoftware/cspell/commit/fa4ea3f0a379c5175fe3e930e1915f4521295583))
* Make sure flaggedWords are always checked. ([#1935](https://github.com/streetsidesoftware/cspell/issues/1935)) ([dfbfddd](https://github.com/streetsidesoftware/cspell/commit/dfbfddd04337854425320a2a25836dacdb7ecc99)), closes [#1895](https://github.com/streetsidesoftware/cspell/issues/1895)
* prevent suggesting word break characters ([#1933](https://github.com/streetsidesoftware/cspell/issues/1933)) ([42ffb98](https://github.com/streetsidesoftware/cspell/commit/42ffb984b593e7d1651db7999474749e00028e48))





## [5.12.4](https://github.com/streetsidesoftware/cspell/compare/v5.12.3...v5.12.4) (2021-10-31)


### Bug Fixes

* adjust the AWS integration test to match repo changes. ([#1912](https://github.com/streetsidesoftware/cspell/issues/1912)) ([5918f32](https://github.com/streetsidesoftware/cspell/commit/5918f324999cceef6f935a0a7b994a3a9f216147))
* Change `--wordsOnly` option to `--words-only` ([#1928](https://github.com/streetsidesoftware/cspell/issues/1928)) ([aac621f](https://github.com/streetsidesoftware/cspell/commit/aac621f46b6f1f60185e33cd06d9aab06438bf8f))
* In Document settings. ([#1925](https://github.com/streetsidesoftware/cspell/issues/1925)) ([01c12ce](https://github.com/streetsidesoftware/cspell/commit/01c12ce4113516527abfa0ef9b7fa7a883c18520)), closes [#1628](https://github.com/streetsidesoftware/cspell/issues/1628) [#1629](https://github.com/streetsidesoftware/cspell/issues/1629)
* Remove unnecessary dependency ([#1929](https://github.com/streetsidesoftware/cspell/issues/1929)) ([8bc7b1c](https://github.com/streetsidesoftware/cspell/commit/8bc7b1cc801afe50cbe765af183d187fe2bb6dd9))
* Update software terms ([#1909](https://github.com/streetsidesoftware/cspell/issues/1909)) ([b9c8263](https://github.com/streetsidesoftware/cspell/commit/b9c8263f90afd1a4d961ac7227b0699c64b54333))
* Update software terms and integration snapshots. ([#1916](https://github.com/streetsidesoftware/cspell/issues/1916)) ([0248330](https://github.com/streetsidesoftware/cspell/commit/0248330d0bf25e563bebba64333942bc04ca0275))





## [5.12.3](https://github.com/streetsidesoftware/cspell/compare/v5.12.2...v5.12.3) (2021-10-08)


### Bug Fixes

* Fix `.gitignore` glob matching ([#1847](https://github.com/streetsidesoftware/cspell/issues/1847)) ([d36449b](https://github.com/streetsidesoftware/cspell/commit/d36449b125c9f02556f2306164dd32d32392bed8)), closes [#1846](https://github.com/streetsidesoftware/cspell/issues/1846)
* Use the repository root by default when no root is specified. ([#1851](https://github.com/streetsidesoftware/cspell/issues/1851)) ([81d005e](https://github.com/streetsidesoftware/cspell/commit/81d005e17774ea0163b1fc3ff83afe253624fce6)), closes [#1846](https://github.com/streetsidesoftware/cspell/issues/1846)





## [5.12.2](https://github.com/streetsidesoftware/cspell/compare/v5.12.1...v5.12.2) (2021-10-06)

**Note:** Version bump only for package cspell-monorepo





## [5.12.1](https://github.com/streetsidesoftware/cspell/compare/v5.12.0...v5.12.1) (2021-10-06)


### Bug Fixes

* fix [#1807](https://github.com/streetsidesoftware/cspell/issues/1807) ([#1837](https://github.com/streetsidesoftware/cspell/issues/1837)) ([9608b77](https://github.com/streetsidesoftware/cspell/commit/9608b772f0ee09e55de66b8dc4dcb868ab4d7d32))





# [5.12.0](https://github.com/streetsidesoftware/cspell/compare/v5.12.0-alpha.0...v5.12.0) (2021-10-05)

**Note:** Version bump only for package cspell-monorepo





# [5.12.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.11.1...v5.12.0-alpha.0) (2021-10-05)


### Bug Fixes

* fix home page reference. ([#1817](https://github.com/streetsidesoftware/cspell/issues/1817)) ([b074603](https://github.com/streetsidesoftware/cspell/commit/b07460342e8b8821e458285255d19272de0f6bf9))
* support `--no-gitignore` option ([#1833](https://github.com/streetsidesoftware/cspell/issues/1833)) ([0b89fed](https://github.com/streetsidesoftware/cspell/commit/0b89fedc515c4ee237ea5404db791f6663332716))
* Update gitignore README and normalize roots ([#1832](https://github.com/streetsidesoftware/cspell/issues/1832)) ([b9df331](https://github.com/streetsidesoftware/cspell/commit/b9df33148ce016b7003a784945ed5f83023b5903))


### Features

* Add support for `.gitignore` ([#1823](https://github.com/streetsidesoftware/cspell/issues/1823)) ([9b0dfe4](https://github.com/streetsidesoftware/cspell/commit/9b0dfe4e50f6b8210d16f9a63ae47949c706c462))





## [5.11.1](https://github.com/streetsidesoftware/cspell/compare/v5.11.0...v5.11.1) (2021-09-29)


### Bug Fixes

* Move `[@types](https://github.com/types)` dependencies to dev ([#1811](https://github.com/streetsidesoftware/cspell/issues/1811)) ([c29fdcb](https://github.com/streetsidesoftware/cspell/commit/c29fdcb8dc5f5d2766a9dd139bd428e532739b3c))





# [5.11.0](https://github.com/streetsidesoftware/cspell/compare/v5.11.0-alpha.0...v5.11.0) (2021-09-28)

**Note:** Version bump only for package cspell-monorepo





# [5.11.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.10.1...v5.11.0-alpha.0) (2021-09-28)


### Bug Fixes

* Allow config file version to be a number. ([#1730](https://github.com/streetsidesoftware/cspell/issues/1730)) ([9fa2eee](https://github.com/streetsidesoftware/cspell/commit/9fa2eeeb8fcd206b26a75a24fdfcf9014d79be52)), closes [#1729](https://github.com/streetsidesoftware/cspell/issues/1729)
* Display filenames instead of URI's ([#1773](https://github.com/streetsidesoftware/cspell/issues/1773)) ([5a9542e](https://github.com/streetsidesoftware/cspell/commit/5a9542e1818ff68e89edc9a5c968741ad1b8751f))
* Ensure cli-reporter displays the correct message. ([#1774](https://github.com/streetsidesoftware/cspell/issues/1774)) ([c0aaf45](https://github.com/streetsidesoftware/cspell/commit/c0aaf45ea1f147fda3514149a85d2c2bd70a749f))
* Improve Patterns and RegExp handling ([#1743](https://github.com/streetsidesoftware/cspell/issues/1743)) ([100866e](https://github.com/streetsidesoftware/cspell/commit/100866e9afbd0c7f5200b44f11f74dc50edfae44)), closes [#1699](https://github.com/streetsidesoftware/cspell/issues/1699)
* make sure `issue.uri` is actually a URI. ([#1746](https://github.com/streetsidesoftware/cspell/issues/1746)) ([4268057](https://github.com/streetsidesoftware/cspell/commit/4268057c772db4242dde033c69a4448c26739863))
* Patterns - only add `u` if no flags are given ([#1745](https://github.com/streetsidesoftware/cspell/issues/1745)) ([a75c370](https://github.com/streetsidesoftware/cspell/commit/a75c370a2ffa5a166f856a915e4dcae625df271e)), closes [#1699](https://github.com/streetsidesoftware/cspell/issues/1699)
* Reduce the cost of regexp exclusions ([#1800](https://github.com/streetsidesoftware/cspell/issues/1800)) ([4544c25](https://github.com/streetsidesoftware/cspell/commit/4544c2529faf76945d2d030ae15475573dcf41a6)), closes [#1775](https://github.com/streetsidesoftware/cspell/issues/1775)
* Update Python dictionary ([#1778](https://github.com/streetsidesoftware/cspell/issues/1778)) ([6359145](https://github.com/streetsidesoftware/cspell/commit/6359145a7e5776bc4698ed447cb2d07aee20f1de))


### Features

* add --cache option to lint only changed files ([#1763](https://github.com/streetsidesoftware/cspell/issues/1763)) ([4bdfd09](https://github.com/streetsidesoftware/cspell/commit/4bdfd09677e7b744f79f4e35675760e7083d68e7))


### Reverts

* Revert "ci: Disable Coveralls - their API has been down for a couple of days. (#1731)" (#1732) ([102ef73](https://github.com/streetsidesoftware/cspell/commit/102ef730a8061dadc7d5d54463c6dd0b416a4ca9)), closes [#1731](https://github.com/streetsidesoftware/cspell/issues/1731) [#1732](https://github.com/streetsidesoftware/cspell/issues/1732)





## [5.10.1](https://github.com/streetsidesoftware/cspell/compare/v5.10.0...v5.10.1) (2021-09-17)


### Bug Fixes

* Use process directly instead of importing it. ([#1714](https://github.com/streetsidesoftware/cspell/issues/1714)) ([db18a52](https://github.com/streetsidesoftware/cspell/commit/db18a52fbd290077ccb1a5c002bf85be891a13fc)), closes [#1704](https://github.com/streetsidesoftware/cspell/issues/1704)





# [5.10.0](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.6...v5.10.0) (2021-09-17)


### Bug Fixes

* Roll back update to `@cspell/dict-en-gb@2` ([#1712](https://github.com/streetsidesoftware/cspell/issues/1712)) ([edb1814](https://github.com/streetsidesoftware/cspell/commit/edb18141b5aea8c5fc09221b79340c8e8ab46a74))





# [5.10.0-alpha.6](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.5...v5.10.0-alpha.6) (2021-09-17)


### Bug Fixes

* Make dict-en-gb version 2 optional because of license. ([#1710](https://github.com/streetsidesoftware/cspell/issues/1710)) ([046a704](https://github.com/streetsidesoftware/cspell/commit/046a704e7c5f4a45c065d33d815faa2e464e08c9))





# [5.10.0-alpha.5](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.4...v5.10.0-alpha.5) (2021-09-16)

**Note:** Version bump only for package cspell-monorepo





# [5.10.0-alpha.4](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.3...v5.10.0-alpha.4) (2021-09-16)

**Note:** Version bump only for package cspell-monorepo





# [5.10.0-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.2...v5.10.0-alpha.3) (2021-09-16)


### Bug Fixes

* Fix accidental promise returned by reporters. ([#1702](https://github.com/streetsidesoftware/cspell/issues/1702)) ([8c125c2](https://github.com/streetsidesoftware/cspell/commit/8c125c2b2f671bfb6c97b06ecc138a7f7dc8bb84))
* Fix strange spelling of Custom ([4a93456](https://github.com/streetsidesoftware/cspell/commit/4a934568584036fa77461adf575946d1e1366d89))





# [5.10.0-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.0...v5.10.0-alpha.2) (2021-09-13)

**Note:** Version bump only for package cspell-monorepo





# [5.10.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.1...v5.10.0-alpha.0) (2021-09-13)


### Bug Fixes

* Delete .pre-commit-hooks.yaml ([#1686](https://github.com/streetsidesoftware/cspell/issues/1686)) ([cc58b45](https://github.com/streetsidesoftware/cspell/commit/cc58b455961e83fc4c286c66731f697708385eb8))


### Features

* Custom reporters support ([#1643](https://github.com/streetsidesoftware/cspell/issues/1643)) ([3b9ac1b](https://github.com/streetsidesoftware/cspell/commit/3b9ac1b50972527288aa076970f657546a3ad551))





## [5.9.1](https://github.com/streetsidesoftware/cspell/compare/v5.9.1-alpha.1...v5.9.1) (2021-09-12)


### Reverts

* Revert "test: fix github-actions (#1665)" (#1666) ([baaeab6](https://github.com/streetsidesoftware/cspell/commit/baaeab6a50f4f6973231e4ae61aa8bc6b2f59b15)), closes [#1665](https://github.com/streetsidesoftware/cspell/issues/1665) [#1666](https://github.com/streetsidesoftware/cspell/issues/1666)





## [5.9.1-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.9.1-alpha.0...v5.9.1-alpha.1) (2021-09-12)


### Reverts

* Revert "enable incremental typescript builds (#1671)" ([65664b2](https://github.com/streetsidesoftware/cspell/commit/65664b213e67a4108a2d38692f8fbd471b00afb7)), closes [#1671](https://github.com/streetsidesoftware/cspell/issues/1671)





## [5.9.1-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.0...v5.9.1-alpha.0) (2021-09-11)


### Bug Fixes

* Change the suggestions to not include ties by default. ([#1678](https://github.com/streetsidesoftware/cspell/issues/1678)) ([0efbd58](https://github.com/streetsidesoftware/cspell/commit/0efbd5847ca433799c81b8cc4a227da4925d4dbf))
* drop need for iconv-lite and iterable-to-stream ([#1677](https://github.com/streetsidesoftware/cspell/issues/1677)) ([c7ffcc7](https://github.com/streetsidesoftware/cspell/commit/c7ffcc786ed360fc1a59f84915ea7d204d51d3a5))
* Fix suggestions when working with case aware dictionaries. ([#1674](https://github.com/streetsidesoftware/cspell/issues/1674)) ([0ba056d](https://github.com/streetsidesoftware/cspell/commit/0ba056d55f778e0b732137d56a9b7c555e9ae966))
* Fix version number reference ([#1640](https://github.com/streetsidesoftware/cspell/issues/1640)) ([1c18b36](https://github.com/streetsidesoftware/cspell/commit/1c18b366382d6044e633e41bda99f3d180e36d3c)), closes [#1638](https://github.com/streetsidesoftware/cspell/issues/1638)
* Perf - Try improving suggestion performance. ([#1639](https://github.com/streetsidesoftware/cspell/issues/1639)) ([aad4352](https://github.com/streetsidesoftware/cspell/commit/aad43524f502507f87fb6687d30d9684f2253c32))
* sample more often to make sure the suggest stops on time. ([#1669](https://github.com/streetsidesoftware/cspell/issues/1669)) ([2bb6c82](https://github.com/streetsidesoftware/cspell/commit/2bb6c82abed296313fe551fc9767ea12f0f0f359))
* Support Suggestion timeouts ([#1668](https://github.com/streetsidesoftware/cspell/issues/1668)) ([1698aaf](https://github.com/streetsidesoftware/cspell/commit/1698aaf25a07a5f4fb1eb0de46b56a8cae49e2c0))
* Upgrade British English dictionary to v2. ([#1633](https://github.com/streetsidesoftware/cspell/issues/1633)) ([907d3eb](https://github.com/streetsidesoftware/cspell/commit/907d3eb76bf9b065a56565141d07f03970d6dda4))





# [5.9.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.0-alpha.0...v5.9.0) (2021-08-31)

**Note:** Version bump only for package cspell-monorepo





# [5.9.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.8.2...v5.9.0-alpha.0) (2021-08-31)


### Bug Fixes

* Update packages and fix schema lint issue. ([#1591](https://github.com/streetsidesoftware/cspell/issues/1591)) ([f849ecb](https://github.com/streetsidesoftware/cspell/commit/f849ecb26eee1daa77b12c79a0af2d71eadff241))


### Features

* Upgrade to the newest, (case sensitive), English dictionary ([#1545](https://github.com/streetsidesoftware/cspell/issues/1545)) ([581fc4d](https://github.com/streetsidesoftware/cspell/commit/581fc4d8ce0c18df779670cb6a41899d3b9c4e48))





## [5.8.2](https://github.com/streetsidesoftware/cspell/compare/v5.8.1...v5.8.2) (2021-08-25)


### Bug Fixes

* fix issue where some dictionaries (nl-nl) could cause slow suggestions ([#1583](https://github.com/streetsidesoftware/cspell/issues/1583)) ([8c8d0ee](https://github.com/streetsidesoftware/cspell/commit/8c8d0eeea3e2003792f67c234b5d562be7f3f5c7))





## [5.8.1](https://github.com/streetsidesoftware/cspell/compare/v5.8.0...v5.8.1) (2021-08-24)


### Bug Fixes

* Fix some minor issues ([#1562](https://github.com/streetsidesoftware/cspell/issues/1562)) ([8512920](https://github.com/streetsidesoftware/cspell/commit/851292088a6681d72165f6a498c854abcaef5d3e))
* fix wrapping issue in `trace` command with compound words. ([#1574](https://github.com/streetsidesoftware/cspell/issues/1574)) ([e6ebda8](https://github.com/streetsidesoftware/cspell/commit/e6ebda86a11aaea06b3d04611426579ac0e87c41))





# [5.8.0](https://github.com/streetsidesoftware/cspell/compare/v5.7.2...v5.8.0) (2021-08-21)


### Bug Fixes

* clean up find results ([#1550](https://github.com/streetsidesoftware/cspell/issues/1550)) ([80cb6a3](https://github.com/streetsidesoftware/cspell/commit/80cb6a32122b2395d06814a9dead6f95d2ab057b))
* fix allowCompoundWords find in case aware dictionaries. ([#1549](https://github.com/streetsidesoftware/cspell/issues/1549)) ([769de0b](https://github.com/streetsidesoftware/cspell/commit/769de0ba3f256018612f7539523e0f1cbd28d726))


### Features

* Add support for `noSuggest` dictionaries. ([#1554](https://github.com/streetsidesoftware/cspell/issues/1554)) ([f0ccda5](https://github.com/streetsidesoftware/cspell/commit/f0ccda5abec9c236eb5387bcf6a6349f31cb81b7))
* Improve `trace` words command results. ([#1558](https://github.com/streetsidesoftware/cspell/issues/1558)) ([ed8a5dc](https://github.com/streetsidesoftware/cspell/commit/ed8a5dc17ffa6de901887d3bd5b6bacf67217866))





## [5.7.2](https://github.com/streetsidesoftware/cspell/compare/v5.7.1...v5.7.2) (2021-08-16)


### Bug Fixes

* Add software licenses dictionary ([#1523](https://github.com/streetsidesoftware/cspell/issues/1523)) ([43910d5](https://github.com/streetsidesoftware/cspell/commit/43910d526b97402239b0ad38aef74cd8add1b749))
* Detect when module default is used with `cspell.config.js` files. ([#1529](https://github.com/streetsidesoftware/cspell/issues/1529)) ([e05aeff](https://github.com/streetsidesoftware/cspell/commit/e05aeffaa398366f4b6ce4c10728df8d2fa1860f))
* Update `cspell` README.md ([#1530](https://github.com/streetsidesoftware/cspell/issues/1530)) ([9c0dfd6](https://github.com/streetsidesoftware/cspell/commit/9c0dfd61ba3236f5fee9b113c36a089d2ca11000))





## [5.7.1](https://github.com/streetsidesoftware/cspell/compare/v5.7.0...v5.7.1) (2021-08-14)


### Bug Fixes

* do not return forbidden words in suggestions ([#1519](https://github.com/streetsidesoftware/cspell/issues/1519)) ([a9936d6](https://github.com/streetsidesoftware/cspell/commit/a9936d6b473a6e198fd58a2e3f38c4de52321b45))
* Make sure hyphenated words work in ignoreWords ([#1520](https://github.com/streetsidesoftware/cspell/issues/1520)) ([81a86c7](https://github.com/streetsidesoftware/cspell/commit/81a86c7e9e34c5196114d2ba127059734b6fb53f)), closes [#1497](https://github.com/streetsidesoftware/cspell/issues/1497)





# [5.7.0](https://github.com/streetsidesoftware/cspell/compare/v5.7.0-alpha.0...v5.7.0) (2021-08-14)

**Note:** Version bump only for package cspell-monorepo





# [5.7.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.6.7...v5.7.0-alpha.0) (2021-08-14)


## Features

* Support forbidden words in dictionaries ([#1516](https://github.com/streetsidesoftware/cspell/issues/1516)) ([8d7596b](https://github.com/streetsidesoftware/cspell/commit/8d7596b004100dd296e1058659e39eefc56c6f56))

## Making Words Forbidden

There are several ways to mark a word as forbidden:

1. In a custom word list with words beginning with `!`.
    ```
    !forbiddenWord
    ```
2. In `words` section of `cspell` configuration:
    ```
    "words": [
        "!forbiddenWord",
        "configstore"
    ],
    ```
3. In `flagWords` section of `cspell` configuration:
    ```
    "flagWords": ["forbiddenWord"]
    ```

### Overriding Forbidden words
Sometimes it is necessary to allow a word even if it is forbidden.

#### In a comment

```js
/**
 * Do not mark `forbiddenWord` as incorrect.
 * cspell:ignore forbiddenWord
 */
```

#### In the `cspell` configuration

```jsonc
{
    "ignoreWords": ["forbiddenWord"]
}
```


## [5.6.7](https://github.com/streetsidesoftware/cspell/compare/v5.6.6...v5.6.7) (2021-08-13)


### Bug Fixes

* error output when configstore dir not accessible. ([#1512](https://github.com/streetsidesoftware/cspell/issues/1512)) ([68a63d1](https://github.com/streetsidesoftware/cspell/commit/68a63d16215b551a9fa32ac5ef1cd8e12cb26ec5)), closes [#1510](https://github.com/streetsidesoftware/cspell/issues/1510)
* Fix issue with suggestions. ([#1507](https://github.com/streetsidesoftware/cspell/issues/1507)) ([6a44e26](https://github.com/streetsidesoftware/cspell/commit/6a44e26ba37af882f6330d054df9c05ec8f9b0d9))
* ignore TrueTypeFont files ([#1445](https://github.com/streetsidesoftware/cspell/issues/1445)) ([336c77f](https://github.com/streetsidesoftware/cspell/commit/336c77fbc4eab882cc8d1720ffc5ef514a05d2e6))


### Reverts

* Revert "build(deps): bump codecov/codecov-action from 1.5.2 to 2.0.1 (#1438)" (#1446) ([cbffbb8](https://github.com/streetsidesoftware/cspell/commit/cbffbb827b4d47e4ba9ca8bbe5d5ac2c2af75f45)), closes [#1438](https://github.com/streetsidesoftware/cspell/issues/1438) [#1446](https://github.com/streetsidesoftware/cspell/issues/1446)





## [5.6.6](https://github.com/streetsidesoftware/cspell/compare/v5.6.5...v5.6.6) (2021-06-18)


### Bug Fixes

* publishing issue with cspell-bundled-dicts ([8a43bc5](https://github.com/streetsidesoftware/cspell/commit/8a43bc5fa494b27d3ed2e4ab4f1d516b80225961))





## [5.6.5](https://github.com/streetsidesoftware/cspell/compare/v5.6.4...v5.6.5) (2021-06-18)


### Bug Fixes

* fix regression related to trailing accents missing in legacy dicts ([#1345](https://github.com/streetsidesoftware/cspell/issues/1345)) ([b8d8810](https://github.com/streetsidesoftware/cspell/commit/b8d8810fafb585a4ffc77f3cb350888d9a6a52ed))





## [5.6.4](https://github.com/streetsidesoftware/cspell/compare/v5.6.3...v5.6.4) (2021-06-15)


### Bug Fixes

* [#1336](https://github.com/streetsidesoftware/cspell/issues/1336) ([#1342](https://github.com/streetsidesoftware/cspell/issues/1342)) ([7a0b278](https://github.com/streetsidesoftware/cspell/commit/7a0b278f5d96c163b901afeb3ef08f55af609dda))
* early out on checking binary files. ([#1337](https://github.com/streetsidesoftware/cspell/issues/1337)) ([a948808](https://github.com/streetsidesoftware/cspell/commit/a9488080daf99ed992ac55e450d522a78e5708d7))
* Fix issue with missing suggestions ([#1339](https://github.com/streetsidesoftware/cspell/issues/1339)) ([cfecde8](https://github.com/streetsidesoftware/cspell/commit/cfecde85b80d70063aa647d0f6837c879a938ce1))





## [5.6.3](https://github.com/streetsidesoftware/cspell/compare/v5.6.2...v5.6.3) (2021-06-11)


### Bug Fixes

* fix issue with legacy dictionaries that do not have some accents ([5a9aa27](https://github.com/streetsidesoftware/cspell/commit/5a9aa27decba013299111a66a89da18c7123b321))
* make sure cspell-tools does not collide with old version. ([00e360c](https://github.com/streetsidesoftware/cspell/commit/00e360c03fe81d398944dd13a36e1fffac57250e))
* support case sensitive document checking. ([527de4a](https://github.com/streetsidesoftware/cspell/commit/527de4a80dd281526783404127d23a0b7a51ec52))





## [5.6.2](https://github.com/streetsidesoftware/cspell/compare/v5.6.1...v5.6.2) (2021-06-10)


### Bug Fixes

* *minor breaking* fix issues with accents and the word splitter ([#1330](https://github.com/streetsidesoftware/cspell/issues/1330)) ([845c314](https://github.com/streetsidesoftware/cspell/commit/845c3146efa8d4cce7bfdfbf76627ced298ac8b7))





## [5.6.1](https://github.com/streetsidesoftware/cspell/compare/v5.6.0...v5.6.1) (2021-06-09)


### Bug Fixes

* Fix issues with accent characters ([#1322](https://github.com/streetsidesoftware/cspell/issues/1322)) ([4d65dfb](https://github.com/streetsidesoftware/cspell/commit/4d65dfbc3c0091450de2d6023b41c623faf763f0)), closes [#1321](https://github.com/streetsidesoftware/cspell/issues/1321)
* Use a dictionary for ignoreWords to be consistent with `words` ([#1326](https://github.com/streetsidesoftware/cspell/issues/1326)) ([ee3897d](https://github.com/streetsidesoftware/cspell/commit/ee3897d62dcc5f5af177141734015ad9a9dcddff))





# [5.6.0](https://github.com/streetsidesoftware/cspell/compare/v5.5.2...v5.6.0) (2021-06-05)


### Features

* support `.pnp.js` when loading configurations. ([#1307](https://github.com/streetsidesoftware/cspell/issues/1307)) ([76da68c](https://github.com/streetsidesoftware/cspell/commit/76da68cf6a13586598689d01bce3a24bc255530a))





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
cspell: ignore abcdefa Dhall
--->
