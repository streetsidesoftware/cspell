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

True to enable compound word checking.

**`default`** false

#### Inherited from

[BaseSetting](BaseSetting.md).[allowCompoundWords](BaseSetting.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:300](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L300)

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

[CSpellSettingsDef.ts:311](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L311)

___

### description

• `Optional` **description**: `string`

Optional description of configuration

#### Inherited from

[BaseSetting](BaseSetting.md).[description](BaseSetting.md#description)

#### Defined in

[CSpellSettingsDef.ts:279](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L279)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use.
Each entry should match the name of the dictionary.
To remove a dictionary from the list add `!` before the name.
i.e. `!typescript` will turn off the dictionary with the name `typescript`.

#### Inherited from

[BaseSetting](BaseSetting.md).[dictionaries](BaseSetting.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:322](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L322)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries

#### Inherited from

[BaseSetting](BaseSetting.md).[dictionaryDefinitions](BaseSetting.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:314](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L314)

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

[CSpellSettingsDef.ts:135](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L135)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled

**`default`** true

#### Inherited from

[BaseSetting](BaseSetting.md).[enabled](BaseSetting.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:285](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L285)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Defined in

[CSpellSettingsDef.ts:117](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L117)

___

### flagWords

• `Optional` **flagWords**: `string`[]

list of words to always be considered incorrect.

#### Inherited from

[BaseSetting](BaseSetting.md).[flagWords](BaseSetting.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:291](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L291)

___

### id

• `Optional` **id**: `string`

Optional identifier

#### Inherited from

[BaseSetting](BaseSetting.md).[id](BaseSetting.md#id)

#### Defined in

[CSpellSettingsDef.ts:273](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L273)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href

#### Inherited from

[BaseSetting](BaseSetting.md).[ignoreRegExpList](BaseSetting.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:340](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L340)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Inherited from

[BaseSetting](BaseSetting.md).[ignoreWords](BaseSetting.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:294](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L294)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Inherited from

[BaseSetting](BaseSetting.md).[includeRegExpList](BaseSetting.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:346](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L346)

___

### language

• `Optional` **language**: `string`

Current active spelling language.

Example: "en-GB" for British English

Example: "en,nl" to enable both English and Dutch

**`default`** "en"

#### Defined in

[CSpellSettingsDef.ts:114](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L114)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Defined in

[CSpellSettingsDef.ts:141](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L141)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

#### Defined in

[CSpellSettingsDef.ts:138](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L138)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[maxDuplicateProblems](ReportingConfiguration.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:155](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L155)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[maxNumberOfProblems](ReportingConfiguration.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:149](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L149)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[minWordLength](ReportingConfiguration.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:161](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L161)

___

### name

• `Optional` **name**: `string`

Optional name of configuration

#### Inherited from

[BaseSetting](BaseSetting.md).[name](BaseSetting.md#name)

#### Defined in

[CSpellSettingsDef.ts:276](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L276)

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

[CSpellSettingsDef.ts:333](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L333)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make

**`default`** 10

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[numSuggestions](ReportingConfiguration.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:169](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L169)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList

#### Inherited from

[BaseSetting](BaseSetting.md).[patterns](BaseSetting.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:349](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L349)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[PnPSettings](PnPSettings.md).[pnpFiles](PnPSettings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:208](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L208)

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

[CSpellSettingsDef.ts:185](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L185)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[ReportingConfiguration](ReportingConfiguration.md).[suggestionsTimeout](ReportingConfiguration.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:175](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L175)

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

[CSpellSettingsDef.ts:201](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L201)

___

### words

• `Optional` **words**: `string`[]

list of words to be always considered correct

#### Inherited from

[BaseSetting](BaseSetting.md).[words](BaseSetting.md#words)

#### Defined in

[CSpellSettingsDef.ts:288](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L288)
