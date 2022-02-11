---
layout: default
title: Case Sensitivity
categories: docs
# parent: Docs
nav_order: 4
---

# Case Sensitivity

The spell checker supports case sensitive checking. By default it is turned off.

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

## By File Type

It can be enabled per file type.

The following configuration will turn on case sensitivity for `markdown` files.

**`cspell.json`**

```js
"languageSettings": [
  {
    "languageId": "markdown",
    "caseSensitive": true
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
  }
]
```
