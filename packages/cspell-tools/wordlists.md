# Word Lists

cSpell supports a simple word list format.

```
# Comment
word
!forbid
English
~english
~cafe       # accent removed from é
café
error*
*code
+ending
```

- `#` - A comment till the end of the line.
- `!` - Forbidden. A leading `!` means the word is forbidden and will always be considered incorrect. Even if the same word is also in the list of correct words.
- `~` - No accents or case. A leading `~` means accents have been removed and uppercase letters have been converted to lowercase. This is to allow for case insensitive checking and places where accented characters are not allowed.
- `*` - Optional compound allowed. A `*` at the beginning of a word means it can be prefixed with words ending in `*` or `+`.
  A `*` at the end of a word means it can be suffixed with words beginning in `*` or `+`.
- `+` - Required compound. A `+` a the beginning of a word must be compounded with another word ending in `*` or `+`.
  A `+` at the end of a word must be compounded with another word starting with `*` or `+`.

**Note:** `*code*` is short hand for `code`, `+code`, `code+`, `+code+`.

**Note:** leading and trailing spaces are ignored.

**Example:**

```
error*
*code
+msg
```

The following words are allowed: `error`, `errorcode`, `code`, `errormsg`. Note: `msg` is NOT allowed because it is required to be combined with another word.

<!---
cspell:ignore errorcode errormsg
-->
