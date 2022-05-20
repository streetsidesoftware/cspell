# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.21.1](https://github.com/streetsidesoftware/cspell/compare/v5.21.0...v5.21.1) (2022-05-20)

**Note:** Version bump only for package cspell





# [5.21.0](https://github.com/streetsidesoftware/cspell/compare/v5.20.0...v5.21.0) (2022-05-17)


### Features

* Upgrade `go` dictionary ([#2792](https://github.com/streetsidesoftware/cspell/issues/2792)) ([778b8fe](https://github.com/streetsidesoftware/cspell/commit/778b8fe7dd1cecf0546a6affadef78435e88a1aa))





# [5.20.0](https://github.com/streetsidesoftware/cspell/compare/v5.19.7...v5.20.0) (2022-05-02)


### Bug Fixes

* Roll back glob to 7.2.0 to fix Windows ([#2706](https://github.com/streetsidesoftware/cspell/issues/2706)) ([b42bbdd](https://github.com/streetsidesoftware/cspell/commit/b42bbdd28cbd8aefa28ce363b335fad781c37acf))
* Update to glob 8 ([#2707](https://github.com/streetsidesoftware/cspell/issues/2707)) ([07567cd](https://github.com/streetsidesoftware/cspell/commit/07567cd709e084b585255db8689e0758e504a4fc)), closes [#2706](https://github.com/streetsidesoftware/cspell/issues/2706)


### Features

* Upgrade python dictionary ([#2763](https://github.com/streetsidesoftware/cspell/issues/2763)) ([2a86f54](https://github.com/streetsidesoftware/cspell/commit/2a86f549cb4baed97b39e35b1a78eeedcd948c32))





## [5.19.7](https://github.com/streetsidesoftware/cspell/compare/v5.19.6...v5.19.7) (2022-04-09)


### Bug Fixes

* Ignore directories when checking files ([#2680](https://github.com/streetsidesoftware/cspell/issues/2680)) ([fa777f0](https://github.com/streetsidesoftware/cspell/commit/fa777f04981b8814b827721eaa8b9278ae95effb))





## [5.19.6](https://github.com/streetsidesoftware/cspell/compare/v5.19.5...v5.19.6) (2022-04-08)


### Bug Fixes

* add --cache-reset option ([#2677](https://github.com/streetsidesoftware/cspell/issues/2677)) ([631073b](https://github.com/streetsidesoftware/cspell/commit/631073b42f24dec00eed9740cb8ee2e5bce4b07f))
* fix issue with stale cache entries ([#2673](https://github.com/streetsidesoftware/cspell/issues/2673)) ([15995a8](https://github.com/streetsidesoftware/cspell/commit/15995a898cf4284e33e5a48fd4cfa9ef0d329d6e))
* relative path name ([#2675](https://github.com/streetsidesoftware/cspell/issues/2675)) ([51fc55b](https://github.com/streetsidesoftware/cspell/commit/51fc55b72374b46d5fdf165d5ed1ac3b6bf9f1d6))





## [5.19.5](https://github.com/streetsidesoftware/cspell/compare/v5.19.4...v5.19.5) (2022-04-01)


### Bug Fixes

* Be able to disable the default configuration ([#2643](https://github.com/streetsidesoftware/cspell/issues/2643)) ([46c1e4f](https://github.com/streetsidesoftware/cspell/commit/46c1e4f6047477cc35e6c154431e8e2cdaacb3b5))





## [5.19.4](https://github.com/streetsidesoftware/cspell/compare/v5.19.3...v5.19.4) (2022-04-01)


### Bug Fixes

* Performance - only serialize config if in debug mode ([#2640](https://github.com/streetsidesoftware/cspell/issues/2640)) ([d16c4f9](https://github.com/streetsidesoftware/cspell/commit/d16c4f975a612f6906399e8801a7e1d49074a8f0))





## [5.19.3](https://github.com/streetsidesoftware/cspell/compare/v5.19.2...v5.19.3) (2022-03-24)


### Bug Fixes

* Invalidate the cache if cspell version has changed. ([#2580](https://github.com/streetsidesoftware/cspell/issues/2580)) ([2174928](https://github.com/streetsidesoftware/cspell/commit/21749287a169d41db0d4c63d5069561f33259f26))





## [5.19.2](https://github.com/streetsidesoftware/cspell/compare/v5.19.1...v5.19.2) (2022-03-14)

**Note:** Version bump only for package cspell





## [5.19.1](https://github.com/streetsidesoftware/cspell/compare/v5.19.0...v5.19.1) (2022-03-13)

**Note:** Version bump only for package cspell





# [5.19.0](https://github.com/streetsidesoftware/cspell/compare/v5.18.5...v5.19.0) (2022-03-12)

**Note:** Version bump only for package cspell





## [5.18.5](https://github.com/streetsidesoftware/cspell/compare/v5.18.4...v5.18.5) (2022-02-15)


### Bug Fixes

* Add dart language support ([#2444](https://github.com/streetsidesoftware/cspell/issues/2444)) ([bbcf793](https://github.com/streetsidesoftware/cspell/commit/bbcf7938eb5c6cfab3893bd967e43f368472ac27))
* Make it easier to work with RTL languages. ([#2410](https://github.com/streetsidesoftware/cspell/issues/2410)) ([91b035f](https://github.com/streetsidesoftware/cspell/commit/91b035f719baf3c21d3a8b9d92419234ec37b500))





## [5.18.4](https://github.com/streetsidesoftware/cspell/compare/v5.18.3...v5.18.4) (2022-02-07)


### Bug Fixes

* Add simple repl feature to suggestions. ([#2403](https://github.com/streetsidesoftware/cspell/issues/2403)) ([f9835b7](https://github.com/streetsidesoftware/cspell/commit/f9835b7d38a288793b789f4858c06d8812be4906))
* Improve speed of suggestions for long words. ([#2406](https://github.com/streetsidesoftware/cspell/issues/2406)) ([6c76907](https://github.com/streetsidesoftware/cspell/commit/6c769079257e45877c4ee5ba5139351878037ab0))





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

* Improve suggestions when using weights. ([#2387](https://github.com/streetsidesoftware/cspell/issues/2387)) ([c9d070d](https://github.com/streetsidesoftware/cspell/commit/c9d070d86a7f021f22428b2da56a98f185c3a128))
* Upgrade to commander 9.0.0 ([#2367](https://github.com/streetsidesoftware/cspell/issues/2367)) ([f255b70](https://github.com/streetsidesoftware/cspell/commit/f255b70b30da3002aaba477df3fa6f5ca2b90752))





# [5.18.0](https://github.com/streetsidesoftware/cspell/compare/v5.18.0-alpha.0...v5.18.0) (2022-01-31)

**Note:** Version bump only for package cspell





# [5.18.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.17.0...v5.18.0-alpha.0) (2022-01-30)


### Bug Fixes

* Show an error if a glob starts/ends with a single quote ([#2357](https://github.com/streetsidesoftware/cspell/issues/2357)) ([924200e](https://github.com/streetsidesoftware/cspell/commit/924200e9329503cebdbac5e2b8aafffec815d978)), closes [#2350](https://github.com/streetsidesoftware/cspell/issues/2350)





# [5.17.0](https://github.com/streetsidesoftware/cspell/compare/v5.17.0-alpha.0...v5.17.0) (2022-01-26)


### Bug Fixes

* do not depend upon @types/glob in exports. ([#2346](https://github.com/streetsidesoftware/cspell/issues/2346)) ([7740f55](https://github.com/streetsidesoftware/cspell/commit/7740f5554bf756687bb708585fd1b6c6b7b85211))





# [5.17.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.16.0...v5.17.0-alpha.0) (2022-01-26)


### Bug Fixes

* (cspell) Mark forbidden and no suggest words ([#2302](https://github.com/streetsidesoftware/cspell/issues/2302)) ([c474cec](https://github.com/streetsidesoftware/cspell/commit/c474cec8e2983979c36b13ee1d33c334f027667f))
* add `--fail-fast` to cspell README.md ([#2340](https://github.com/streetsidesoftware/cspell/issues/2340)) ([5554ecb](https://github.com/streetsidesoftware/cspell/commit/5554ecbcdee4c25998b327918f9461c266558ce0))


### Features

* add `--fail-fast` cli option ([#2338](https://github.com/streetsidesoftware/cspell/issues/2338)) ([7c17c22](https://github.com/streetsidesoftware/cspell/commit/7c17c226f8037f7d90cf64277f1ff8e1815e1750)), closes [#2294](https://github.com/streetsidesoftware/cspell/issues/2294)
* Add `failFast` config option to exit as soon as an issue encountered ([#2307](https://github.com/streetsidesoftware/cspell/issues/2307)) ([26dd25a](https://github.com/streetsidesoftware/cspell/commit/26dd25af41ea6a15e98f82b1853e942e333085c0))
* Add cli command to show suggestions. ([#2299](https://github.com/streetsidesoftware/cspell/issues/2299)) ([1db4777](https://github.com/streetsidesoftware/cspell/commit/1db47775e7903a9b5838bdc5b49229258f5e683b))
* Support REPL style reading from stdin  ([#2342](https://github.com/streetsidesoftware/cspell/issues/2342)) ([78bf751](https://github.com/streetsidesoftware/cspell/commit/78bf751930dff94320326e97b91fea2a39edc6e1)), closes [#2294](https://github.com/streetsidesoftware/cspell/issues/2294)
* Support using `stdin` for trace. ([#2300](https://github.com/streetsidesoftware/cspell/issues/2300)) ([7967ffe](https://github.com/streetsidesoftware/cspell/commit/7967ffec9f2dbbed0bf73eb8f2e648e9f67a7f95))





# [5.16.0](https://github.com/streetsidesoftware/cspell/compare/v5.15.3...v5.16.0) (2022-01-20)

**Note:** Version bump only for package cspell





## [5.15.3](https://github.com/streetsidesoftware/cspell/compare/v5.15.2...v5.15.3) (2022-01-20)


### Bug Fixes

* Handle missing files when spell checking from a file list. ([#2286](https://github.com/streetsidesoftware/cspell/issues/2286)) ([fd1e7e2](https://github.com/streetsidesoftware/cspell/commit/fd1e7e24492864318cc19229f44e18f6beff668f)), closes [#2285](https://github.com/streetsidesoftware/cspell/issues/2285)





## [5.15.2](https://github.com/streetsidesoftware/cspell/compare/v5.15.1...v5.15.2) (2022-01-11)


### Bug Fixes

* Fix backwards compatibility for Reporters ([#2229](https://github.com/streetsidesoftware/cspell/issues/2229)) ([38d17b2](https://github.com/streetsidesoftware/cspell/commit/38d17b299a974d4a93e505d42987f1fb1d62fcf8))





## [5.15.1](https://github.com/streetsidesoftware/cspell/compare/v5.15.0...v5.15.1) (2022-01-07)

**Note:** Version bump only for package cspell





# [5.15.0](https://github.com/streetsidesoftware/cspell/compare/v5.14.0...v5.15.0) (2022-01-07)


### Bug Fixes

* Invalidate cache when config has changed ([#2160](https://github.com/streetsidesoftware/cspell/issues/2160)) ([705c638](https://github.com/streetsidesoftware/cspell/commit/705c638bb305ab448e04d231d03a4310561eb6d1))


### Features

* Add support for cache options in config files. ([#2184](https://github.com/streetsidesoftware/cspell/issues/2184)) ([7256919](https://github.com/streetsidesoftware/cspell/commit/7256919ea4c4d8a924e21906f602fb160e2f96c9))





# [5.14.0](https://github.com/streetsidesoftware/cspell/compare/v5.14.0-alpha.0...v5.14.0) (2021-12-29)

**Note:** Version bump only for package cspell





# [5.14.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.13.4...v5.14.0-alpha.0) (2021-12-29)


### Bug Fixes

* Make sure help is not shown if the file list is empty. ([#2150](https://github.com/streetsidesoftware/cspell/issues/2150)) ([67c975a](https://github.com/streetsidesoftware/cspell/commit/67c975a8c87bb5265edb73cda194de057f4d3aef))


### Features

* Support `--file-list` cli option ([#2130](https://github.com/streetsidesoftware/cspell/issues/2130)) ([eef7b92](https://github.com/streetsidesoftware/cspell/commit/eef7b92a36750cdb1d22c4e44fe900f1f81f0a81)), closes [#1850](https://github.com/streetsidesoftware/cspell/issues/1850)





## [5.13.4](https://github.com/streetsidesoftware/cspell/compare/v5.13.3...v5.13.4) (2021-12-18)


### Features

* report error and fail for unsupported NodeJS versions ([#1984](https://github.com/streetsidesoftware/cspell/issues/1984)) ([#2111](https://github.com/streetsidesoftware/cspell/issues/2111)) ([52bb33e](https://github.com/streetsidesoftware/cspell/commit/52bb33ea7114a179e931203423a328e5508fd037))





## [5.13.3](https://github.com/streetsidesoftware/cspell/compare/v5.13.2...v5.13.3) (2021-12-11)

**Note:** Version bump only for package cspell





## [5.13.2](https://github.com/streetsidesoftware/cspell/compare/v5.13.1...v5.13.2) (2021-12-07)

**Note:** Version bump only for package cspell





## [5.13.1](https://github.com/streetsidesoftware/cspell/compare/v5.13.0...v5.13.1) (2021-11-24)


### Bug Fixes

* fix [#2011](https://github.com/streetsidesoftware/cspell/issues/2011) ([#2013](https://github.com/streetsidesoftware/cspell/issues/2013)) ([15abecb](https://github.com/streetsidesoftware/cspell/commit/15abecba58bf940f6fe49852363649dde6f86beb))





# [5.13.0](https://github.com/streetsidesoftware/cspell/compare/v5.12.6...v5.13.0) (2021-11-17)


### Features

* Support `--dot` command line option. ([#1985](https://github.com/streetsidesoftware/cspell/issues/1985)) ([fa1aa11](https://github.com/streetsidesoftware/cspell/commit/fa1aa116f0cc7468cbcf38320deba3bd0b62cc9c))





## [5.12.6](https://github.com/streetsidesoftware/cspell/compare/v5.12.5...v5.12.6) (2021-11-04)

**Note:** Version bump only for package cspell





## [5.12.5](https://github.com/streetsidesoftware/cspell/compare/v5.12.4...v5.12.5) (2021-11-02)


### Bug Fixes

* Add trace options ([#1939](https://github.com/streetsidesoftware/cspell/issues/1939)) ([191fc52](https://github.com/streetsidesoftware/cspell/commit/191fc52361d3f68d10be169b86d76359c848bf90))
* Fix reading dictionary test to use `path` ([#1938](https://github.com/streetsidesoftware/cspell/issues/1938)) ([fa4ea3f](https://github.com/streetsidesoftware/cspell/commit/fa4ea3f0a379c5175fe3e930e1915f4521295583))





## [5.12.4](https://github.com/streetsidesoftware/cspell/compare/v5.12.3...v5.12.4) (2021-10-31)


### Bug Fixes

* Change `--wordsOnly` option to `--words-only` ([#1928](https://github.com/streetsidesoftware/cspell/issues/1928)) ([aac621f](https://github.com/streetsidesoftware/cspell/commit/aac621f46b6f1f60185e33cd06d9aab06438bf8f))





## [5.12.3](https://github.com/streetsidesoftware/cspell/compare/v5.12.2...v5.12.3) (2021-10-08)


### Bug Fixes

* Fix `.gitignore` glob matching ([#1847](https://github.com/streetsidesoftware/cspell/issues/1847)) ([d36449b](https://github.com/streetsidesoftware/cspell/commit/d36449b125c9f02556f2306164dd32d32392bed8)), closes [#1846](https://github.com/streetsidesoftware/cspell/issues/1846)
* Use the repository root by default when no root is specified. ([#1851](https://github.com/streetsidesoftware/cspell/issues/1851)) ([81d005e](https://github.com/streetsidesoftware/cspell/commit/81d005e17774ea0163b1fc3ff83afe253624fce6)), closes [#1846](https://github.com/streetsidesoftware/cspell/issues/1846)





## [5.12.2](https://github.com/streetsidesoftware/cspell/compare/v5.12.1...v5.12.2) (2021-10-06)

**Note:** Version bump only for package cspell





## [5.12.1](https://github.com/streetsidesoftware/cspell/compare/v5.12.0...v5.12.1) (2021-10-06)


### Bug Fixes

* fix [#1807](https://github.com/streetsidesoftware/cspell/issues/1807) ([#1837](https://github.com/streetsidesoftware/cspell/issues/1837)) ([9608b77](https://github.com/streetsidesoftware/cspell/commit/9608b772f0ee09e55de66b8dc4dcb868ab4d7d32))





# [5.12.0](https://github.com/streetsidesoftware/cspell/compare/v5.12.0-alpha.0...v5.12.0) (2021-10-05)

**Note:** Version bump only for package cspell





# [5.12.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.11.1...v5.12.0-alpha.0) (2021-10-05)


### Bug Fixes

* support `--no-gitignore` option ([#1833](https://github.com/streetsidesoftware/cspell/issues/1833)) ([0b89fed](https://github.com/streetsidesoftware/cspell/commit/0b89fedc515c4ee237ea5404db791f6663332716))


### Features

* Add support for `.gitignore` ([#1823](https://github.com/streetsidesoftware/cspell/issues/1823)) ([9b0dfe4](https://github.com/streetsidesoftware/cspell/commit/9b0dfe4e50f6b8210d16f9a63ae47949c706c462))





## [5.11.1](https://github.com/streetsidesoftware/cspell/compare/v5.11.0...v5.11.1) (2021-09-29)


### Bug Fixes

* Move `[@types](https://github.com/types)` dependencies to dev ([#1811](https://github.com/streetsidesoftware/cspell/issues/1811)) ([c29fdcb](https://github.com/streetsidesoftware/cspell/commit/c29fdcb8dc5f5d2766a9dd139bd428e532739b3c))





# [5.11.0](https://github.com/streetsidesoftware/cspell/compare/v5.11.0-alpha.0...v5.11.0) (2021-09-28)

**Note:** Version bump only for package cspell





# [5.11.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.10.1...v5.11.0-alpha.0) (2021-09-28)


### Bug Fixes

* Display filenames instead of URI's ([#1773](https://github.com/streetsidesoftware/cspell/issues/1773)) ([5a9542e](https://github.com/streetsidesoftware/cspell/commit/5a9542e1818ff68e89edc9a5c968741ad1b8751f))
* Ensure cli-reporter displays the correct message. ([#1774](https://github.com/streetsidesoftware/cspell/issues/1774)) ([c0aaf45](https://github.com/streetsidesoftware/cspell/commit/c0aaf45ea1f147fda3514149a85d2c2bd70a749f))
* make sure `issue.uri` is actually a URI. ([#1746](https://github.com/streetsidesoftware/cspell/issues/1746)) ([4268057](https://github.com/streetsidesoftware/cspell/commit/4268057c772db4242dde033c69a4448c26739863))


### Features

* add --cache option to lint only changed files ([#1763](https://github.com/streetsidesoftware/cspell/issues/1763)) ([4bdfd09](https://github.com/streetsidesoftware/cspell/commit/4bdfd09677e7b744f79f4e35675760e7083d68e7))





## [5.10.1](https://github.com/streetsidesoftware/cspell/compare/v5.10.0...v5.10.1) (2021-09-17)

**Note:** Version bump only for package cspell





# [5.10.0](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.6...v5.10.0) (2021-09-17)

**Note:** Version bump only for package cspell





# [5.10.0-alpha.6](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.5...v5.10.0-alpha.6) (2021-09-17)


### Bug Fixes

* Make dict-en-gb version 2 optional because of license. ([#1710](https://github.com/streetsidesoftware/cspell/issues/1710)) ([046a704](https://github.com/streetsidesoftware/cspell/commit/046a704e7c5f4a45c065d33d815faa2e464e08c9))





# [5.10.0-alpha.5](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.4...v5.10.0-alpha.5) (2021-09-16)

**Note:** Version bump only for package cspell





# [5.10.0-alpha.4](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.3...v5.10.0-alpha.4) (2021-09-16)

**Note:** Version bump only for package cspell





# [5.10.0-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.2...v5.10.0-alpha.3) (2021-09-16)


### Bug Fixes

* Fix accidental promise returned by reporters. ([#1702](https://github.com/streetsidesoftware/cspell/issues/1702)) ([8c125c2](https://github.com/streetsidesoftware/cspell/commit/8c125c2b2f671bfb6c97b06ecc138a7f7dc8bb84))





# [5.10.0-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.10.0-alpha.0...v5.10.0-alpha.2) (2021-09-13)

**Note:** Version bump only for package cspell





# [5.10.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.1...v5.10.0-alpha.0) (2021-09-13)

### Features

- Custom reporters support ([#1643](https://github.com/streetsidesoftware/cspell/issues/1643)) ([3b9ac1b](https://github.com/streetsidesoftware/cspell/commit/3b9ac1b50972527288aa076970f657546a3ad551))

## [5.9.1](https://github.com/streetsidesoftware/cspell/compare/v5.9.1-alpha.1...v5.9.1) (2021-09-12)

**Note:** Version bump only for package cspell

## [5.9.1-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.9.1-alpha.0...v5.9.1-alpha.1) (2021-09-12)

### Reverts

- Revert "enable incremental typescript builds (#1671)" ([65664b2](https://github.com/streetsidesoftware/cspell/commit/65664b213e67a4108a2d38692f8fbd471b00afb7)), closes [#1671](https://github.com/streetsidesoftware/cspell/issues/1671)

## [5.9.1-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.0...v5.9.1-alpha.0) (2021-09-11)

### Bug Fixes

- drop need for iconv-lite and iterable-to-stream ([#1677](https://github.com/streetsidesoftware/cspell/issues/1677)) ([c7ffcc7](https://github.com/streetsidesoftware/cspell/commit/c7ffcc786ed360fc1a59f84915ea7d204d51d3a5))
- Fix version number reference ([#1640](https://github.com/streetsidesoftware/cspell/issues/1640)) ([1c18b36](https://github.com/streetsidesoftware/cspell/commit/1c18b366382d6044e633e41bda99f3d180e36d3c)), closes [#1638](https://github.com/streetsidesoftware/cspell/issues/1638)

# [5.9.0](https://github.com/streetsidesoftware/cspell/compare/v5.9.0-alpha.0...v5.9.0) (2021-08-31)

**Note:** Version bump only for package cspell

# [5.9.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.8.2...v5.9.0-alpha.0) (2021-08-31)

**Note:** Version bump only for package cspell

## [5.8.2](https://github.com/streetsidesoftware/cspell/compare/v5.8.1...v5.8.2) (2021-08-25)

**Note:** Version bump only for package cspell

## [5.8.1](https://github.com/streetsidesoftware/cspell/compare/v5.8.0...v5.8.1) (2021-08-24)

### Bug Fixes

- Fix some minor issues ([#1562](https://github.com/streetsidesoftware/cspell/issues/1562)) ([8512920](https://github.com/streetsidesoftware/cspell/commit/851292088a6681d72165f6a498c854abcaef5d3e))
- fix wrapping issue in `trace` command with compound words. ([#1574](https://github.com/streetsidesoftware/cspell/issues/1574)) ([e6ebda8](https://github.com/streetsidesoftware/cspell/commit/e6ebda86a11aaea06b3d04611426579ac0e87c41))

# [5.8.0](https://github.com/streetsidesoftware/cspell/compare/v5.7.2...v5.8.0) (2021-08-21)

### Features

- Improve `trace` words command results. ([#1558](https://github.com/streetsidesoftware/cspell/issues/1558)) ([ed8a5dc](https://github.com/streetsidesoftware/cspell/commit/ed8a5dc17ffa6de901887d3bd5b6bacf67217866))

## [5.7.2](https://github.com/streetsidesoftware/cspell/compare/v5.7.1...v5.7.2) (2021-08-16)

### Bug Fixes

- Add software licenses dictionary ([#1523](https://github.com/streetsidesoftware/cspell/issues/1523)) ([43910d5](https://github.com/streetsidesoftware/cspell/commit/43910d526b97402239b0ad38aef74cd8add1b749))
- Detect when module default is used with `cspell.config.js` files. ([#1529](https://github.com/streetsidesoftware/cspell/issues/1529)) ([e05aeff](https://github.com/streetsidesoftware/cspell/commit/e05aeffaa398366f4b6ce4c10728df8d2fa1860f))
- Update `cspell` README.md ([#1530](https://github.com/streetsidesoftware/cspell/issues/1530)) ([9c0dfd6](https://github.com/streetsidesoftware/cspell/commit/9c0dfd61ba3236f5fee9b113c36a089d2ca11000))

## [5.7.1](https://github.com/streetsidesoftware/cspell/compare/v5.7.0...v5.7.1) (2021-08-14)

**Note:** Version bump only for package cspell

# [5.7.0](https://github.com/streetsidesoftware/cspell/compare/v5.7.0-alpha.0...v5.7.0) (2021-08-14)

**Note:** Version bump only for package cspell

# [5.7.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.6.7...v5.7.0-alpha.0) (2021-08-14)

### Features

- Support forbidden words in dictionaries ([#1516](https://github.com/streetsidesoftware/cspell/issues/1516)) ([8d7596b](https://github.com/streetsidesoftware/cspell/commit/8d7596b004100dd296e1058659e39eefc56c6f56))

## [5.6.7](https://github.com/streetsidesoftware/cspell/compare/v5.6.6...v5.6.7) (2021-08-13)

**Note:** Version bump only for package cspell

## [5.6.6](https://github.com/streetsidesoftware/cspell/compare/v5.6.5...v5.6.6) (2021-06-18)

**Note:** Version bump only for package cspell

## [5.6.5](https://github.com/streetsidesoftware/cspell/compare/v5.6.4...v5.6.5) (2021-06-18)

### Bug Fixes

- fix regression related to trailing accents missing in legacy dicts ([#1345](https://github.com/streetsidesoftware/cspell/issues/1345)) ([b8d8810](https://github.com/streetsidesoftware/cspell/commit/b8d8810fafb585a4ffc77f3cb350888d9a6a52ed))

## [5.6.4](https://github.com/streetsidesoftware/cspell/compare/v5.6.3...v5.6.4) (2021-06-15)

### Bug Fixes

- early out on checking binary files. ([#1337](https://github.com/streetsidesoftware/cspell/issues/1337)) ([a948808](https://github.com/streetsidesoftware/cspell/commit/a9488080daf99ed992ac55e450d522a78e5708d7))

## [5.6.3](https://github.com/streetsidesoftware/cspell/compare/v5.6.2...v5.6.3) (2021-06-11)

**Note:** Version bump only for package cspell

## [5.6.2](https://github.com/streetsidesoftware/cspell/compare/v5.6.1...v5.6.2) (2021-06-10)

**Note:** Version bump only for package cspell

## [5.6.1](https://github.com/streetsidesoftware/cspell/compare/v5.6.0...v5.6.1) (2021-06-09)

**Note:** Version bump only for package cspell

# [5.6.0](https://github.com/streetsidesoftware/cspell/compare/v5.5.2...v5.6.0) (2021-06-05)

### Features

- support `.pnp.js` when loading configurations. ([#1307](https://github.com/streetsidesoftware/cspell/issues/1307)) ([76da68c](https://github.com/streetsidesoftware/cspell/commit/76da68cf6a13586598689d01bce3a24bc255530a))

## [5.5.2](https://github.com/streetsidesoftware/cspell/compare/v5.5.1...v5.5.2) (2021-05-30)

**Note:** Version bump only for package cspell

## [5.5.1](https://github.com/streetsidesoftware/cspell/compare/v5.5.0...v5.5.1) (2021-05-29)

### Bug Fixes

- Update CHANGELOG.md ([#1291](https://github.com/streetsidesoftware/cspell/issues/1291)) ([7129c1b](https://github.com/streetsidesoftware/cspell/commit/7129c1bdaa107ae8990ecf8ca2120e82031f2c05))

# [5.5.0](https://github.com/streetsidesoftware/cspell/compare/v5.4.1...v5.5.0) (2021-05-29)

### Features

- Remove incorrect Ignore Hex Digits Regexp ([#1277](https://github.com/streetsidesoftware/cspell/issues/1277)) ([2621eb0](https://github.com/streetsidesoftware/cspell/commit/2621eb02f487d9e466b4936bde8650c338b320b8)), closes [#1276](https://github.com/streetsidesoftware/cspell/issues/1276)

  Minor **BREAKING** change.

  `cspell` used to ignore all words that had just hex characters `[a-f]`. This lead to issues like [#1276](https://github.com/streetsidesoftware/cspell/issues/1276). `cspell` will no longer ignore words with only hex characters. To avoid load of false positives (cases where a hex number was intended)
  some new patterns were added:

  - `CStyleHexValue`: C Style `0x[a-f0-9]+`
  - `CSSHexValue`: CSS Style `#[a-f0-9]+`
  - `CommitHash`: GitHub Style commit hashes. - this ignores hex only words that are 7 characters or longer
    might still lead to false negatives.
  - `UnicodeRef`: ignores `U+0000` style codes and ranges `U+0000-ffff`
  - `UUID`: ignores formatted UUIDs

  **Related Changes**

  - fix: Remove incorrect Ignore Hex Digits Regexp
    Fix: #1276
  - fix: Ignore commit hashes and C Style Hex numbers
  - fix: Ignore CSS Hex Values and UUIDs
  - fix: Add more common patterns to ignore
    Try to detect common hex and Unicode patterns to ignore.

## [5.4.1](https://github.com/streetsidesoftware/cspell/compare/v5.4.0...v5.4.1) (2021-05-11)

### Bug Fixes

- correct how dictionaries are disabled ([#1229](https://github.com/streetsidesoftware/cspell/issues/1229)) ([60975ea](https://github.com/streetsidesoftware/cspell/commit/60975ea03ad11cc92d2841ca0baf0d60e3d39907)), closes [#1215](https://github.com/streetsidesoftware/cspell/issues/1215)

# [5.4.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.12...v5.4.0) (2021-05-05)

**Note:** Version bump only for package cspell

## [5.3.12](https://github.com/streetsidesoftware/cspell/compare/v5.3.11...v5.3.12) (2021-04-06)

### Bug Fixes

- Update dictionaries ([#1136](https://github.com/streetsidesoftware/cspell/issues/1136)) ([64eba51](https://github.com/streetsidesoftware/cspell/commit/64eba51b75e0e2dde0568f46b4312c949b884a73))

## [5.3.11](https://github.com/streetsidesoftware/cspell/compare/v5.3.10...v5.3.11) (2021-04-03)

### Bug Fixes

- Fix command line exclusions ([#1119](https://github.com/streetsidesoftware/cspell/issues/1119)) ([c191fc5](https://github.com/streetsidesoftware/cspell/commit/c191fc5c4901059cddf1ea70479563bbf054c395))

## [5.3.10](https://github.com/streetsidesoftware/cspell/compare/v5.3.9...v5.3.10) (2021-04-02)

### Bug Fixes

- file globs listed on the command line override files in the config. ([#1117](https://github.com/streetsidesoftware/cspell/issues/1117)) ([25c501d](https://github.com/streetsidesoftware/cspell/commit/25c501d2267b8aca93624e0c4e036df5fdef7d20)), closes [#1115](https://github.com/streetsidesoftware/cspell/issues/1115)
- issue [#1114](https://github.com/streetsidesoftware/cspell/issues/1114) ([#1116](https://github.com/streetsidesoftware/cspell/issues/1116)) ([77ae68a](https://github.com/streetsidesoftware/cspell/commit/77ae68ae346dcf27f780d4139be57a234b7a1485))

## [5.3.9](https://github.com/streetsidesoftware/cspell/compare/v5.3.8...v5.3.9) (2021-03-19)

**Note:** Version bump only for package cspell

## [5.3.8](https://github.com/streetsidesoftware/cspell/compare/v5.3.7...v5.3.8) (2021-03-17)

**Note:** Version bump only for package cspell

## [5.3.7](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.3...v5.3.7) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.2...v5.3.7-alpha.3) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.1...v5.3.7-alpha.2) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.7-alpha.0...v5.3.7-alpha.1) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.7-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.6...v5.3.7-alpha.0) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.6](https://github.com/streetsidesoftware/cspell/compare/v5.3.5...v5.3.6) (2021-03-05)

**Note:** Version bump only for package cspell

## [5.3.5](https://github.com/streetsidesoftware/cspell/compare/v5.3.4...v5.3.5) (2021-03-05)

### Bug Fixes

- make sure glob patterns match on windows ([#1039](https://github.com/streetsidesoftware/cspell/issues/1039)) ([1e58e4c](https://github.com/streetsidesoftware/cspell/commit/1e58e4c0c1fb706fc61fb82512d6fe92ad0b58fc))

## [5.3.4](https://github.com/streetsidesoftware/cspell/compare/v5.3.3...v5.3.4) (2021-03-01)

**Note:** Version bump only for package cspell

## [5.3.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.2...v5.3.3) (2021-02-26)

### Bug Fixes

- Report the root cause of a dictionary error. ([#1014](https://github.com/streetsidesoftware/cspell/issues/1014)) ([8c1debd](https://github.com/streetsidesoftware/cspell/commit/8c1debde5de8c040b0110644e9b45f60d42bafc3))

## [5.3.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.1...v5.3.2) (2021-02-26)

### Bug Fixes

- do not check binary files and add Ada dictionary ([#1011](https://github.com/streetsidesoftware/cspell/issues/1011)) ([af04ead](https://github.com/streetsidesoftware/cspell/commit/af04ead1dcd517b5de813a24d4d17424971a5606))

## [5.3.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.0...v5.3.1) (2021-02-25)

### Bug Fixes

- make sure to export all needed cspell types. ([#1006](https://github.com/streetsidesoftware/cspell/issues/1006)) ([c625479](https://github.com/streetsidesoftware/cspell/commit/c625479be185f287e297a1dcddbcfa2aa24b0d0d))

# [5.3.0](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.4...v5.3.0) (2021-02-25)

**Note:** Version bump only for package cspell

# [5.3.0-alpha.4](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.3...v5.3.0-alpha.4) (2021-02-25)

### Bug Fixes

- [#1000](https://github.com/streetsidesoftware/cspell/issues/1000) ([#1002](https://github.com/streetsidesoftware/cspell/issues/1002)) ([d82a4a2](https://github.com/streetsidesoftware/cspell/commit/d82a4a2921fd70a790d8b0839e6be6f342501c26))

# [5.3.0-alpha.3](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.2...v5.3.0-alpha.3) (2021-02-23)

### Bug Fixes

- Improve reporting on files matching glob patterns. ([#994](https://github.com/streetsidesoftware/cspell/issues/994)) ([da991f9](https://github.com/streetsidesoftware/cspell/commit/da991f93a061c5b64ce437332c7107ef2ef89472))

# [5.3.0-alpha.2](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.1...v5.3.0-alpha.2) (2021-02-22)

**Note:** Version bump only for package cspell

# [5.3.0-alpha.1](https://github.com/streetsidesoftware/cspell/compare/v5.3.0-alpha.0...v5.3.0-alpha.1) (2021-02-19)

### Bug Fixes

- Display suggestions -- regression ([#976](https://github.com/streetsidesoftware/cspell/issues/976)) ([e3970c7](https://github.com/streetsidesoftware/cspell/commit/e3970c7fa4932ab0a610fcb9c0907b45ffa7f0df))
- Fix schema generation to use `deprecatedMessage` ([#972](https://github.com/streetsidesoftware/cspell/issues/972)) ([492dca9](https://github.com/streetsidesoftware/cspell/commit/492dca91466773bdf247fdb87f93d64914d5e3e1))

# [5.3.0-alpha.0](https://github.com/streetsidesoftware/cspell/compare/v5.2.4...v5.3.0-alpha.0) (2021-02-18)

### Features

- Be able to specify files to spell check within the config. ([#948](https://github.com/streetsidesoftware/cspell/issues/948)) ([23f7a48](https://github.com/streetsidesoftware/cspell/commit/23f7a488ef500fb1df5cd234c7d3c2ab4ec02961)), closes [#571](https://github.com/streetsidesoftware/cspell/issues/571)
- Glob patterns are relative to the config file. ([#921](https://github.com/streetsidesoftware/cspell/issues/921)) ([a250448](https://github.com/streetsidesoftware/cspell/commit/a2504484ec38f15804cc0a203317266f83566b7c))
- Support local configuration files ([#966](https://github.com/streetsidesoftware/cspell/issues/966)) ([0ccc5fe](https://github.com/streetsidesoftware/cspell/commit/0ccc5fe9eb70ca3a4c6e5a3fc0b653465e76983c))

## [5.2.4](https://github.com/streetsidesoftware/cspell/compare/v5.2.3...v5.2.4) (2021-01-28)

**Note:** Version bump only for package cspell

## [5.2.3](https://github.com/streetsidesoftware/cspell/compare/v5.2.2...v5.2.3) (2021-01-27)

**Note:** Version bump only for package cspell

## [5.2.2](https://github.com/streetsidesoftware/cspell/compare/v5.2.1...v5.2.2) (2021-01-26)

**Note:** Version bump only for package cspell

## [5.2.1](https://github.com/streetsidesoftware/cspell/compare/v5.2.0...v5.2.1) (2021-01-23)

### Bug Fixes

- make sure version and help do not exit with non-zero code. ([#883](https://github.com/streetsidesoftware/cspell/issues/883)) ([b8e91f3](https://github.com/streetsidesoftware/cspell/commit/b8e91f35e2cdebc14dda9b73de1dd31183f5d91d)), closes [#880](https://github.com/streetsidesoftware/cspell/issues/880)

# [5.2.0](https://github.com/streetsidesoftware/cspell/compare/v5.1.3...v5.2.0) (2021-01-23)

### Features

- Add options --show-context and --relative ([#878](https://github.com/streetsidesoftware/cspell/issues/878)) ([1fddaac](https://github.com/streetsidesoftware/cspell/commit/1fddaac4d80f8a28e12677e0953e8443116c24c2))
- support .yaml and .js configuration files ([#875](https://github.com/streetsidesoftware/cspell/issues/875)) ([4a07acc](https://github.com/streetsidesoftware/cspell/commit/4a07acc507f3106e1f09805b8ee019ea200ae08f))
- support displaying suggestions ([#881](https://github.com/streetsidesoftware/cspell/issues/881)) ([e3f207f](https://github.com/streetsidesoftware/cspell/commit/e3f207f802231cc7915015d2c2924e08745e4f8e))

## [5.1.3](https://github.com/streetsidesoftware/cspell/compare/v5.1.2...v5.1.3) (2021-01-05)

**Note:** Version bump only for package cspell

## [5.1.2](https://github.com/streetsidesoftware/cspell/compare/v5.1.1...v5.1.2) (2020-12-31)

**Note:** Version bump only for package cspell

## [5.1.1](https://github.com/streetsidesoftware/cspell/compare/v5.1.0...v5.1.1) (2020-12-28)

### Bug Fixes

- remove dependency upon `@types/glob` ([#810](https://github.com/streetsidesoftware/cspell/issues/810)) ([03fab52](https://github.com/streetsidesoftware/cspell/commit/03fab5288d971ced4c49da6765194653d8f73f96))

# [5.1.0](https://github.com/streetsidesoftware/cspell/compare/v5.0.8...v5.1.0) (2020-12-27)

### Features

- improve spell checking speed and allow multiple exclude arguments ([#806](https://github.com/streetsidesoftware/cspell/issues/806)) ([7a4c8f8](https://github.com/streetsidesoftware/cspell/commit/7a4c8f8d968aba520122ad94feb21096e8190898))

## [5.0.8](https://github.com/streetsidesoftware/cspell/compare/v5.0.7...v5.0.8) (2020-12-17)

### Bug Fixes

- Docs and minor edits ([#757](https://github.com/streetsidesoftware/cspell/issues/757)) ([e5f4567](https://github.com/streetsidesoftware/cspell/commit/e5f4567f25a90ee52105e50c99c7ad90cfb9fdb0))
- issue with importing cspell ([ff32d0c](https://github.com/streetsidesoftware/cspell/commit/ff32d0cab987026e13d131961667e10b6cd83831))

## [5.0.7](https://github.com/streetsidesoftware/cspell/compare/v5.0.6...v5.0.7) (2020-12-16)

**Note:** Version bump only for package cspell

## [5.0.6](https://github.com/streetsidesoftware/cspell/compare/v5.0.5...v5.0.6) (2020-12-15)

**Note:** Version bump only for package cspell

## [5.0.5](https://github.com/streetsidesoftware/cspell/compare/v5.0.4...v5.0.5) (2020-12-15)

**Note:** Version bump only for package cspell

## [5.0.4](https://github.com/streetsidesoftware/cspell/compare/v5.0.3...v5.0.4) (2020-12-15)

**Note:** Version bump only for package cspell

## [5.0.3](https://github.com/streetsidesoftware/cspell/compare/v5.0.2...v5.0.3) (2020-12-04)

### Bug Fixes

- Expose Emitter types ([#718](https://github.com/streetsidesoftware/cspell/issues/718)) ([3ef9030](https://github.com/streetsidesoftware/cspell/commit/3ef903097de0819025ba74eb9bf978eb1f57fc12))

## [5.0.2](https://github.com/streetsidesoftware/cspell/compare/v5.0.2-alpha.1...v5.0.2) (2020-11-26)

**Note:** Version bump only for package cspell

## [5.0.1](https://github.com/streetsidesoftware/cspell/compare/v5.0.1-alpha.15...v5.0.1) (2020-11-20)

### Bug Fixes

- make sure the error code is correctly set ([#619](https://github.com/streetsidesoftware/cspell/issues/619)) ([09e358c](https://github.com/streetsidesoftware/cspell/commit/09e358c3b7d3c485df92d7d9c5a652cf6a85f635))

## [5.0.1-alpha.15](https://github.com/streetsidesoftware/cspell/compare/v5.0.1-alpha.14...v5.0.1-alpha.15) (2020-11-18)

### Bug Fixes

- force new version ([3ab08ab](https://github.com/streetsidesoftware/cspell/commit/3ab08ab5ae1939d934b2f0fb23d33defc60c1a7f))

## 5.0.1-alpha.14 (2020-11-17)

**Note:** Version bump only for package cspell

## [5.0.1-alpha.0](https://github.com/streetsidesoftware/cspell/compare/cspell@4.0.44...cspell@5.0.1-alpha.0) (2020-02-20)

**Note:** Version bump only for package cspell

# Release Notes

## [4.0.16]

- Speed improvements to address slowdown to support case sensitivity.

## [4.0.14]

- Add basic case sensitivity support.

## [4.0.0]

- **Breaking Change** drop support for Node 8 and 9.

## [3.2.14]

- Updated `package.json` references to point to the new monorepo
- [Resolve paths beginning with tilde as \$HOME by `tribut` · Pull Request #83](https://github.com/streetsidesoftware/cspell/pull/83)
- Fixed: [English words between Japanese characters are not correctly checked. · Issue #89](https://github.com/streetsidesoftware/cspell/issues/89)

## [3.2.10]

- Move to a monorepo

## [3.2.9]

- Update dictionaries

## [3.2.2]

- cspell-cli: Added option to not show the summary at the end.
- Updated dictionaries

## [3.2.1]

- Updated dictionaries
- Updated packages
- Added a dictionary for fullstack development defaults on for `php` and `javascript`
- Moved the companies dictionary to [cspell-dicts/packages/companies](https://github.com/streetsidesoftware/cspell-dicts/tree/main/packages/companies)
- Updated Tooling

## [3.1.4]

- Support `~/` references for dictionary files.

## [3.1.3]

- Add `Elixir` dictionary to cspell.

## [3.1.2]

- Add `lorem-ipsum` dictionary to cspell.

## [3.1.1]

- Fix [Can't set language via config file #49](https://github.com/streetsidesoftware/cspell/issues/49)

## [3.1.0]

- Change the default output for issues to address: [linter output format is not standardized #35](https://github.com/streetsidesoftware/cspell/issues/35).
  The old output can be achieved with the `--legacy` flag.
- Added `--languageId` options to force the programming language. This is useful if the extension is unknown.
- `check` command now supports overrides in the `cspell.json` file.
- `check` command now supports `local` option.

## [3.0.3]

- Add Scala and Java dictionaries.

## [3.0.2]

- Do not crash if configstore is not available. [Server crashes on Ubuntu #207](https://github.com/streetsidesoftware/vscode-spell-checker/issues/207)

## [3.0.1]

- Move to RxJs 6

## [3.0.0]

- Fix code coverage generation issues with respect to Node 10 builds.
- Pull in English spelling fixes.

## [2.x] to [3.x] Breaking changes

- Move to RxJs version 6

## [2.1.10]

- Fix an issue with matching too much text for a url:
  [Misspelled first word after HTML element with absolute URL is not detected #201](https://github.com/streetsidesoftware/vscode-spell-checker/issues/201)
- [Better LaTeX support](https://github.com/streetsidesoftware/vscode-spell-checker/issues/167#issuecomment-373682530)
- Ignore SHA-1, SHA-256, SHA-512 hashes by default
- Ignore HTML href urls by default.

## [2.1.9]

- Fix a common spelling mistake in the English Dictionary
- Make cSpell aware of AsciiDocs.

## [2.1.8]

- Update the English dictionary.

## [2.1.7]

- Add the ability to set the allowed URI schemas when filtering filenames.

## [2.1.6]

- Update Golang dictionary

## [2.1.5]

- Migrate LaTex to cspell-dicts

## [2.1.4]

- Fix an issue with the sub command where the options were not making it through. This prevented specifying the config file to use.
- Improve LaTeX support for text commands.
- Fix [String Regex too greedy](https://github.com/streetsidesoftware/vscode-spell-checker/issues/185)

## [2.1.3]

- Make sure title, section, etc. is spell checked: [LaTeX: No spell check for chapter/section titles #179](https://github.com/streetsidesoftware/vscode-spell-checker/issues/179)

## [2.1.2]

- Add dictionary for Rust
- Improved LaTex macro detection based upon [Bludkey's suggestion](https://github.com/streetsidesoftware/vscode-spell-checker/issues/172#issuecomment-366523937)
- Improved verbose output by displaying the language detected and dictionaries used.
- Updated `cpp` dictionary to address: [incorrect spelling of "successful"](https://github.com/streetsidesoftware/vscode-spell-checker/issues/176)

## [2.1.1]

- Add the ability to ignore the next line or the current line: `cspell:disable-line` and `cspell:disable-next-line`
  See [No spell-checker:disable-line](https://github.com/streetsidesoftware/cspell/issues/24)

## [2.1.0]

- Add `check` command to command line tool. This will check the text of a file and show any errors highlighted in red.
- improve `LaTex` support by excluding macros. (Regex by [James-Yu](https://github.com/James-Yu))

## [2.0.9]

- Correct the CSpellUserSettings interface for compatibility

## [2.0.8]

- Allow variable width output for trace based upon the terminal width.

## [2.0.6]

- Add `trace` command to the cli. This makes it easier to see if a word exists in one of the dictionaries

## [2.0.5]

- Use `configstore-fork` to enable cspell usage in a CI environment [#25](https://github.com/streetsidesoftware/cspell/issues/25)
- Experiment with improved suggestion speed.

## [2.0.4]

- Update Python dictionary

## [2.0.0]

- Better support for checking compound words.

## [1.10.5]

- Migrate PHP dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)
- Migrate C++ dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)

## 1.10.4

- Improved support for compound word suggestions.
- Sped up suggestions on large compound words by a factor of 10x.
  Large compound words suggestions are still slow: ~4000ms to generate 8 suggestions for a 27 character word.
  This time can be reduced to about 1 second by changing the number of suggestions to 1.

## 1.10.3

- Initial support for compound word suggestions.

## 1.10.0 - 1.10.2

- Add support for compound word suggestion.
- Add support for dictionaries that force compound words like Dutch and German
- Fix an issue with all caps words net getting good suggestions.

## 1.9.7

- Fix [#16](https://github.com/streetsidesoftware/cspell/issues/16) where words beginning with capitol letters were not getting good suggestions.

## 1.9.6

- Make sure all Settings interfaces are exposed.

## 1.9.4

- Migrate Go Lang dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)
- Migrate Python dictionary file to [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts)
- Support Python Django Framework

## 1.9.3

- Add support for 'untitled' file scheme types.
- Add basic support for handlebars

## 1.9.2

- Add better support for .jsx and .tsx files.
- Ignore #include lines on .cpp and .c files.

## 1.9.0

- Add support to set the local / language within a file using in document settings.
- Add support for overrides based upon the filename.

## 1.8.1

- Add support for dictionary level replacement maps. This allows for things like ij -> ĳ because that is how it is stored in the dictionary.
- Fix issue [#10](https://github.com/streetsidesoftware/cspell/issues/10) - handle right quotes.
- Fix an issue where \' should be seen as ' when checking contractions.

## 1.7.3

- Be able to clear the cached settings files.
- Make sure the global config file is not created by default.

## 1.7.0

- Use `configstore` to store persistent config settings. That way it is possible for settings to be changed programmatically.
- The two English dictionaries have been moved into [cspell-dict](https://github.com/streetsidesoftware/cspell-dicts) for easier maintenance.
- It is now possible to import other settings files from with in a cspell.json file using `"import": ["../path/to/other/cspell.json"]`

## 1.6.1

- Minor update of packages

## 1.6.0

- Updated package dependencies (removed deprecated packages)
- Fix issue #9 - add a fix for Python unicode and byte strings.
- Language level overrides now work
  - It is now possible to add language level exclude / include patterns.

## 1.5.0

- Fix issue #7 - where trailing characters on long words were ignored.

## 1.4.0

- Support the new cspell-trie file format. This is useful for very large dictionaries.

## 1.3.3

- Use latest version of cspell-tools.

## 1.3.2

- More terms Added
- Now builds on appveyor to make sure we run on Windows.
- Update packages

## 1.3.1

- Code coverage improvements
- Update the README

## 1.3.0

- Add color output
- Fixed the way excludes are handled
- Fixed and issue with the cspell.json loading
- updated rxjs to 5.1.0

## 1.2.1

- Fix an issue with Spelling Issue reporting.
- Make sure ignorePaths are included in the exclusions.

## 1.1.0

- Load time speed improvement
- Code refactor along lines of responsibility.
- Added dictionary support for LaTex
- Added option to only output the words not found in the dictionaries
- Added option to only output the first instance of a word not found in the dictionaries
- Improve typescript dictionary by basing it upon the typescript/lib/lib.\*.d.ts
- Add code coverage

## 1.0.0 - 1.0.8

- These were the initial release used for the vscode spell checker.

<!-- cspell:ignore appveyor Bludkey's tribut -->
