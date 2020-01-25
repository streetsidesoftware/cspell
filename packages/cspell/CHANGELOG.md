# Release Notes

## [4.0.45]
- Fix issus with glob matching on Windows

## [4.0.16]
- Speed improvements to address slowdown to support case sensitivity.

## [4.0.14]
- Add basic case sensitivity support.

## [4.0.0]
- **Breaking Change** drop support for Node 8 and 9.

## [3.2.14]
- Updated `package.json` references to point to the new monorepo
- [Resolve paths beginning with tilde as $HOME by `tribut` · Pull Request #83](https://github.com/streetsidesoftware/cspell/pull/83)
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
- Moved the companies dictionary to [cspell-dicts/packages/companies](https://github.com/streetsidesoftware/cspell-dicts/tree/master/packages/companies)
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

<!-- cspell:ignore appveyor Bludkey's tribut -->
