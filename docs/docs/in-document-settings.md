---
nav_order: 7
---

# In-Document Settings

It is possible to add spell check settings directly into your source code. This is to helpful for file-specific issues.

For example, you might want to intentionally misspell a word, but not whitelist the word across your entire project. In this situation, you can annotate an in-line ignore like this:

```ts
function useFUBARZ() {} // cspell:disable-line
```

## Setting List

CSpell supports a few different in-line settings. Each setting must be prefixed with one of the following:

- `cspell:`
- `spell-checker:`
- `spellchecker:`

| Setting Name           | Description
| ---------------------- | -----------
| `disable`              | Turn off the spell checker for a section of code. (Nesting disable/enable is not supported.)
| `enable`               | Turn the spell checker back on after it has been turned off. (Nesting disable/enable is not supported.)
| `disable-line`         | Turn off the spell checker for the specific line only.
| `disable-next-line`    | Turn off the spell checker for the next line only.
| `ignore`               | Specify a list of words to be ignored. These words will be ignored for the entire file.
| `words`                | Specify a list of words to be considered correct. These words will be considered correct for the entire file. (This is different from "ignore" in that these words will appear in the suggestions list.)
| `ignoreRegExp`         | Any text matching the regular expression in the entire file will be ignored.
| `includeRegExp`        | Only text matching the regular expression in the entire file will be spell-checked.
| `enableCompoundWords`  | Allow words like: "stringlength" for the entire file. See the [compound words section](#compound-words).
| `disableCompoundWords` | Disallow words like: "stringlength" for the entire file. See the [compound words section](#compound-words).
| `dictionaries`         | Specify a list of the dictionaries to use for the entire file.

## Examples

```javascript
// cspell:disable
const wackyWord = ['zaallano', 'wooorrdd', 'zzooommmmmmmm'];
const wackyWord2 = ['ohmyyy'];
// cspell:enable
```

```javascript
const words = ['zaallano', 'wooorrdd', 'zzooommmmmmmm']; // cspell:disable-line
```

```javascript
const str = 'goedemorgen'; // Will be flagged as an error
// cspell:disable
// If there isn't an enable, spelling is disabled untill the end of the file
const str = 'goedemorgen'; // Will NOT be flagged as an error
```

### Compound words

In some programing languages, it is common to glue words together.

```c
// cspell:enableCompoundWords
char * errormessage;  // Is ok
int    errornumber;   // Is also ok
```

**Note:** Compound word checking cannot be turned on / off in the same file. The last setting in the file determines the value for the entire file.

### Excluding and Including Text to be checked

By default, the entire document is checked for spelling.
`cSpell:disable`/`cSpell:enable` above allows you to block off sections of the document.
`ignoreRegExp` and `includeRegExp` give you the ability to ignore or include patterns of text.
By default the flags `gim` are added if no flags are given.

The spell checker works in the following way:

1. Find all text matching `includeRegExp`
2. Remove any text matching `ignoreRegExp`
3. Check the remaining text.

#### Exclude Example

```javascript
// cSpell:ignoreRegExp 0x[0-9a-f]+     -- will ignore c style hex numbers
// cSpell:ignoreRegExp /0x[0-9A-F]+/g  -- will ignore upper case c style hex numbers.
// cSpell:ignoreRegExp g{5} h{5}       -- will only match ggggg, but not hhhhh or 'ggggg hhhhh'
// cSpell:ignoreRegExp g{5}|h{5}       -- will match both ggggg and hhhhh
// cSpell:ignoreRegExp /g{5} h{5}/     -- will match 'ggggg hhhhh'
/* cSpell:ignoreRegExp /n{5}/          -- will NOT work as expected because of the ending comment -> */
/*
   cSpell:ignoreRegExp /q{5}/          -- will match qqqqq just fine but NOT QQQQQ
*/
// cSpell:ignoreRegExp /[^\s]{40,}/    -- will ignore long strings with no spaces.
// cSpell:ignoreRegExp Email           -- this will ignore email like patterns -- see Predefined RegExp expressions
var encodedImage = 'HR+cPzr7XGAOJNurPL0G8I2kU0UhKcqFssoKvFTR7z0T3VJfK37vS025uKroHfJ9nA6WWbHZ/ASn...';
var email1 = 'emailaddress@myfancynewcompany.com';
var email2 = '<emailaddress@myfancynewcompany.com>';
```

**Note:** ignoreRegExp and includeRegExp are applied to the entire file. They do not start and stop.

#### Include Example

In general you should not need to use `includeRegExp`. But if you are mixing languages then it could come in helpful.

```Python
# cSpell:includeRegExp #.*
# cSpell:includeRegExp ("""|''')[^\1]*\1
# only comments and block strings will be checked for spelling.
def sum_it(self, seq):
    """This is checked for spelling"""
    variabele = 0
    alinea = 'this is not checked'
    for num in seq:
        # The local state of 'value' will be retained between iterations
        variabele += num
        yield variabele
```
