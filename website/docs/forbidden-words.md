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

Matching against `flagWords` (and `!`-prefixed forbidden words) is case-sensitive based on how each word
is written:

- A word written in **all lowercase** (e.g. `avocado`) is flagged in any casing found in the document —
  `avocado`, `Avocado`, and `AVOCADO` are all flagged.
- A word containing **any uppercase letter** (e.g. `Avocado`) only flags that exact casing, plus the
  all-uppercase form of the word (`AVOCADO`) — it does not flag `avocado` or other mixed-case variants.

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
