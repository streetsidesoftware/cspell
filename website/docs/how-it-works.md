---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults
title: How it Works
description: 'How CSpell checks a document.'
# parent: Docs
nav_order: 4
---

# How it works

The concept is simple, split camelCase and snake_case words before checking them against a list of known words.

- `camelCase` -> `camel case`
- `HTMLInput` -> `html input`
- `srcCode` -> `src code`
- `snake_case_words` -> `snake case words`
- `camel2snake` -> `camel snake` -- (the 2 is ignored)
- `function parseJson(text: string)` -> `function parse json text string`

## Special cases

- Escape characters like `\n`, `\t` are removed if the word does not match:
  - `\narrow` -> `narrow` - because `narrow` is a word
  - `\ncode` -> `code` - because `ncode` is not a word.
  - `\network` -> `network` - but it might be hiding a spelling error, if `\n` was an escape character.

## Things to note

- This spellchecker is case insensitive. It will not catch errors like `english` which should be `English`.
- The spellchecker uses dictionaries stored locally. It does not send anything outside your machine.
- The words in the dictionaries can and do contain errors.
- There are missing words.
- Only words longer than 3 characters are checked. "jsj" is ok, while "jsja" is not.
- All symbols and punctuation are ignored.

## Dictionaries

See also: [Dictionaries](./dictionaries.md) and [Custom Dictionaries](./dictionaries-custom.md)

The _dictionaries_ list allows you to specify dictionaries to use for the file.

```javascript
// cSpell:dictionaries lorem-ipsum
const companyName = 'Lorem ipsum dolor sit amet';
```

**Note:** dictionaries specified with `dictionaries` will be used for the entire file.

<!---
cspell:ignore jsja
--->
