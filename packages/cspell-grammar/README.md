# `cspell-grammar`

CSpell Grammar is used to generate a parser. The Parser is used to add context / scope to parts of a document, making it easier to define the parts to spell spell checked.

This is to address the issues and limitations related to `ignoreRegExpList` and `includeRegExpList`.

The parser is use to add `scope` to sections of a document. The `scope` can then be used to apply spell checking rules.

Example: Only check comments and strings

```yaml
rules:
  '*': false
  comment: true
  string: true
```

It can be even more powerful like controlling the language settings based upon scope.

```yaml
rules:
  comment:
    language: en
  string:
    language: en,fr
    dictionaries: ['marketing-terms'],
    caseSensitive: true
  string.javascript:
    caseSensitive: false
```

Rules are applied in the order they match the scope of the text.

When checking JavaScript files with the above example rules:

- strings will:
  - use the locale `en,fr`
  - the `marketing-terms` dictionary will be enabled
  - `caseSensitive` will be `true`
- everything else:
  - locale: `en`
  - `caseSensitive` will be `false`

At its core, `cspell-grammar` uses a simplified form of the TextMate grammar.

## Reasoning

Why use a grammar parser? Couldn't a colorizer / highlighter or a language AST be used?
At one level, needs of the spell checker are simpler and different from colorizers or language AST parsers.
The goal of a spell checker is to spell check **_relevant_** text. The spell check does not need to care about
the syntactical correctness of a document or presentation.

The goal of a grammar parser for the spell checker is to allow the user to decide:

1. What text should be checked.
1. Which dictionaries (or languages) should be used.
1. Are accents and case important

Note: CSpell is a pure JavaScript application, so including the Oniguruma is not an option.

### Considerations

- Parsing a document should be fast - meaning the grammar should be as simple as possible to meet
  the needs of the spell checker and not focus on scope detail. This is where a colorizer grammar is
  not a good fit to be used.
- AST's are a bit of an overkill for a spell checker. They provide too much detail while not bringing much benefit
  from the detail.

## Transformation

Consider the following bit of LaTeX:

```latex
k\"{o}nnen
können
```

<!--- cspell:ignore können nnen   -->

For the spell checker to work correctly, the `\"{o}` should be transformed into `ö` before it is checked against the German dictionary.

This creates a few challenges.

Possible options:

1. Simple whole document substitution
   - Challenges
     - It is not context aware and might replace the wrong text.
     - It changes the location of the words and messes up issue reporting (some sort of Map would be needed to get the correct line / character offset).

- Advantages
  - Easy to implement except for the context and mapping.

1. Scope level substitution
   Transformations occur at the scope level.
   - Challenges
     - offset mapping is still and issue (maybe)
     - need a way to merge text with adjacent scopes after transformation
   - Advantages
     - it is context aware
