# Case sensitivity and Accents

## Problem

Many programming languages have their own casing conventions. Things like `camelCase` or Title case for ClassNames might run counter to the proper casing of words.
For example, `english` in the variable name `list_of_english_words` would be considered incorrect because it is a proper name.

The other challenge is accents. Many programming languages do not allow accented character as variable or class names.

## Approach

Beginning with cspell version 5, the spell checker allows for case sensitive checking. This is achieved by having two effective dictionaries with every word list.

Let take a look at how the German word for business, `Geschäft`, is stored.

There will be three forms: `Geschäft`, `~geschäft`, and `~geschaft`. Words prefixed with `~` that is is a case insensitive version of the word.

Result when spell checking various forms of `Geschäft`:

| word       | cs<sup>1</sup> | non<sup>2</sup> |
| ---------- | -------------- | --------------- |
| `Geschäft` | ✅             | ✅              |
| `GESCHÄFT` | ✅             | ✅              |
| `Geschaft` | ❌             | ✅              |
| `geschäft` | ❌             | ✅              |
| `geschaft` | ❌             | ✅              |
| `GESCHAFT` | ❌             | ✅              |
| `gescháft` | ❌             | ❌              |
| `Gescháft` | ❌             | ❌              |

<sup>1</sup>cs - case sensitive

<sup>2</sup>non - not case sensitive

Note: If accents are present in a word, they must match the accents in the original word.

<!--- cspell:words Geschäft gescháft --->
