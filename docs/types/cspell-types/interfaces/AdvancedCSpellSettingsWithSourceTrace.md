[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / AdvancedCSpellSettingsWithSourceTrace

# Interface: AdvancedCSpellSettingsWithSourceTrace

## Hierarchy

- [`CSpellSettingsWithSourceTrace`](CSpellSettingsWithSourceTrace.md)

- `ExperimentalFileSettings`

  ↳ **`AdvancedCSpellSettingsWithSourceTrace`**

## Table of contents

### Properties

- [$schema](AdvancedCSpellSettingsWithSourceTrace.md#$schema)
- [\_\_importRef](AdvancedCSpellSettingsWithSourceTrace.md#__importref)
- [\_\_imports](AdvancedCSpellSettingsWithSourceTrace.md#__imports)
- [allowCompoundWords](AdvancedCSpellSettingsWithSourceTrace.md#allowcompoundwords)
- [cache](AdvancedCSpellSettingsWithSourceTrace.md#cache)
- [caseSensitive](AdvancedCSpellSettingsWithSourceTrace.md#casesensitive)
- [description](AdvancedCSpellSettingsWithSourceTrace.md#description)
- [dictionaries](AdvancedCSpellSettingsWithSourceTrace.md#dictionaries)
- [dictionaryDefinitions](AdvancedCSpellSettingsWithSourceTrace.md#dictionarydefinitions)
- [enableFiletypes](AdvancedCSpellSettingsWithSourceTrace.md#enablefiletypes)
- [enableGlobDot](AdvancedCSpellSettingsWithSourceTrace.md#enableglobdot)
- [enabled](AdvancedCSpellSettingsWithSourceTrace.md#enabled)
- [enabledLanguageIds](AdvancedCSpellSettingsWithSourceTrace.md#enabledlanguageids)
- [failFast](AdvancedCSpellSettingsWithSourceTrace.md#failfast)
- [features](AdvancedCSpellSettingsWithSourceTrace.md#features)
- [files](AdvancedCSpellSettingsWithSourceTrace.md#files)
- [flagWords](AdvancedCSpellSettingsWithSourceTrace.md#flagwords)
- [gitignoreRoot](AdvancedCSpellSettingsWithSourceTrace.md#gitignoreroot)
- [globRoot](AdvancedCSpellSettingsWithSourceTrace.md#globroot)
- [id](AdvancedCSpellSettingsWithSourceTrace.md#id)
- [ignorePaths](AdvancedCSpellSettingsWithSourceTrace.md#ignorepaths)
- [ignoreRegExpList](AdvancedCSpellSettingsWithSourceTrace.md#ignoreregexplist)
- [ignoreWords](AdvancedCSpellSettingsWithSourceTrace.md#ignorewords)
- [import](AdvancedCSpellSettingsWithSourceTrace.md#import)
- [includeRegExpList](AdvancedCSpellSettingsWithSourceTrace.md#includeregexplist)
- [language](AdvancedCSpellSettingsWithSourceTrace.md#language)
- [languageId](AdvancedCSpellSettingsWithSourceTrace.md#languageid)
- [languageSettings](AdvancedCSpellSettingsWithSourceTrace.md#languagesettings)
- [loadDefaultConfiguration](AdvancedCSpellSettingsWithSourceTrace.md#loaddefaultconfiguration)
- [maxDuplicateProblems](AdvancedCSpellSettingsWithSourceTrace.md#maxduplicateproblems)
- [maxNumberOfProblems](AdvancedCSpellSettingsWithSourceTrace.md#maxnumberofproblems)
- [minWordLength](AdvancedCSpellSettingsWithSourceTrace.md#minwordlength)
- [name](AdvancedCSpellSettingsWithSourceTrace.md#name)
- [noConfigSearch](AdvancedCSpellSettingsWithSourceTrace.md#noconfigsearch)
- [noSuggestDictionaries](AdvancedCSpellSettingsWithSourceTrace.md#nosuggestdictionaries)
- [numSuggestions](AdvancedCSpellSettingsWithSourceTrace.md#numsuggestions)
- [overrides](AdvancedCSpellSettingsWithSourceTrace.md#overrides)
- [parser](AdvancedCSpellSettingsWithSourceTrace.md#parser)
- [patterns](AdvancedCSpellSettingsWithSourceTrace.md#patterns)
- [plugins](AdvancedCSpellSettingsWithSourceTrace.md#plugins)
- [pnpFiles](AdvancedCSpellSettingsWithSourceTrace.md#pnpfiles)
- [readonly](AdvancedCSpellSettingsWithSourceTrace.md#readonly)
- [reporters](AdvancedCSpellSettingsWithSourceTrace.md#reporters)
- [showStatus](AdvancedCSpellSettingsWithSourceTrace.md#showstatus)
- [source](AdvancedCSpellSettingsWithSourceTrace.md#source)
- [spellCheckDelayMs](AdvancedCSpellSettingsWithSourceTrace.md#spellcheckdelayms)
- [suggestionNumChanges](AdvancedCSpellSettingsWithSourceTrace.md#suggestionnumchanges)
- [suggestionsTimeout](AdvancedCSpellSettingsWithSourceTrace.md#suggestionstimeout)
- [useGitignore](AdvancedCSpellSettingsWithSourceTrace.md#usegitignore)
- [usePnP](AdvancedCSpellSettingsWithSourceTrace.md#usepnp)
- [userWords](AdvancedCSpellSettingsWithSourceTrace.md#userwords)
- [version](AdvancedCSpellSettingsWithSourceTrace.md#version)
- [words](AdvancedCSpellSettingsWithSourceTrace.md#words)

## Properties

### $schema

• `Optional` **$schema**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[$schema](CSpellSettingsWithSourceTrace.md#$schema)

#### Defined in

[CSpellSettingsDef.ts:39](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L39)

___

### \_\_importRef

• `Optional` **\_\_importRef**: [`ImportFileRef`](ImportFileRef.md)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[__importRef](CSpellSettingsWithSourceTrace.md#__importref)

#### Defined in

[CSpellSettingsDef.ts:26](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L26)

___

### \_\_imports

• `Optional` **\_\_imports**: `Map`<`string`, [`ImportFileRef`](ImportFileRef.md)\>

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[__imports](CSpellSettingsWithSourceTrace.md#__imports)

#### Defined in

[CSpellSettingsDef.ts:27](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L27)

___

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[allowCompoundWords](CSpellSettingsWithSourceTrace.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:440](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L440)

___

### cache

• `Optional` **cache**: [`CacheSettings`](CacheSettings.md)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[cache](CSpellSettingsWithSourceTrace.md#cache)

#### Defined in

[CSpellSettingsDef.ts:339](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L339)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[caseSensitive](CSpellSettingsWithSourceTrace.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:451](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L451)

___

### description

• `Optional` **description**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[description](CSpellSettingsWithSourceTrace.md#description)

#### Defined in

[CSpellSettingsDef.ts:415](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L415)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[dictionaries](CSpellSettingsWithSourceTrace.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:477](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L477)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[dictionaryDefinitions](CSpellSettingsWithSourceTrace.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:465](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L465)

___

### enableFiletypes

• `Optional` **enableFiletypes**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enableFiletypes](CSpellSettingsWithSourceTrace.md#enablefiletypes)

#### Defined in

[CSpellSettingsDef.ts:206](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L206)

___

### enableGlobDot

• `Optional` **enableGlobDot**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enableGlobDot](CSpellSettingsWithSourceTrace.md#enableglobdot)

#### Defined in

[CSpellSettingsDef.ts:91](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L91)

___

### enabled

• `Optional` **enabled**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enabled](CSpellSettingsWithSourceTrace.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:421](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L421)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enabledLanguageIds](CSpellSettingsWithSourceTrace.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:188](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L188)

___

### failFast

• `Optional` **failFast**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[failFast](CSpellSettingsWithSourceTrace.md#failfast)

#### Defined in

[CSpellSettingsDef.ts:344](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L344)

___

### features

• `Optional` **features**: [`Features`](Features.md)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[features](CSpellSettingsWithSourceTrace.md#features)

#### Defined in

[CSpellSettingsDef.ts:137](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L137)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[files](CSpellSettingsWithSourceTrace.md#files)

#### Defined in

[CSpellSettingsDef.ts:82](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L82)

___

### flagWords

• `Optional` **flagWords**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[flagWords](CSpellSettingsWithSourceTrace.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

___

### gitignoreRoot

• `Optional` **gitignoreRoot**: `string` \| `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[gitignoreRoot](CSpellSettingsWithSourceTrace.md#gitignoreroot)

#### Defined in

[CSpellSettingsDef.ts:130](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L130)

___

### globRoot

• `Optional` **globRoot**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[globRoot](CSpellSettingsWithSourceTrace.md#globroot)

#### Defined in

[CSpellSettingsDef.ts:75](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L75)

___

### id

• `Optional` **id**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[id](CSpellSettingsWithSourceTrace.md#id)

#### Defined in

[CSpellSettingsDef.ts:409](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L409)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[ignorePaths](CSpellSettingsWithSourceTrace.md#ignorepaths)

#### Defined in

[CSpellSettingsDef.ts:98](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L98)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[ignoreRegExpList](CSpellSettingsWithSourceTrace.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:501](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L501)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[ignoreWords](CSpellSettingsWithSourceTrace.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:433](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L433)

___

### import

• `Optional` **import**: `string` \| `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[import](CSpellSettingsWithSourceTrace.md#import)

#### Defined in

[CSpellSettingsDef.ts:58](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L58)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[includeRegExpList](CSpellSettingsWithSourceTrace.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:511](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L511)

___

### language

• `Optional` **language**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[language](CSpellSettingsWithSourceTrace.md#language)

#### Defined in

[CSpellSettingsDef.ts:185](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L185)

___

### languageId

• `Optional` **languageId**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[languageId](CSpellSettingsWithSourceTrace.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:216](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L216)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[languageSettings](CSpellSettingsWithSourceTrace.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:213](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L213)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[loadDefaultConfiguration](CSpellSettingsWithSourceTrace.md#loaddefaultconfiguration)

#### Defined in

[CSpellSettingsDef.ts:224](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L224)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[maxDuplicateProblems](CSpellSettingsWithSourceTrace.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:240](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L240)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[maxNumberOfProblems](CSpellSettingsWithSourceTrace.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:233](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L233)

___

### minWordLength

• `Optional` **minWordLength**: `number`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[minWordLength](CSpellSettingsWithSourceTrace.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:247](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L247)

___

### name

• `Optional` **name**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[name](CSpellSettingsWithSourceTrace.md#name)

#### Defined in

[CSpellSettingsDef.ts:412](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L412)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[noConfigSearch](CSpellSettingsWithSourceTrace.md#noconfigsearch)

#### Defined in

[CSpellSettingsDef.ts:105](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L105)

___

### noSuggestDictionaries

• `Optional` **noSuggestDictionaries**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[noSuggestDictionaries](CSpellSettingsWithSourceTrace.md#nosuggestdictionaries)

#### Defined in

[CSpellSettingsDef.ts:488](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L488)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[numSuggestions](CSpellSettingsWithSourceTrace.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:256](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L256)

___

### overrides

• `Optional` **overrides**: [`OverrideSettings`](OverrideSettings.md)[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[overrides](CSpellSettingsWithSourceTrace.md#overrides)

#### Defined in

[CSpellSettingsDef.ts:170](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L170)

___

### parser

• `Optional` **parser**: `string`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[parser](CSpellSettingsWithSourceTrace.md#parser)

#### Defined in

[CSpellSettingsDef.ts:1003](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L1003)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[patterns](CSpellSettingsWithSourceTrace.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:538](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L538)

___

### plugins

• `Optional` **plugins**: [`Plugin`](Plugin.md)[]

#### Inherited from

ExperimentalFileSettings.plugins

#### Defined in

[CSpellSettingsDef.ts:980](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L980)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[pnpFiles](CSpellSettingsWithSourceTrace.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:297](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L297)

___

### readonly

• `Optional` **readonly**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[readonly](CSpellSettingsWithSourceTrace.md#readonly)

#### Defined in

[CSpellSettingsDef.ts:114](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L114)

___

### reporters

• `Optional` **reporters**: [`ReporterSettings`](../modules.md#reportersettings)[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[reporters](CSpellSettingsWithSourceTrace.md#reporters)

#### Defined in

[CSpellSettingsDef.ts:119](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L119)

___

### showStatus

• `Optional` **showStatus**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[showStatus](CSpellSettingsWithSourceTrace.md#showstatus)

#### Defined in

[CSpellSettingsDef.ts:384](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L384)

___

### source

• `Optional` **source**: [`Source`](../modules.md#source)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[source](CSpellSettingsWithSourceTrace.md#source)

#### Defined in

[CSpellSettingsDef.ts:25](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L25)

___

### spellCheckDelayMs

• `Optional` **spellCheckDelayMs**: `number`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[spellCheckDelayMs](CSpellSettingsWithSourceTrace.md#spellcheckdelayms)

#### Defined in

[CSpellSettingsDef.ts:390](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L390)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[suggestionNumChanges](CSpellSettingsWithSourceTrace.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:274](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L274)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[suggestionsTimeout](CSpellSettingsWithSourceTrace.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:263](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L263)

___

### useGitignore

• `Optional` **useGitignore**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[useGitignore](CSpellSettingsWithSourceTrace.md#usegitignore)

#### Defined in

[CSpellSettingsDef.ts:125](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L125)

___

### usePnP

• `Optional` **usePnP**: `boolean`

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[usePnP](CSpellSettingsWithSourceTrace.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:290](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L290)

___

### userWords

• `Optional` **userWords**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[userWords](CSpellSettingsWithSourceTrace.md#userwords)

#### Defined in

[CSpellSettingsDef.ts:51](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L51)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[version](CSpellSettingsWithSourceTrace.md#version)

#### Defined in

[CSpellSettingsDef.ts:48](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L48)

___

### words

• `Optional` **words**: `string`[]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[words](CSpellSettingsWithSourceTrace.md#words)

#### Defined in

[CSpellSettingsDef.ts:424](https://github.com/streetsidesoftware/cspell/blob/6865ad5/packages/cspell-types/src/CSpellSettingsDef.ts#L424)
