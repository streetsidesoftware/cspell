# Release Notes

## 1.5.0
- Fix issue #7 - where trailing characters on long words were ignored.

## 1.4.0
- Support the new cspell-trie file format.  This is useful for very large dictionaries.

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
- Improve typescript dictionary by basing it upon the typescript/lib/lib.*.d.ts
- Add code coverage

## 1.0.0 - 1.0.8
- These were the initial release used for the vscode spell checker.

<!-- cspell:ignore appveyor -->
