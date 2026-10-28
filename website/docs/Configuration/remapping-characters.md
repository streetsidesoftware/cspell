---
title: Remapping Characters
sidebar_position: 10
sidebar_label: Remapping Characters
---

# Remapping Characters

**Covers:**

- `repMap` on a dictionary definition
- `substitutionDefinitions`
- `substitutions`

CSpell has two ways to change characters before a word is checked: `repMap` and `substitutions`. They look alike,
since both take `[find, replacement]` pairs, but they work at different stages and solve different problems.

## In Short

|                                      | `repMap`                                                  | `substitutions`                                   |
| ------------------------------------ | --------------------------------------------------------- | ------------------------------------------------- |
| Where it is set                      | On a dictionary definition                                | In the config, `overrides`, or `languageSettings` |
| What it changes                      | The forms of a word that are looked up in that dictionary | The document text, before it is split into words  |
| Which dictionaries it affects        | Only the one it is defined on                             | All of them                                       |
| Is the original text still checked   | Yes, first                                                | No, only the replaced text is checked             |
| One `find` with several replacements | Each one is tried                                         | The last one wins                                 |
| Can split or join words              | No                                                        | Yes                                               |

## `repMap`: Other Ways to Spell a Word

A `repMap` belongs to one dictionary. When a word is looked up in that dictionary, CSpell first tries the word as it is.
If that fails, it tries the forms produced by the `repMap`. Each match can be replaced or left alone, so every
combination is tried.

Use it when the text is fine but may spell a word differently from how the dictionary stores it.

**`cspell.config.yaml`**

```yaml
dictionaryDefinitions:
  - name: norwegian-words
    path: ./dictionaries/norwegian-words.txt
    repMap:
      - ['a', 'æ']
      - ['a', 'å']
      - ['o', 'ø']
      - ['A', 'Æ']
      - ['A', 'Å']
      - ['O', 'Ø']

dictionaries:
  - norwegian-words
```

With this, `bat` is accepted if the dictionary contains `bat`, `bæt`, or `båt`. Both `a` entries are tried, because
`repMap` keeps every replacement for the same `find`.

Things to know:

- It only affects the dictionary it is defined on. Other dictionaries see the word unchanged.
- It is set on dictionaries loaded from a file (`path`).
- The text in the document and in the report stays as written.

See [`repMap`](./auto_properties.md#dictionarydefinitionpreferred-repmap) in the properties reference.

## `substitutions`: Rewrite the Text First

Substitutions rewrite the document text before CSpell splits it into words. Every dictionary then sees the rewritten
text. Reported positions still point at the original text.

Use them when the text itself needs decoding before it can be checked, such as HTML entities, URL encoding, or escape
sequences.

**`cspell.config.yaml`**

```yaml
substitutionDefinitions:
  - name: html-entities
    entries:
      - ['&amp;', '&']
      - ['&eacute;', 'é']
      - ['&nbsp;', ' ']

overrides:
  - filename: 'src/**/*.html'
    substitutions:
      - html-entities
```

With this, `caf&eacute;` is checked as `café`, and `one&nbsp;two` is checked as the two words `one` and `two`.

A substitution is listed by name, as above, or written in place as a `[find, replacement]` pair.

Things to know:

- A `find` is exact text, not a regular expression.
- The longest matching `find` is used. If the same `find` appears more than once, the last entry wins, so a
  substitution cannot offer alternatives.
- Every match is replaced, everywhere the substitution applies. A single-letter `find` such as `a` changes every `a` in
  the file, in every language, code included.
- Substitutions were added in CSpell 9.7.0.

See [`substitutionDefinitions`](./auto_properties.md#settings-substitutiondefinitions) and
[`substitutions`](./auto_properties.md#settings-substitutions) in the properties reference.

## Which One to Use

- **A word may be spelled another way and should still match a dictionary:** use `repMap`.
- **The text is encoded and needs to be decoded before checking:** use `substitutions`.
- **The change splits or joins words:** use `substitutions`.
- **A letter could stand for more than one letter:** use `repMap`. A substitution can only pick one.

<!--- cspell:ignore bæt eacute nbsp --->
