# Release Notes

## latest
- Add support to set the local / language within a file using in document settings.


## 1.8.1
- Add support for dictionary level replacement maps. This allows for things like ij -> ĳ because that is how it is stored in the dictionary.
- Fix issue [#10](https://github.com/Jason3S/cspell/issues/10) - handle right quotes.
- Fix an issue where \' should be seen as ' when checking contractions.

## 1.7.3
- Be able to clear the cached settings files.
- Make sure the global config file is not created by default.

## 1.7.0
- Use `configstore` to store persistent config settings. That way it is possible for settings to be changed programmatically.
- The two English dictionaries have been moved into [cspell-dict](https://github.com/Jason3S/cspell-dicts) for easier maintenance.
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
