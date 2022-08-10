[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / OverrideSettings

# Interface: OverrideSettings

## Hierarchy

- [`Settings`](Settings.md)

- [`OverrideFilterFields`](OverrideFilterFields.md)

  ↳ **`OverrideSettings`**

## Table of contents

### Properties

- [allowCompoundWords](OverrideSettings.md#allowcompoundwords)
- [caseSensitive](OverrideSettings.md#casesensitive)
- [description](OverrideSettings.md#description)
- [dictionaries](OverrideSettings.md#dictionaries)
- [dictionaryDefinitions](OverrideSettings.md#dictionarydefinitions)
- [enableFiletypes](OverrideSettings.md#enablefiletypes)
- [enabled](OverrideSettings.md#enabled)
- [enabledLanguageIds](OverrideSettings.md#enabledlanguageids)
- [filename](OverrideSettings.md#filename)
- [flagWords](OverrideSettings.md#flagwords)
- [id](OverrideSettings.md#id)
- [ignoreRegExpList](OverrideSettings.md#ignoreregexplist)
- [ignoreWords](OverrideSettings.md#ignorewords)
- [includeRegExpList](OverrideSettings.md#includeregexplist)
- [language](OverrideSettings.md#language)
- [languageId](OverrideSettings.md#languageid)
- [languageSettings](OverrideSettings.md#languagesettings)
- [loadDefaultConfiguration](OverrideSettings.md#loaddefaultconfiguration)
- [maxDuplicateProblems](OverrideSettings.md#maxduplicateproblems)
- [maxNumberOfProblems](OverrideSettings.md#maxnumberofproblems)
- [minWordLength](OverrideSettings.md#minwordlength)
- [name](OverrideSettings.md#name)
- [noSuggestDictionaries](OverrideSettings.md#nosuggestdictionaries)
- [numSuggestions](OverrideSettings.md#numsuggestions)
- [parser](OverrideSettings.md#parser)
- [patterns](OverrideSettings.md#patterns)
- [pnpFiles](OverrideSettings.md#pnpfiles)
- [suggestionNumChanges](OverrideSettings.md#suggestionnumchanges)
- [suggestionsTimeout](OverrideSettings.md#suggestionstimeout)
- [usePnP](OverrideSettings.md#usepnp)
- [words](OverrideSettings.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

#### Inherited from

[Settings](Settings.md).[allowCompoundWords](Settings.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:440](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L440)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

#### Inherited from

[Settings](Settings.md).[caseSensitive](Settings.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:451](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L451)

___

### description

• `Optional` **description**: `string`

#### Inherited from

[Settings](Settings.md).[description](Settings.md#description)

#### Defined in

[CSpellSettingsDef.ts:415](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L415)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

#### Inherited from

[Settings](Settings.md).[dictionaries](Settings.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:477](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L477)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

#### Inherited from

[Settings](Settings.md).[dictionaryDefinitions](Settings.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:465](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L465)

___

### enableFiletypes

• `Optional` **enableFiletypes**: `string`[]

#### Inherited from

[Settings](Settings.md).[enableFiletypes](Settings.md#enablefiletypes)

#### Defined in

[CSpellSettingsDef.ts:206](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L206)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Inherited from

[Settings](Settings.md).[enabled](Settings.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:421](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L421)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

#### Inherited from

[Settings](Settings.md).[enabledLanguageIds](Settings.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:188](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L188)

___

### filename

• **filename**: [`Glob`](../modules.md#glob) \| [`Glob`](../modules.md#glob)[]

#### Inherited from

[OverrideFilterFields](OverrideFilterFields.md).[filename](OverrideFilterFields.md#filename)

#### Defined in

[CSpellSettingsDef.ts:404](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L404)

___

### flagWords

• `Optional` **flagWords**: `string`[]

#### Inherited from

[Settings](Settings.md).[flagWords](Settings.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

___

### id

• `Optional` **id**: `string`

#### Inherited from

[Settings](Settings.md).[id](Settings.md#id)

#### Defined in

[CSpellSettingsDef.ts:409](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L409)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

#### Inherited from

[Settings](Settings.md).[ignoreRegExpList](Settings.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:501](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L501)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

#### Inherited from

[Settings](Settings.md).[ignoreWords](Settings.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:433](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L433)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

#### Inherited from

[Settings](Settings.md).[includeRegExpList](Settings.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:511](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L511)

___

### language

• `Optional` **language**: `string`

#### Overrides

[Settings](Settings.md).[language](Settings.md#language)

#### Defined in

[CSpellSettingsDef.ts:399](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L399)

___

### languageId

• `Optional` **languageId**: `string`

#### Overrides

[Settings](Settings.md).[languageId](Settings.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:396](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L396)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

#### Inherited from

[Settings](Settings.md).[languageSettings](Settings.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:213](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L213)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

#### Inherited from

[Settings](Settings.md).[loadDefaultConfiguration](Settings.md#loaddefaultconfiguration)

#### Defined in

[CSpellSettingsDef.ts:224](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L224)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

#### Inherited from

[Settings](Settings.md).[maxDuplicateProblems](Settings.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:240](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L240)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

#### Inherited from

[Settings](Settings.md).[maxNumberOfProblems](Settings.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:233](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L233)

___

### minWordLength

• `Optional` **minWordLength**: `number`

#### Inherited from

[Settings](Settings.md).[minWordLength](Settings.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:247](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L247)

___

### name

• `Optional` **name**: `string`

#### Inherited from

[Settings](Settings.md).[name](Settings.md#name)

#### Defined in

[CSpellSettingsDef.ts:412](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L412)

___

### noSuggestDictionaries

• `Optional` **noSuggestDictionaries**: `string`[]

#### Inherited from

[Settings](Settings.md).[noSuggestDictionaries](Settings.md#nosuggestdictionaries)

#### Defined in

[CSpellSettingsDef.ts:488](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L488)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

#### Inherited from

[Settings](Settings.md).[numSuggestions](Settings.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:256](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L256)

___

### parser

• `Optional` **parser**: `string`

#### Inherited from

[Settings](Settings.md).[parser](Settings.md#parser)

#### Defined in

[CSpellSettingsDef.ts:1003](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L1003)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

#### Inherited from

[Settings](Settings.md).[patterns](Settings.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:538](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L538)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

#### Inherited from

[Settings](Settings.md).[pnpFiles](Settings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:297](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L297)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

#### Inherited from

[Settings](Settings.md).[suggestionNumChanges](Settings.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:274](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L274)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

#### Inherited from

[Settings](Settings.md).[suggestionsTimeout](Settings.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:263](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L263)

___

### usePnP

• `Optional` **usePnP**: `boolean`

#### Inherited from

[Settings](Settings.md).[usePnP](Settings.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:290](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L290)

___

### words

• `Optional` **words**: `string`[]

#### Inherited from

[Settings](Settings.md).[words](Settings.md#words)

#### Defined in

[CSpellSettingsDef.ts:424](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L424)
