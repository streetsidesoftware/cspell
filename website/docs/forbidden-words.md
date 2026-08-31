---
layout: default
title: How to Forbid Words
categories: docs
# parent: Docs
nav_order: 4
---

# How to Forbid Words

## Making Words Forbidden

There are several ways to mark a word as forbidden:

1. In a custom word list with words beginning with `!`.

   ```
   !forbiddenWord
   companyname
   jQuery
   projectname
   ```

   `forbiddenWord` will always be marked as misspelled. While `companyname` will be considered correct.

2. In `words` section of `cspell` configuration:

   ```
   "words": [
       "!forbiddenWord",
       "configstore"
   ],
   ```

3. In `flagWords` section of `cspell` configuration:
   ```
   "flagWords": ["forbiddenWord"]
   ```

## Case Sensitivity

A document word is flagged if it exactly matches a `flagWords` (or `!`-prefixed forbidden word) entry, or if
its lowercased form exactly matches an entry. In practice this means:

- A word written in **all lowercase** (e.g. `avocado`) is flagged in any casing found in the document —
  `avocado`, `Avocado`, and `AVOCADO` are all flagged.
- A word containing **any uppercase letter** (e.g. `Avocado`) only flags that exact casing —
  `avocado` and `AVOCADO` are not flagged.

<!--- cspell:ignore avocado Avocado --->

## Overriding Forbidden words

Sometimes it is necessary to allow a word even if it is forbidden.

### In a comment

```js
/**
 * Do not mark `forbiddenWord` as incorrect.
 * cspell:ignore forbiddenWord
 */
```

### In the `cspell` configuration

```jsonc
{
  "ignoreWords": ["forbiddenWord"]
}
```

<!---
cspell:ignore companyname projectname
--->
