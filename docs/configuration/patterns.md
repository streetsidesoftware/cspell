---
layout: default
title: Exclude / Include Patterns
categories: configuration
parent: Configuration
nav_order: 11
published: false
---

<!--- Remove published when the page is ready  --->

# Exclude / Include Patterns

**Covers:**

- `patterns`
- `ignoreRegExpList`
- `includeRegExpList`

The spell checker combines the `patterns`, the `ignoreRegExpList`, and the `includeRegExpList` settings based upon the `overrides` and `languageSettings` for the file.

It uses `includeRegExpList` and `ignoreRegExpList` in the following way:

1. Make a set of text to be included by matching against `includeRegExpList` (if empty, include everything).
2. Make a set of text to be excluded by matching against `ignoreRegExpList`.
3. Check all text that is included but not excluded.

`includeRegExpList` and `ignoreRegExpList` can include regular expressions or pattern names. Pattern names resolved against patterns defined in `patterns`.

**Example:**

```yaml
ignoreRegExpList:
  - Email
  - >-
    /ftp:[^\s]*/g
```

**Explained:**

- `Email` is a predefined pattern.
- `/ftp:[^\s]*/g` - will match anything that starts with `ftp:` until the first space.

## Patterns

Patterns allow you to define reusable patterns for excluding or

# Verbose Regular Expressions

| Version | Description     |
| ------- | --------------- |
| ^6.9.0  | Initial support |

Defining RegExp Patterns in `.json` or `.yaml` CSpell config files can be difficult.

This feature makes it easier to define patterns in a `.yaml` file.

CSpell now supports the `x` - verbose flag.

````regexp
/
    ^(\s*`{3,}).*     # match the ```
    [\s\S]*?          # the block of code
    ^\1               # end of the block
/gmx
````

Example of Ignoring code block in `markdown`.

**`cspell.config.yaml`**

````yaml
patterns:
  - name: markdown_code_block
    pattern: |
      /
          ^(\s*`{3,}).*     # match the ```
          [\s\S]*?          # the block of code
          ^\1               # end of the block
      /gmx
languageSettings:
  - languageId: markdown
    ignoreRegExpList:
      - markdown_code_block
````

Leading and trailing spaces are automatically trimmed from patterns, make it possible to avoid escaping in YAML by using `>` without the trailing `-`.

```yaml
ignoreRegExpList:
  - >
    /auth_token: .*/g
  - >-
    /this works too/g
```
