# Dictionary Locale

## Why

Languages differ in how letters change case. cspell changes case with the same rules for every language, so when a
language's rules differ from the default, words its dictionary contains can't be found and are reported as
misspellings. Turkish `İ` and `I` ([#6282](https://github.com/streetsidesoftware/cspell/issues/6282)) are one example:
with `"language": "en,tr"`, `İnceleme` and `Ispanak` are reported, while `inceleme` and `ıspanak` pass.

Case changes in two places, and both use the default rules:

- **Looking up a word.** When a word isn't found as written, cspell looks up other forms of it, such as its lower-case
  form. The default rules turn `İ` into `i` followed by a combining dot, and `I` into `i`. A Turkish dictionary has `i`
  and `ı`.
- **Building a dictionary.** `cspell-tools` adds lower-case forms of each word so lookups can ignore case. A dictionary
  word with a capital `I`, such as `Irak`, is stored as `irak`, where Turkish expects `ırak`.

Why now: a contributor opened a fix for #6282
([#9417](https://github.com/streetsidesoftware/cspell/pull/9417)) that applies Turkish rules to every dictionary. With
English only, a word typed with `İ`, such as `İnside`, would then pass, and each further language would need another
special case. The general approach needs deciding so the PR can be answered with a fix that scales.

### Who it affects

- **People writing in a language whose case rules differ from the default** (Turkish, Azerbaijani, Lithuanian): words
  their dictionary contains are no longer reported. They don't need to change their config.
- **Dictionary authors in cspell-dicts:** a dictionary may need to declare its locale. Today `tr-tr` doesn't, and
  `az-az` does, in `dictionaryInformation.locale`. Dictionaries that declare one need a rebuild.
- **Projects using `cspell-lib` or `cspell-dictionary`:** creating or looking up a dictionary may take a locale. Changes
  to the public API stay backward compatible.
- **The VS Code extension, the ESLint plugin, and cspell-action:** they get the fix through `cspell-lib`, and give the
  same results as the CLI.
- **Everyone else:** nothing changes. Dictionaries without locale-specific case rules behave as before, and lookups cost
  no more.

### Success

- With `"language": "en,tr"`, `İnceleme`, `Ispanak`, `İNCELEME`, and `IŞIK` pass, and misspellings like `Ispanakk` are
  still reported.
- With `"language": "en"` only, `İnside` is still reported. Turkish rules apply only to Turkish dictionaries.
- A dictionary for any language gets that language's case rules by declaring its locale, with no change to cspell's
  code.

### Out of scope

- Case rules JavaScript doesn't implement, such as the Dutch `IJ` digraph (`ijsland` to `IJsland`). cspell uses what
  `toLocaleLowerCase` and `toLocaleUpperCase` provide, and adds no rules of its own.
- Building dictionaries with the locale's rules. Lookups try both rules, so dictionaries built with the default rules
  work. The one case left is lower-case input that differs from the stored form: with `Irak` in the dictionary, `ırak`
  is still reported, as it is today. A `locale` setting for `cspell-tools` could fix that later.
- Choosing dictionaries by locale. `languageSettings` already does that, and it doesn't change.
- Other text handling that depends on the locale, such as where words split, or Unicode normalization beyond changing
  case.

## Design

A dictionary can declare its locale. When cspell changes case to look up a word in that dictionary, it also tries the
forms that locale's rules give. A dictionary without a locale behaves as today.

For example, `@cspell/dict-tr-tr` declares its locale:

```jsonc
"dictionaryDefinitions": [
    { "name": "tr-tr", "path": "./Turkish.trie.gz", "dictionaryInformation": { "locale": "tr" } }
]
```

The user's config doesn't change:

```jsonc
{ "language": "en,tr" }
```

`İnceleme`, `Ispanak`, and `İNCELEME` pass, and `Ispanakk` is still reported. With `"language": "en"`, `İnside` is
still reported, because the English dictionary has no Turkish locale.

Turned down:

- **Turkish rules for every dictionary** (#9417). It needs no locale, but words typed with `İ` pass in every language,
  and each further language needs its own special case.

### Lookups try both rules

A dictionary with a locale is searched with the forms the locale's rules give, and with the forms cspell tries today.
The two only differ for words where the locale's rules matter, such as Turkish words with `I` or `İ`, so other words
cost nothing extra. Both case changes a lookup makes follow the locale: the lower-case form, and the capitalized form of
an all-caps word (`İSTANBUL` to `İstanbul`, where the default rules leave a combining dot, U+0307, after the `i`).

- `İnceleme`, `Ispanak`, and `IŞIK` pass through the Turkish forms.
- `IRAK` with `ignoreCase` is still found through today's form, even in a dictionary built before this change. Every
  dictionary is built with the default rules, which store `Irak` as `irak`, not `ırak`.
- `ISIM` (Turkish writes `İSİM`) passes through today's form `isim`. It passes today too.

So declaring a locale never makes a dictionary flag a word that passes today, and published dictionaries work without
a rebuild.

Turned down:

- **The locale's forms only.** Stricter: `ISIM` would be reported. But every dictionary that declares a locale would
  need a rebuild with that locale, or words like `IRAK` would start being reported.

### Where the locale is declared

A dictionary declares its locale in `dictionaryInformation.locale`, a field that already exists and is documented as the
locale of the dictionary. Suggestions already use it to change case when weighing suggestions, so lookups and
suggestions agree. The Azerbaijani dictionary already sets it. The Turkish dictionary needs to add it.

This field used to only tune suggestions. Now it also changes what gets flagged, and its doc comment says so.

The value is a comma-separated list, such as `tr,tr-TR`. cspell reads it the way it already reads the document's
locale when matching the case of suggestions: `tr_TR` is read as `tr-TR`, and the first locale in the list that
JavaScript supports is used. A value that isn't a valid locale, such as `*`, isn't meaningful here, but nothing rejects it when a config
is loaded. cspell then uses the default rules, so a bad value can't crash cspell or flag more words than before.

Turned down:

- **A new `locale` field on the dictionary definition.** Easier to find, but a new public name, and two locale fields
  could disagree.
- **The locale of the `languageSettings` entry that enables the dictionary.** Dictionaries would need no change, but
  that locale is a filter: it can be `*` or a list, and several entries can enable the same dictionary. A dictionary
  would behave differently depending on which config enabled it.

## Open questions

- A `locale` setting for `cspell-tools`, so building a dictionary uses the locale's rules too.
- Should `dictionaryInformation.locale` reject values that aren't locales? Today the schema allows any string.

<!---
    cspell:ignore inceleme İnceleme İNCELEME ispanak ıspanak ispanakk ışık IŞIK irak ırak ijsland jsland İnside isim ISIM İSİM İstanbul İSTANBUL
-->
