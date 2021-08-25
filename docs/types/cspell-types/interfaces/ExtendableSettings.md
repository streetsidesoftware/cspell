[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / ExtendableSettings

# Interface: ExtendableSettings

## Hierarchy

- [`Settings`](Settings.md)

  ↳ **`ExtendableSettings`**

  ↳↳ [`FileSettings`](FileSettings.md)

## Table of contents

### Properties

- [allowCompoundWords](ExtendableSettings.md#allowcompoundwords)
- [caseSensitive](ExtendableSettings.md#casesensitive)
- [description](ExtendableSettings.md#description)
- [dictionaries](ExtendableSettings.md#dictionaries)
- [dictionaryDefinitions](ExtendableSettings.md#dictionarydefinitions)
- [enableFiletypes](ExtendableSettings.md#enablefiletypes)
- [enabled](ExtendableSettings.md#enabled)
- [enabledLanguageIds](ExtendableSettings.md#enabledlanguageids)
- [flagWords](ExtendableSettings.md#flagwords)
- [id](ExtendableSettings.md#id)
- [ignoreRegExpList](ExtendableSettings.md#ignoreregexplist)
- [ignoreWords](ExtendableSettings.md#ignorewords)
- [includeRegExpList](ExtendableSettings.md#includeregexplist)
- [language](ExtendableSettings.md#language)
- [languageId](ExtendableSettings.md#languageid)
- [languageSettings](ExtendableSettings.md#languagesettings)
- [maxDuplicateProblems](ExtendableSettings.md#maxduplicateproblems)
- [maxNumberOfProblems](ExtendableSettings.md#maxnumberofproblems)
- [minWordLength](ExtendableSettings.md#minwordlength)
- [name](ExtendableSettings.md#name)
- [noSuggestDictionaries](ExtendableSettings.md#nosuggestdictionaries)
- [numSuggestions](ExtendableSettings.md#numsuggestions)
- [overrides](ExtendableSettings.md#overrides)
- [patterns](ExtendableSettings.md#patterns)
- [pnpFiles](ExtendableSettings.md#pnpfiles)
- [usePnP](ExtendableSettings.md#usepnp)
- [words](ExtendableSettings.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking.

**`default`** false

#### Inherited from

[Settings](Settings.md).[allowCompoundWords](Settings.md#allowcompoundwords)

#### Defined in

[settings/CSpellSettingsDef.ts:264](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L264)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Words must match case rules.

**`default`** false

#### Inherited from

[Settings](Settings.md).[caseSensitive](Settings.md#casesensitive)

#### Defined in

[settings/CSpellSettingsDef.ts:270](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L270)

___

### description

• `Optional` **description**: `string`

Optional description of configuration

#### Inherited from

[Settings](Settings.md).[description](Settings.md#description)

#### Defined in

[settings/CSpellSettingsDef.ts:243](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L243)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use.
Each entry should match the name of the dictionary.
To remove a dictionary from the list add `!` before the name.
i.e. `!typescript` will turn off the dictionary with the name `typescript`.

#### Inherited from

[Settings](Settings.md).[dictionaries](Settings.md#dictionaries)

#### Defined in

[settings/CSpellSettingsDef.ts:281](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L281)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries

#### Inherited from

[Settings](Settings.md).[dictionaryDefinitions](Settings.md#dictionarydefinitions)

#### Defined in

[settings/CSpellSettingsDef.ts:273](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L273)

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

#### Inherited from

[Settings](Settings.md).[enableFiletypes](Settings.md#enablefiletypes)

#### Defined in

[settings/CSpellSettingsDef.ts:119](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L119)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled

**`default`** true

#### Inherited from

[Settings](Settings.md).[enabled](Settings.md#enabled)

#### Defined in

[settings/CSpellSettingsDef.ts:249](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L249)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[Settings](Settings.md).[enabledLanguageIds](Settings.md#enabledlanguageids)

#### Defined in

[settings/CSpellSettingsDef.ts:101](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L101)

___

### flagWords

• `Optional` **flagWords**: `string`[]

list of words to always be considered incorrect.

#### Inherited from

[Settings](Settings.md).[flagWords](Settings.md#flagwords)

#### Defined in

[settings/CSpellSettingsDef.ts:255](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L255)

___

### id

• `Optional` **id**: `string`

Optional identifier

#### Inherited from

[Settings](Settings.md).[id](Settings.md#id)

#### Defined in

[settings/CSpellSettingsDef.ts:237](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L237)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href

#### Inherited from

[Settings](Settings.md).[ignoreRegExpList](Settings.md#ignoreregexplist)

#### Defined in

[settings/CSpellSettingsDef.ts:299](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L299)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Inherited from

[Settings](Settings.md).[ignoreWords](Settings.md#ignorewords)

#### Defined in

[settings/CSpellSettingsDef.ts:258](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L258)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Inherited from

[Settings](Settings.md).[includeRegExpList](Settings.md#includeregexplist)

#### Defined in

[settings/CSpellSettingsDef.ts:305](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L305)

___

### language

• `Optional` **language**: `string`

Current active spelling language.

Example: "en-GB" for British English

Example: "en,nl" to enable both English and Dutch

**`default`** "en"

#### Inherited from

[Settings](Settings.md).[language](Settings.md#language)

#### Defined in

[settings/CSpellSettingsDef.ts:98](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L98)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[Settings](Settings.md).[languageId](Settings.md#languageid)

#### Defined in

[settings/CSpellSettingsDef.ts:149](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L149)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

#### Inherited from

[Settings](Settings.md).[languageSettings](Settings.md#languagesettings)

#### Defined in

[settings/CSpellSettingsDef.ts:146](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L146)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[Settings](Settings.md).[maxDuplicateProblems](Settings.md#maxduplicateproblems)

#### Defined in

[settings/CSpellSettingsDef.ts:131](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L131)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[Settings](Settings.md).[maxNumberOfProblems](Settings.md#maxnumberofproblems)

#### Defined in

[settings/CSpellSettingsDef.ts:125](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L125)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[Settings](Settings.md).[minWordLength](Settings.md#minwordlength)

#### Defined in

[settings/CSpellSettingsDef.ts:137](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L137)

___

### name

• `Optional` **name**: `string`

Optional name of configuration

#### Inherited from

[Settings](Settings.md).[name](Settings.md#name)

#### Defined in

[settings/CSpellSettingsDef.ts:240](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L240)

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

[Settings](Settings.md).[noSuggestDictionaries](Settings.md#nosuggestdictionaries)

#### Defined in

[settings/CSpellSettingsDef.ts:292](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L292)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make

**`default`** 10

#### Inherited from

[Settings](Settings.md).[numSuggestions](Settings.md#numsuggestions)

#### Defined in

[settings/CSpellSettingsDef.ts:143](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L143)

___

### overrides

• `Optional` **overrides**: [`OverrideSettings`](OverrideSettings.md)[]

Overrides to apply based upon the file path.

#### Defined in

[settings/CSpellSettingsDef.ts:86](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L86)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList

#### Inherited from

[Settings](Settings.md).[patterns](Settings.md#patterns)

#### Defined in

[settings/CSpellSettingsDef.ts:308](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L308)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[Settings](Settings.md).[pnpFiles](Settings.md#pnpfiles)

#### Defined in

[settings/CSpellSettingsDef.ts:172](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L172)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`default`** false

#### Inherited from

[Settings](Settings.md).[usePnP](Settings.md#usepnp)

#### Defined in

[settings/CSpellSettingsDef.ts:165](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L165)

___

### words

• `Optional` **words**: `string`[]

list of words to be always considered correct

#### Inherited from

[Settings](Settings.md).[words](Settings.md#words)

#### Defined in

[settings/CSpellSettingsDef.ts:252](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L252)
