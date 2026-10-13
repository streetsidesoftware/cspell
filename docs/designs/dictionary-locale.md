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
- **Dictionary authors in cspell-dicts:** a language dictionary declares its locale in `dictionaryInformation.locale`.
  The language dictionaries, `tr-tr` among them, already do
  ([cspell-dicts#5893](https://github.com/streetsidesoftware/cspell-dicts/pull/5893)).
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

### Deliverables

The feature ships in three parts. This design covers the first. The other two are improvements that follow.

1. **Valid words are no longer reported.** Looking up a word uses its dictionary's locale. This fixes #6282.
2. **Suggestions work as expected.** For `İncelemee`, cspell suggests `İnceleme`, not `Inceleme`. Today suggestions
   are found from the default lower-case form, and their case is matched with the document's locale (`language`), not
   the dictionary's. With `"language": "en,tr"` that's English.
3. **`cspell-tools` builds dictionaries with the locale's rules.** Today every dictionary's case-insensitive forms are
   made with the default rules, so `Irak` is stored as `irak`, not `ırak`.

Until the third part ships, every dictionary is built with the default rules, and the first part has to work with
them.

### Out of scope

- Case rules JavaScript doesn't implement, such as the Dutch `IJ` digraph (`ijsland` to `IJsland`). cspell uses what
  `toLocaleLowerCase` and `toLocaleUpperCase` provide, and adds no rules of its own.
- Choosing dictionaries by locale. `languageSettings` already does that, and it doesn't change.
- Other text handling that depends on the locale, such as where words split, or Unicode normalization beyond changing
  case.

## Design

A dictionary can declare its locale. When cspell changes case to look up a word in that dictionary, it uses that
locale's rules. When case is ignored, it also keeps trying the forms it tries today. A dictionary without a locale
behaves as today.

For example, `@cspell/dict-tr-tr` declares its locale, as it does since cspell-dicts#5893:

```jsonc
"dictionaryDefinitions": [
    { "name": "tr-tr", "path": "./Turkish.trie.gz", "dictionaryInformation": { "locale": "tr-TR" } }
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

### Whose locale

The dictionary's locale decides how case changes when looking up a word in it. Each dictionary's words are written in
its own language, so its own rules apply, and dictionaries in different languages don't interfere: with
`"language": "en,tr"`, `İnceleme` and `Inside` both pass, whatever the order of the list.

A dictionary declares its locale in `dictionaryInformation.locale`, a field that already exists and is documented as the
locale of the dictionary. Suggestions already use it when weighing suggestions. The language dictionaries in
cspell-dicts set it. This field used to only tune suggestions. Now it also changes what gets flagged, and its doc
comment says so.

The value is a comma-separated list, such as `tr,tr-TR`, read the same way cspell reads locales elsewhere. The locale is
resolved once, when the dictionary is loaded. Lookups only use the result, so they do no extra work to read it.

A dictionary without a locale uses the default rules, as today. That covers dictionaries with no single language
(names, companies, software terms), third-party dictionaries that don't set one, and the user's own word lists
(`words`, `ignoreWords`, `flagWords`, and `cspell:` comments). Their results never depend on the document.

Turned down:

- **The document's locales (`language`).** No dictionary would need a locale, but every dictionary would use the same
  rules. With Turkish rules, the English dictionary looks up `Inside` as `ınside` and reports it. Avoiding that means
  picking one locale by the order of the list, or trying every locale's rules, which lets `İnside` pass in any
  document that lists `tr`. The same applies as a fallback for dictionaries without a locale: a names dictionary would
  let `İnside` pass whenever `tr` is listed.
- **The locale of the `languageSettings` entry that enables the dictionary.** That locale is a filter that says when
  settings apply, not what language a dictionary's words are in. It can be `*` or a list, and several entries can
  enable the same dictionary.
- **A new `locale` field on the dictionary definition.** Easier to find, but a new public name, and two locale fields
  could disagree.
- **The text's locale,** such as a locale for one part of a file. cspell has no such thing today.

### Ignoring case and matching case

A lookup changes case in two ways: it lower-cases the word, and it capitalizes an all-caps word (`İSTANBUL` to
`İstanbul`, where the default rules leave a combining dot, U+0307, after the `i`). In a dictionary with a locale, both
follow the locale.

**When case is ignored** (the default), a lookup tries the locale's forms and today's forms. Until `cspell-tools`
builds with the locale, every dictionary stores its case-insensitive forms the default way: `Irak` as `irak`, not
`ırak`. Trying today's forms too means nothing that passes today starts being reported.

- `İnceleme`, `Ispanak`, and `IŞIK` pass through the Turkish forms.
- `IRAK` passes through today's form, as it does today.
- `ISIM` (Turkish writes `İSİM`) passes through today's form `isim`, as it does today.

The two sets of forms only differ for words where the locale's rules matter, such as Turkish words with `I` or `İ`, so
other words cost nothing extra.

**When case matters** (`caseSensitive: true`), a lookup tries only the locale's forms. This mode compares against the
words as the dictionary stores them, not the case-insensitive forms building adds, so how the dictionary was built
doesn't matter.

- `IRAK` passes through its capitalized form `Irak`.
- `İSTANBUL` passes through `İstanbul`. Today it's reported.
- `Inceleme` (Turkish writes `İnceleme`) and `ISIM` are reported as wrong case. Today they pass, because the default
  rules lower-case them to `inceleme` and `isim`.

Users of this mode asked for case to matter, and the only words newly reported have capitals that are wrong in the
dictionary's language.

Turned down:

- **Only the locale's forms when case is ignored.** Stricter, but until dictionaries are built with the locale, words
  like `IRAK` would start being reported.
- **Today's forms too when case matters.** Nothing would be newly reported, but wrong capitals like `Inceleme` would
  keep passing in the mode meant to catch them.

<!---
    cspell:ignore inceleme İnceleme İNCELEME ispanak ıspanak ispanakk ışık IŞIK irak ırak ijsland jsland İnside isim ISIM İSİM İstanbul İSTANBUL İncelemee ınside
-->
