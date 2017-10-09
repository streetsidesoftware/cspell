# Release Notes

## 1.6.7 - 1.6.9
- Improve the speed of generating suggestions for long compound words.

## 1.6.6
- Expose the compound suggestions.

## 1.6.5
- convert suggestion generator to actual javascript generators.
  This is a breaking change to the genSuggestions interface. There are no known consumers.

## 1.6.0 - 1.6.4
- Add ability to combine the suggestion results from multiple tries (work in progress).
- Add support for compounded word searches.
- Add support for compound word suggestions.

## 1.5.1
- update packages and remove dependency on fs-promise.

## 1.4.0
- fix an issue where words trailed by extra characters were considered correct, like: 'bananasttt'.

## 1.3.0
- add generating suggestions from the Trie.

## 1.2.0
- added Trie class and the ability to walk a Trie while controlling the depth.

## 1.1.0
- added command line to read and write *.trie* files.

