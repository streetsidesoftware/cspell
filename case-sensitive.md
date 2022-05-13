---
layout: default
title: Case Sensitivity
categories: docs
# parent: Docs
nav_order: 4
---

# Case and Accent Sensitivity

The spell checker supports case and accent sensitive checking. By default it is turned off for English, but is turned on for some language dictionaries where accents and case are more integral to the language.

## Accent Checking

A single setting controls both case and accent checking. The main use case to
turn off case and accent checking is for computer programming.

When `caseSensitive` is set to false, accents are still checked, but they are allowed to be missing for the entire word. Using the wrong accent or mixing accents is not considered correct.

Example with `café`:

| word   |     | Reason                                             |
| ------ | --- | -------------------------------------------------- |
| `café` | ✓   | Matches the original word                          |
| `cafe` | ✓   | Accent is missing, ok when case sensitivity is off |
| `cafë` | ❌  | Using a different accent with `e` is not ok        |
| `cäfe` | ❌  | Added accent to `a` is not ok                      |

<!--- cspell:ignore cafë cäfe  -->

## Default Setting

Because the spell checker was originally case insensitive, making it case aware takes care so as to not break things. CSpell `5.x` introduced the `caseSensitive` setting to allow checking case.

**Note:** Not all dictionaries are currently case aware, so in those cases, lower case words are allowed.

## Enable Case Sensitive Checking by Default

**Note:** this might create a lot of false issues in code files.

**Global Enable: `cspell.json`**

```js
{
  "caseSensitive": true
}
```

**Note:** Some language dictionaries (like German, French, Spanish) turn on case sensitivity by default. Setting the global `"caseSensitive": false` is not sufficient
to turn it off. It is necessary to to use `languageSettings` to turn off case sensitivity based upon the file type.

## By File Type

It can be enabled per file type.

The following configuration will turn on case sensitivity for `markdown` files.

**`cspell.json`**

```js
"languageSettings": [
  {
    "languageId": "markdown",
    "caseSensitive": true
  },
  {
    "languageId": "javascript",
    "caseSensitive": false
  }
]
```

## By Glob Pattern

**`cspell.json`**

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
