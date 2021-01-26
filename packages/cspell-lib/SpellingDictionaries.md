# Spelling Dictionaries

Discussions and designs

## Case Sensitivity

Dictionaries can be case sensitive.

By default, dictionaries are assumed to be case insensitive. Meaning all words are in lowercase form with accents removed.

To make looking up a word very fast, they need to be an exact match with words in the dictionary.

### Case Insensitive Dictionary Words

### Case Sensitive Dictionary Words

How to store words in a case sensitive dictionary:

`~` is prefixed to words to indicate that case or accents were removed.

| Word    | Dictionary Entries            | Notes                                                              |
| ------- | ----------------------------- | ------------------------------------------------------------------ |
| walk    | walk                          |                                                                    |
| English | English, ~english             |                                                                    |
| café    | café, ~cafe                   |                                                                    |
| Rhône   | Rhône, ~Rhone, ~rhone, ~rhône | Multiple forms are given to allow for case-insensitive suggestions |
| HOUSE   | HOUSE, house                  |                                                                    |

### Word Lookup

| Word to Lookup | Matches Words       |
| -------------- | ------------------- |
| HOUSE          | HOUSE, house, House |
| House          | House, house        |
| house          | house               |

<!---
    cSpell:words Rhône café
-->
