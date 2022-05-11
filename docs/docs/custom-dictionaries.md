---
nav_order: 9
---

# Custom Dictionaries

Dictionaries are optimized for searching and generating suggestions while minimizing on their size. When a custom dictionary (word list) is loaded, it is internally optimized. The number of words in a dictionary have no impact on the search time. It is the length of the word that makes a difference.

Creating custom dictionaries is rather straight forward. It requires two parts:

1. A word list
1. A dictionary definition in a configuration file.

## Example 1

**`custom-words.txt`**

```text
# This is a comment
!forbiddenword
these
are
my
favorite
words
```

**`cspell.json`**

```js
{
    // Enable your dictionary by adding it to the list of `dictionaries`
    "dictionaries": ["custom-words"],

    // Tell CSpell about your dictionary
    "dictionaryDefinitions": [
        {
            // The name of the dictionary is used to look it up.
            "name": "custom-words",
            // Path to the custom word file. Relative to this `cspell.json` file.
            "path": "./.cspell/custom-words.txt",
            // Some editor extensions will use `addWords` for adding words to your
            // personal dictionary.
            "addWords": true
        }
    ]
}
```

## Words List Syntax

Where `~` tells the spell checker it that case and possibly accents were removed.

Custom dictionaries tend to be very small compared to full language dictionaries, so, they are not optimized for size.

Custom dictionaries support a few special characters:

- `~` - prefix that tells the spell checker to only use the word when case sensitivity is turned off.
- `+` - prefix/suffix that tells the spell checker that a word MUST be combined with another word to be valid.
- `*` - prefix/suffix that tells the spell checker that a word can be combined with another word.
- `!` - prefix forbid a word.

If you have the following in your custom dictionary:

```text
fooo+
+baar
+bat
+cat
big*
!fooocat
```

Then `fooobaar` and `fooobat` will be valid, but `fooo`, `baar`, and `fooocat` will not be.

This is useful for languages where people commonly combine words: errorcode, systemtime, systemerror.

Note: the custom dictionary also allows other characters like: `_`, `-`, `0-9`, `'`.

Dictionary entries like:

```text
systemerror-409
503_serviceunavailable
```

Will only match the entire entry: `503_serviceunavailable` but not `serviceunavailable`.

<!---
cspell:ignore forbiddenword *error* *code system* *time service* *unavailable
cspell:ignore fooo* *baar *bat *cat
--->
