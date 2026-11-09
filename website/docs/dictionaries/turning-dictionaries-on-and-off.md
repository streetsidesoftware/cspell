---
title: Turning dictionaries on and off
sidebar_position: 4
---

# Turning dictionaries on and off

Use `dictionaries` in your CSpell configuration to choose which dictionaries apply. Some [default dictionaries](./index.md)
are enabled for specific file types. If you installed a dictionary separately, follow its installation and import
instructions before referring to it by name.

## Enable a dictionary

Add the dictionary's ID to `dictionaries`. For example, `lorem-ipsum` is included with CSpell and can be enabled for a
project.

**`cspell.json`**

```json
{
  "dictionaries": ["lorem-ipsum"]
}
```

To find an ID, use [`cspell trace`](./searching-dictionaries.md) to see which dictionaries contain a word, or check the
**Dictionary Information** table in the dictionary package's README.

## Disable a dictionary

Prefix the ID with `!`. For example, set `"dictionaries": ["!cpp"]` to turn off the dictionary with ID `cpp`, even when
the default settings enable it for C++ files. The same rule applies if an imported configuration enables it through
`languageSettings`. Other dictionaries from the same package, such as `cpp-refined`, can still apply.

To enable `lorem-ipsum` except in Markdown files under `examples/`, put `!lorem-ipsum` in a matching
[override](../Configuration/overrides.md).

**`cspell.json`**

```json
{
  "dictionaries": ["lorem-ipsum"],
  "overrides": [
    {
      "filename": "examples/**/*.md",
      "dictionaries": ["!lorem-ipsum"]
    }
  ]
}
```

## Enable a dictionary only for matching files

If a shared configuration already enables a dictionary, disable it at the top level, then use `!!` in an override to
enable it again. In this example, only Markdown files under `examples/` use `lorem-ipsum`.

**`cspell.json`**

```json
{
  "dictionaries": ["!lorem-ipsum"],
  "overrides": [
    {
      "filename": "examples/**/*.md",
      "dictionaries": ["!!lorem-ipsum"]
    }
  ]
}
```

For each file, CSpell uses the entry with the most leading `!` characters among the settings that apply to that file.
An even count enables the dictionary and an odd count disables it. For example, `!cpp` wins over `cpp`, `!!cpp` wins
over `!cpp`, and `!!!cpp` wins over `!!cpp`. Changing the order of the entries has no effect.

## VS Code and the command line

In VS Code settings, use `cSpell.dictionaries` with the same dictionary IDs and prefixes. On the command line, use
`cspell lint --dictionary <name>` or `cspell lint --disable-dictionary <name>` with the files you want to check. These
flags add an entry equivalent to `!!name` or `!name`, respectively.
