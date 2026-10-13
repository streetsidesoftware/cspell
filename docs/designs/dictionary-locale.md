# Dictionary Locale

## Why

Languages differ in how letters change case. cspell uses the same case rules for every language. When a language's
rules differ from the default ones, words in its dictionary aren't found and are reported as misspellings.

Turkish is one example ([#6282](https://github.com/streetsidesoftware/cspell/issues/6282)). With `"language": "en,tr"`,
the words `İnceleme` and `Ispanak` are reported, while `inceleme` and `ıspanak` pass.

cspell changes case in two places, and both use the default rules:

- **Looking up a word.** When a word isn't found as written, cspell looks up other forms of it, such as its lower-case
  form. The default rules turn `İ` into `i` followed by a combining dot (U+0307), and `I` into `i`. The Turkish
  dictionary has `i` and `ı`.
- **Building a dictionary.** The `cspell-tools` package adds a lower-case form of each word, so lookups can ignore case.
  It stores `Irak` as `irak`, where Turkish has `ırak`.

A contributor proposed a fix for #6282 in [#9417](https://github.com/streetsidesoftware/cspell/pull/9417). It applies
Turkish rules to every dictionary. With English only, a word typed with `İ`, such as `İnside`, would then pass, and each
further language would need its own special case. This design describes a fix that works for any language.

### Who it affects

Only dictionaries whose language has its own case rules. Of the locales the dictionaries in cspell-dicts declare,
JavaScript has its own case rules for Turkish (`tr`), Azerbaijani (`az`), Lithuanian (`lt`), and Greek (`el`). Greek's
rules only affect upper-casing, which this design doesn't use.

- **Users of the Turkish, Azerbaijani, and Lithuanian dictionaries:** words in those dictionaries are no longer
  reported. No config change is needed.
- **Everyone else:** no change.

### Success

- With `"language": "en,tr"`, `İnceleme`, `Ispanak`, `İNCELEME`, and `IŞIK` pass. Misspellings such as `Ispanakk` are
  still reported.
- With `"language": "en"`, `İnside` is still reported. Turkish rules apply only to the Turkish dictionary.
- A dictionary gets its language's case rules by declaring its locale. cspell's code has no rules for specific
  languages.

### Deliverables

The feature ships in three parts. This design covers the first. The other two are improvements that follow.

1. **Valid words are no longer reported.** Looking up a word uses its dictionary's locale. This fixes #6282.
2. **Suggestions work as expected.** For `İncelemee`, cspell suggests `İnceleme`, not `Inceleme`. Suggestions are
   found from the default lower-case form, and their case is matched with the document's locale (`language`), not the
   dictionary's. With `"language": "en,tr"`, that locale is English.
3. **The `cspell-tools` package builds dictionaries with the locale's rules,** so `Irak` is stored as `ırak`.

Until the third part ships, every dictionary is built with the default rules, and the first part has to work with them.

## Design

A dictionary can declare its locale. When cspell changes case to look up a word in that dictionary, it uses that
locale's rules. When case is ignored, it also tries the forms it uses today. A dictionary without a locale works as it
does today.

For example, the Turkish dictionary declares its locale
([cspell-dicts#5893](https://github.com/streetsidesoftware/cspell-dicts/pull/5893)):

```jsonc
"dictionaryDefinitions": [
    { "name": "tr-tr", "path": "./Turkish.trie.gz", "dictionaryInformation": { "locale": "tr-TR" } }
]
```

The user's config doesn't change:

```jsonc
{ "language": "en,tr" }
```

The words `İnceleme`, `Ispanak`, and `İNCELEME` pass, and `Ispanakk` is still reported. With `"language": "en"`,
`İnside` is still reported, because the English dictionary doesn't have a Turkish locale.

Turned down:

- **Turkish rules for every dictionary** (#9417). No dictionary needs a locale, but words typed with `İ` pass in every
  language, and each further language needs its own special case.

### Whose locale

The dictionary's locale decides how case changes when cspell looks up a word in it. A dictionary's words are in its own
language, so its own rules apply. Dictionaries in different languages don't affect each other. With
`"language": "en,tr"`, both `İnceleme` and `Inside` pass, whatever the order of the list.

A dictionary declares its locale in `dictionaryInformation.locale`. The field already exists, and is documented as the
locale of the dictionary. Until now it only tuned suggestions. Now it also changes which words are reported, and its
doc comment says so. The language dictionaries in cspell-dicts set it.

cspell reads the locale once, when the dictionary is loaded, so lookups do no extra work. The locale is normalized in
the same way as the document's locale when cspell matches the case of suggestions. An invalid locale is dropped without
a message, and the dictionary works as one without a locale. Reporting invalid values is left to configuration
validation ([#9450](https://github.com/streetsidesoftware/cspell/issues/9450)).

A dictionary without a locale uses the default rules. This includes dictionaries with no single language (names,
companies, software terms), third-party dictionaries that don't set a locale, and the user's own word lists (`words`,
`ignoreWords`, `flagWords`, and `cspell:` comments). Their results don't depend on the document.

A dictionary marked as not case-sensitive keeps the legacy lookup and doesn't use its locale.

Turned down:

- **The document's locales (`language`).** No dictionary would need a locale, but every dictionary would use the same
  rules. With Turkish rules, the English dictionary looks up `Inside` as `ınside` and reports it. To avoid that, cspell
  would have to pick one locale by the order of the list, or try every locale's rules, which lets `İnside` pass in any
  document that lists `tr`. The same problem applies to dictionaries without a locale: a names dictionary would let
  `İnside` pass whenever `tr` is listed.
- **The locale of the `languageSettings` entry that enables the dictionary.** That locale is a filter that says when
  settings apply, not what language a dictionary's words are in. It can be `*` or a list, and several entries can
  enable the same dictionary.
- **A new `locale` field on the dictionary definition.** It's easier to find, but it's a new public name, and two
  locale fields could disagree.
- **The text's locale,** such as a locale for one part of a file. cspell doesn't have one.

### Ignoring case and matching case

A lookup lower-cases the word with the dictionary's locale. When case matters, it also tries an all-caps word in its
capitalized form, so `HOUSE` matches `House`. The capitalized form keeps the first letter as written, and lower-cases
the rest with the locale: `İSTANBUL` gives `İstanbul`, and `ΆΝΘΡΩΠΟΣ` gives `Άνθρωπος`.
Dictionaries without a locale make the capitalized form the same way, with the default rules. This is the one change
for them: an all-caps word whose first letter doesn't survive being lower-cased and upper-cased again, such as
`İSTANBUL`, can now be found.

Turned down: upper-casing the first letter with the locale. Greek upper-casing removes accents, so `άνθρωπος` would give
`Ανθρωπος`, and miss `Άνθρωπος`, which is found today. The default rules leave a combining dot after the `i` in
`İSTANBUL`.

**When case is ignored** (the default), a lookup tries the locale's forms and the forms it uses today. Until the
`cspell-tools` package builds with the locale, every dictionary stores its case-insensitive forms with the default
rules: `Irak` as `irak`, not `ırak`. Because today's forms are still tried, no word that passes today is reported.

- The words `İnceleme`, `Ispanak`, and `IŞIK` pass through the Turkish forms.
- The word `IRAK` passes through today's form, as it does today.
- The word `ISIM` (Turkish writes `İSİM`) passes through today's form `isim`, as it does today.

The two sets of forms differ only for words where the locale's rules matter, such as Turkish words with `I` or `İ`.
Other words don't need extra lookups.

**When case matters** (`caseSensitive: true`), a lookup tries only the locale's forms. In this mode, words are compared
with the dictionary's words as written, not with the case-insensitive forms, so how the dictionary was built doesn't
matter.

- The word `IRAK` passes through its capitalized form `Irak`.
- The word `İSTANBUL` passes through `İstanbul`. Today it's reported.
- The words `Inceleme` (Turkish writes `İnceleme`) and `ISIM` are reported as wrong case. Today they pass, because the
  default rules lower-case them to `inceleme` and `isim`.

This mode is for users who want case to matter. The only words that are newly reported have capitals that are wrong
in the dictionary's language.

Turned down:

- **Only the locale's forms when case is ignored.** It's stricter, but until dictionaries are built with the locale,
  words such as `IRAK` would be reported.
- **Today's forms too when case matters.** No word would be newly reported, but wrong capitals such as `Inceleme` would
  pass in the mode meant to catch them.

<!---
    cspell:ignore inceleme İnceleme İNCELEME ispanak ıspanak ispanakk ışık IŞIK irak ırak İnside isim ISIM İSİM İstanbul İSTANBUL İncelemee ınside άνθρωπος Άνθρωπος Ανθρωπος ΆΝΘΡΩΠΟΣ
-->
