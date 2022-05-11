---
parent: Other Info
---

# How to Forbid Words

## Making Words Forbidden

There are several ways to mark a word as forbidden:

1. In a custom word list with words beginning with `!`.

   <!-- cspell:ignore companyname projectname -->
   ```text
   !forbiddenWord
   companyname
   jQuery
   projectname
   ```

   `forbiddenWord` will always be marked as misspelled. While `companyname` will be considered correct.

2. In `words` section of `cspell` configuration:

   ```json
   "words": [
       "!forbiddenWord",
       "configstore"
   ],
   ```

3. In `flagWords` section of `cspell` configuration:

   ```json
   "flagWords": ["forbiddenWord"]
   ```

## Overriding Forbidden Words

Sometimes it is necessary to allow a word even if it is forbidden.

### In a Comment

```js
/**
 * Do not mark `forbiddenWord` as incorrect.
 * cspell:ignore forbiddenWord
 */
```

### In the `cspell` Configuration

```jsonc
{
  "ignoreWords": ["forbiddenWord"]
}
```

<!-- markdownlint-disable-file MD031 -->
