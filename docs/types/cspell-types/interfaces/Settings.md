[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / Settings

# Interface: Settings

## Hierarchy

- [`ReportingConfiguration`](ReportingConfiguration.md)

- [`BaseSetting`](BaseSetting.md)

- [`PnPSettings`](PnPSettings.md)

  ↳ **`Settings`**

  ↳↳ [`ExtendableSettings`](ExtendableSettings.md)

  ↳↳ [`OverrideSettings`](OverrideSettings.md)

## Table of contents

### Properties

- [allowCompoundWords](Settings.md#allowcompoundwords)
- [caseSensitive](Settings.md#casesensitive)
- [description](Settings.md#description)
- [dictionaries](Settings.md#dictionaries)
- [dictionaryDefinitions](Settings.md#dictionarydefinitions)
- [enableFiletypes](Settings.md#enablefiletypes)
- [enabled](Settings.md#enabled)
- [enabledLanguageIds](Settings.md#enabledlanguageids)
- [flagWords](Settings.md#flagwords)
- [id](Settings.md#id)
- [ignoreRegExpList](Settings.md#ignoreregexplist)
- [ignoreWords](Settings.md#ignorewords)
- [includeRegExpList](Settings.md#includeregexplist)
- [language](Settings.md#language)
- [languageId](Settings.md#languageid)
- [languageSettings](Settings.md#languagesettings)
- [loadDefaultConfiguration](Settings.md#loaddefaultconfiguration)
- [maxDuplicateProblems](Settings.md#maxduplicateproblems)
- [maxNumberOfProblems](Settings.md#maxnumberofproblems)
- [minWordLength](Settings.md#minwordlength)
- [name](Settings.md#name)
- [noSuggestDictionaries](Settings.md#nosuggestdictionaries)
- [numSuggestions](Settings.md#numsuggestions)
- [patterns](Settings.md#patterns)
- [pnpFiles](Settings.md#pnpfiles)
- [suggestionNumChanges](Settings.md#suggestionnumchanges)
- [suggestionsTimeout](Settings.md#suggestionstimeout)
- [usePnP](Settings.md#usepnp)
- [words](Settings.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.

**`default`** false

#### Inherited from

[BaseSetting](BaseSetting.md).[allowCompoundWords](BaseSetting.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:434](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L434)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`default`** false

#### Inherited from

[BaseSetting](BaseSetting.md).[caseSensitive](BaseSetting.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:445](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L445)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

#### Inherited from

[BaseSetting](BaseSetting.md).[description](BaseSetting.md#description)

#### Defined in

[CSpellSettingsDef.ts:409](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L409)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use. Each entry should match the name of the dictionary.

To remove a dictionary from the list, add `!` before the name.

For example, `!typescript` will turn off the dictionary with the name `typescript`.

See the [Dictionaries](https://cspell.org/docs/dictionaries/)
and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.

#### Inherited from

[BaseSetting](BaseSetting.md).[dictionaries](BaseSetting.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:471](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L471)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries.

For example, you can use the following to add a custom dictionary:

```json
"dictionaryDefinitions": [
  { "name": "custom-words", "path": "./custom-words.txt"}
],
"dictionaries": ["custom-words"]
```

#### Inherited from

[BaseSetting](BaseSetting.md).[dictionaryDefinitions](BaseSetting.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:459](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L459)

___

### enableFiletypes

• `Optional` **enableFiletypes**: `string`[]

**`title`** File Types to Check

**`scope`** resource

**`uniqueitems`** true

**`markdowndescription`**
Enable / Disable checking file types (languageIds).
These are in additional to the file types specified by `cSpell.enabledLanguageIds`.
To disable a language, prefix with `!` as in `!json`,

Example:
```
jsonc       // enable checking for jsonc
!json       // disable checking for json
kotlin      // enable checking for kotlin
```

#### Defined in

[CSpellSettingsDef.ts:200](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L200)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`default`** true

#### Inherited from

[BaseSetting](BaseSetting.md).[enabled](BaseSetting.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:415](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L415)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Defined in

[CSpellSettingsDef.ts:182](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L182)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect.

#### Inherited from

[BaseSetting](BaseSetting.md).[flagWords](BaseSetting.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:421](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L421)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Inherited from

[BaseSetting](BaseSetting.md).[id](BaseSetting.md#id)

#### Defined in

[CSpellSettingsDef.ts:403](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L403)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href.

By default, several patterns are excluded. See
[Configuration](https://cspell.org/configuration/#cspelljson-sections) for more details.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Inherited from

[BaseSetting](BaseSetting.md).[ignoreRegExpList](BaseSetting.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:495](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L495)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

#### Inherited from

[BaseSetting](BaseSetting.md).[ignoreWords](BaseSetting.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Inherited from

[BaseSetting](BaseSetting.md).[includeRegExpList](BaseSetting.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:505](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L505)

___

### language

• `Optional` **language**: `string`

Current active spelling language. This specifies the language locale to use in choosing the
general dictionary.

For example:

- "en-GB" for British English.
- "en,nl" to enable both English and Dutch.

**`default`** "en"

#### Defined in

[CSpellSettingsDef.ts:179](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L179)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Defined in

[CSpellSettingsDef.ts:210](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L210)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.

#### Defined in

[CSpellSettingsDef.ts:207](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L207)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
will prevent ALL default configuration from being loaded.

**`default`** true

#### Defined in

[CSpellSettingsDef.ts:218](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L218)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[maxDuplicateProblems](ReportingConfiguration.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:234](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L234)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[maxNumberOfProblems](ReportingConfiguration.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:227](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L227)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[minWordLength](ReportingConfiguration.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:241](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L241)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Inherited from

[BaseSetting](BaseSetting.md).[name](BaseSetting.md#name)

#### Defined in

[CSpellSettingsDef.ts:406](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L406)

___

### noSuggestDictionaries

• `Optional` **noSuggestDictionaries**: `string`[]

Optional list of dictionaries that will not be used for suggestions.
Words in these dictionaries are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
one of these dictionaries, it will be removed from the set of
possible suggestions.

#### Inherited from

[BaseSetting](BaseSetting.md).[noSuggestDictionaries](BaseSetting.md#nosuggestdictionaries)

#### Defined in

[CSpellSettingsDef.ts:482](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L482)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`default`** 10

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[numSuggestions](ReportingConfiguration.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:250](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L250)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used with the `ignoreRegExpList` and
`includeRegExpList` options.

For example:

```javascript
"ignoreRegExpList": ["comments"],
"patterns": [
  {
    "name": "comment-single-line",
    "pattern": "/#.*​/g"
  },
  {
    "name": "comment-multi-line",
    "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
  },
  // You can also combine multiple named patterns into one single named pattern
  {
    "name": "comments",
    "pattern": ["comment-single-line", "comment-multi-line"]
  }
]
```

#### Inherited from

[BaseSetting](BaseSetting.md).[patterns](BaseSetting.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:532](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L532)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[PnPSettings](PnPSettings.md).[pnpFiles](PnPSettings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:291](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L291)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[suggestionNumChanges](ReportingConfiguration.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:268](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L268)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[suggestionsTimeout](ReportingConfiguration.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:257](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L257)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`default`** false

#### Inherited from

[PnPSettings](PnPSettings.md).[usePnP](PnPSettings.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:284](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L284)

___

### words

• `Optional` **words**: `string`[]

List of words to be always considered correct.

#### Inherited from

[BaseSetting](BaseSetting.md).[words](BaseSetting.md#words)

#### Defined in

[CSpellSettingsDef.ts:418](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L418)
