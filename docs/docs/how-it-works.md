---
nav_order: 2
---

# How it Works

The concept is simple: split `camelCase` and `snake_case` words. Then, check them against a list of known words.

- `camelCase` -> `camel case`
- `HTMLInput` -> `html input`
- `srcCode` -> `src code`
- `snake_case_words` -> `snake case words`
- `camel2snake` -> `camel snake` -- (the 2 is ignored)
- `function parseJson(text: string)` -> `function parse json text string`

## Special Cases

- Escape characters like `\n`, `\t` are removed if the word does not match:
  - `\ncode` -> `code` - Because `ncode` is not a word.
  - `\narrow` -> `narrow` - Because `narrow` is a word. In this case, both "arrow" and "narrow" are words, so this doesn't matter.
  - `\network` -> `network` - Because `network` is a word. In this case, "network" is a word, but "etwork" is not a work, so CSpell might not catch spelling errors when `\n` and `\t` are used. <!-- cspell:ignore etwork -->

## Things to Note

- CSpell is case insensitive. It will not catch errors like `english` which should be `English`.
- Only words longer than 3 characters are checked. "jsj" is ok, while "jsjs" is not. <!-- cspell:ignore jsjs -->
- All symbols and punctuation are ignored.
- CSpell uses dictionaries that are stored locally. It does not send anything outside your machine.
- The words in the dictionaries can and do contain errors. (Please submit [a pull request on GitHub to the appropriate dictionary](https://github.com/streetsidesoftware/cspell-dicts/tree/main/dictionaries) if you spot any errors.)
- The words in the dictionaries are missing known-good words. (Please submit [a pull request on GitHub to the appropriate dictionary](https://github.com/streetsidesoftware/cspell-dicts/tree/main/dictionaries) if you find a missing word.)

## Dictionaries

See also: [Dictionaries](./dictionaries.md) and [Custom Dictionaries](./dictionaries-custom.md)

The _dictionaries_ list allows you to specify dictionaries to use for the file.

```javascript
// cSpell:dictionaries lorem-ipsum
const companyName = 'Lorem ipsum dolor sit amet';
```

**Note:** dictionaries specified with `dictionaries` will be used for the entire file.
