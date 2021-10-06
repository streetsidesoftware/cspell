# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.12.2](https://github.com/Jason-Rev/hunspell-reader/compare/v5.12.1...v5.12.2) (2021-10-06)

**Note:** Version bump only for package hunspell-reader





# [5.12.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.12.0-alpha.0...v5.12.0) (2021-10-05)

**Note:** Version bump only for package hunspell-reader





# [5.12.0-alpha.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.11.1...v5.12.0-alpha.0) (2021-10-05)

**Note:** Version bump only for package hunspell-reader





## [5.11.1](https://github.com/Jason-Rev/hunspell-reader/compare/v5.11.0...v5.11.1) (2021-09-29)

**Note:** Version bump only for package hunspell-reader





# [5.11.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.11.0-alpha.0...v5.11.0) (2021-09-28)

**Note:** Version bump only for package hunspell-reader





# [5.11.0-alpha.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.10.1...v5.11.0-alpha.0) (2021-09-28)

**Note:** Version bump only for package hunspell-reader





# [5.10.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.10.0-alpha.6...v5.10.0) (2021-09-17)

**Note:** Version bump only for package hunspell-reader





# [5.10.0-alpha.6](https://github.com/Jason-Rev/hunspell-reader/compare/v5.10.0-alpha.5...v5.10.0-alpha.6) (2021-09-17)


### Bug Fixes

* Make dict-en-gb version 2 optional because of license. ([#1710](https://github.com/Jason-Rev/hunspell-reader/issues/1710)) ([046a704](https://github.com/Jason-Rev/hunspell-reader/commit/046a704e7c5f4a45c065d33d815faa2e464e08c9))





# [5.10.0-alpha.3](https://github.com/Jason-Rev/hunspell-reader/compare/v5.10.0-alpha.2...v5.10.0-alpha.3) (2021-09-16)

**Note:** Version bump only for package hunspell-reader





# [5.10.0-alpha.2](https://github.com/Jason-Rev/hunspell-reader/compare/v5.10.0-alpha.0...v5.10.0-alpha.2) (2021-09-13)

**Note:** Version bump only for package hunspell-reader





# [5.10.0-alpha.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.9.1...v5.10.0-alpha.0) (2021-09-13)

**Note:** Version bump only for package hunspell-reader





## [5.9.1](https://github.com/Jason-Rev/hunspell-reader/compare/v5.9.1-alpha.1...v5.9.1) (2021-09-12)

**Note:** Version bump only for package hunspell-reader





## [5.9.1-alpha.1](https://github.com/Jason-Rev/hunspell-reader/compare/v5.9.1-alpha.0...v5.9.1-alpha.1) (2021-09-12)


### Reverts

* Revert "enable incremental typescript builds (#1671)" ([65664b2](https://github.com/Jason-Rev/hunspell-reader/commit/65664b213e67a4108a2d38692f8fbd471b00afb7)), closes [#1671](https://github.com/Jason-Rev/hunspell-reader/issues/1671)





## [5.9.1-alpha.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.9.0...v5.9.1-alpha.0) (2021-09-11)


### Bug Fixes

* drop need for iconv-lite and iterable-to-stream ([#1677](https://github.com/Jason-Rev/hunspell-reader/issues/1677)) ([c7ffcc7](https://github.com/Jason-Rev/hunspell-reader/commit/c7ffcc786ed360fc1a59f84915ea7d204d51d3a5))





# [5.9.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.9.0-alpha.0...v5.9.0) (2021-08-31)

**Note:** Version bump only for package hunspell-reader





# [5.9.0-alpha.0](https://github.com/Jason-Rev/hunspell-reader/compare/v5.8.2...v5.9.0-alpha.0) (2021-08-31)

**Note:** Version bump only for package hunspell-reader





# Release Notes

## 4.0.0

- **Breaking Change** dropping support for Node 10

## 3.1.0

- Support limiting the max depth to apply suffixes. This allows the reader to read the Hungarian dictionary.

## 3.0.0

- **Breaking Change** dropping support for Node 8 and 9
- Removed dependency upon `cspell-lib` and `rxjs`
- Improved processing speed.

## 2.1.0

- Add an Iterable Reader, this works much better for very large dictionaries.

## 2.0.0

- Move to RxJs 6 and Node 8

## 1.2.1

- Update packages.

## 1.2.0

- Update packages.
- Remove dependency on fs-promise

## 1.0.4

- Update packages.

## 1.0.3

- Improved speed of processing large dictionaries like Portuguese (Brazilian).
- Fixed issue #1.

## 1.0.2

- Add the ability to output just the root word without applying any prefix / suffix transformations.

## 1.0.1

- Fix an issue where it wasn't correctly reading the package.json file.

## 1.0.0

- Initial release.
