# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.12](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.11...cspell-trie@4.2.12) (2021-01-23)

**Note:** Version bump only for package cspell-trie





## [4.2.11](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.10...cspell-trie@4.2.11) (2020-12-27)

**Note:** Version bump only for package cspell-trie





## [4.2.10](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.9...cspell-trie@4.2.10) (2020-12-15)

**Note:** Version bump only for package cspell-trie





## [4.2.9](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.8...cspell-trie@4.2.9) (2020-11-30)

**Note:** Version bump only for package cspell-trie





## [4.2.8](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.7...cspell-trie@4.2.8) (2020-11-29)

**Note:** Version bump only for package cspell-trie





## [4.2.7](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.6...cspell-trie@4.2.7) (2020-11-17)


### Bug Fixes

* format changelog to bump version ([f9c98ff](https://github.com/streetsidesoftware/cspell/commit/f9c98ff2c5c2fe9d2c801d9f93fc7a25feb445f6))





## 4.2.6 (2020-11-17)

### Bug Fixes

-   do not use node resolver for relative files. ([0df8562](https://github.com/streetsidesoftware/cspell/commit/0df85625da5b667f5817fc710b44fa74b636d9a1))

## [4.2.5](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.4...cspell-trie@4.2.5) (2020-11-14)

**Note:** Version bump only for package cspell-trie

## [4.2.4](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.3...cspell-trie@4.2.4) (2020-11-14)

**Note:** Version bump only for package cspell-trie

## [4.2.3](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.2...cspell-trie@4.2.3) (2020-11-09)

**Note:** Version bump only for package cspell-trie

## [4.2.2](https://github.com/streetsidesoftware/cspell/compare/cspell-trie@4.2.1...cspell-trie@4.2.2) (2020-11-01)

**Note:** Version bump only for package cspell-trie

# Release Notes

## 3.0.7

-   Fix an issue with the decoder that messed up words with spaces.

## 3.0.0

-   Update the major version due to a requirement on rxjs 6.

## 2.0.0

-   Move to ES2017 for speed improvements.
-   Require node >= 8
-   Improve suggestion when accents are involved.

## 1.6.7 - 1.6.9

-   Improve the speed of generating suggestions for long compound words.

## 1.6.6

-   Expose the compound suggestions.

## 1.6.5

-   convert suggestion generator to actual javascript generators.
    This is a breaking change to the genSuggestions interface. There are no known consumers.

## 1.6.0 - 1.6.4

-   Add ability to combine the suggestion results from multiple tries (work in progress).
-   Add support for compounded word searches.
-   Add support for compound word suggestions.

## 1.5.1

-   update packages and remove dependency on fs-promise.

## 1.4.0

-   fix an issue where words trailed by extra characters were considered correct, like: 'bananasttt'.

## 1.3.0

-   add generating suggestions from the Trie.

## 1.2.0

-   added Trie class and the ability to walk a Trie while controlling the depth.

## 1.1.0

-   added command line to read and write _.trie_ files.

<!---
    cspell:ignore bananasttt
-->
