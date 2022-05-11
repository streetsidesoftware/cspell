---
parent: Configuration
---

# Case and Accent Sensitivity

The spell checker supports case and accent sensitive checking. This feature is turned off for English, but is turned on for some language dictionaries where case and accents are more integral to the language.

A single setting controls both case and accent checking: `caseSensitive`. This feature was added in CSpell `5.x`.

**Note:** Not all dictionaries are currently case aware, so in those cases, lower case words are allowed.

## Accent Checking Explanation

The main use case to turn off case and accent checking is for computer programming. (Also see the [in-depth explanation below](#in-depth-explanation)).

When `caseSensitive` is set to false (the default), accents are still checked, but they are allowed to be missing for the entire word. Using the wrong accent or mixing accents is not considered correct.

Example with `café`: <!--- cspell:ignore cafë cäfe  -->

| word   |     | Reason                                             |
| ------ | --- | -------------------------------------------------- |
| `café` | ✓   | Matches the original word                          |
| `cafe` | ✓   | Accent is missing, ok when case sensitivity is off |
| `cafë` | ❌  | Using a different accent with `e` is not ok        |
| `cäfe` | ❌  | Added accent to `a` is not ok                      |

## Enabling `caseSensitive`

If you want to enable case-sensitive and/or accent checking, then you have a few options.

Also note that doing this might create a lot of false positives.

### Enabling Project-Wide

The following configuration will enable it globally for the entire project:

```js
{
  "caseSensitive": true
}
```

**Note:** Some language dictionaries (like German, French, and Spanish) turn on case sensitivity by default. Setting `"caseSensitive": false` in the CSpell configuration file is not sufficient to turn it off. In this case, you must additionally specify `languageSettings`.

## Enabling by File Type

The following configuration will enable it for only `markdown` files:

```js
"languageSettings": [
  {
    "languageId": "markdown",
    "caseSensitive": true
  },
]
```

## Enabling by Glob Pattern

The following configuration will enable it for only specific file globs:

```js
"overrides": [
  {
    // Case sensitive markdown in the docs folder
    "filename": "docs/**/*.md",
    "caseSensitive": true
  },
  {
    // Make sure TypeScript files are NOT case and accent Sensitive.
    "filename": "src/**/*.ts",
    "languageSettings": [
      {
        "languageId": "*",
        "caseSensitive": false
      }
    ]
  }
]
```

## In-Depth Explanation

### Problem

Many programming languages have their own casing conventions, like `camelCase` or `PascalCase`. These casing schemes may run counter to the correct casing of words. For example, if `camelCase` code is being used, then a variable of `english` would be considered incorrect, since it is a proper name.

The other challenge is accents. Many programming languages do not allow accented characters inside of variable or class names.

### Approach

CSpell version 5 and later supports case sensitive checking. This is achieved by having two effective dictionaries with every word list.

As an example, let's take a look at how the German word for business, `Geschäft`, is stored. <!--- cspell:words Geschäft gescháft --->

There will be three forms:

- `Geschäft`
- `~geschäft`
- `~geschaft`

Words prefixed with `~` denote a case insensitive version of the word.

This is the result when spell checking the various forms of `Geschäft`:

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

In this case, "cs<sup>1</sup>" is case sensitive, and "non<sup>2</sup>" is not case sensitive.

Note: If accents are present in a word, they must match the accents in the original word.
