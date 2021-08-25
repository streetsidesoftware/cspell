[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / CSpellSettingsWithSourceTrace

# Interface: CSpellSettingsWithSourceTrace

## Hierarchy

- [`CSpellSettings`](CSpellSettings.md)

  ↳ **`CSpellSettingsWithSourceTrace`**

## Table of contents

### Properties

- [$schema](CSpellSettingsWithSourceTrace.md#$schema)
- [\_\_importRef](CSpellSettingsWithSourceTrace.md#__importref)
- [\_\_imports](CSpellSettingsWithSourceTrace.md#__imports)
- [allowCompoundWords](CSpellSettingsWithSourceTrace.md#allowcompoundwords)
- [caseSensitive](CSpellSettingsWithSourceTrace.md#casesensitive)
- [description](CSpellSettingsWithSourceTrace.md#description)
- [dictionaries](CSpellSettingsWithSourceTrace.md#dictionaries)
- [dictionaryDefinitions](CSpellSettingsWithSourceTrace.md#dictionarydefinitions)
- [enableFiletypes](CSpellSettingsWithSourceTrace.md#enablefiletypes)
- [enabled](CSpellSettingsWithSourceTrace.md#enabled)
- [enabledLanguageIds](CSpellSettingsWithSourceTrace.md#enabledlanguageids)
- [files](CSpellSettingsWithSourceTrace.md#files)
- [flagWords](CSpellSettingsWithSourceTrace.md#flagwords)
- [globRoot](CSpellSettingsWithSourceTrace.md#globroot)
- [id](CSpellSettingsWithSourceTrace.md#id)
- [ignorePaths](CSpellSettingsWithSourceTrace.md#ignorepaths)
- [ignoreRegExpList](CSpellSettingsWithSourceTrace.md#ignoreregexplist)
- [ignoreWords](CSpellSettingsWithSourceTrace.md#ignorewords)
- [import](CSpellSettingsWithSourceTrace.md#import)
- [includeRegExpList](CSpellSettingsWithSourceTrace.md#includeregexplist)
- [language](CSpellSettingsWithSourceTrace.md#language)
- [languageId](CSpellSettingsWithSourceTrace.md#languageid)
- [languageSettings](CSpellSettingsWithSourceTrace.md#languagesettings)
- [maxDuplicateProblems](CSpellSettingsWithSourceTrace.md#maxduplicateproblems)
- [maxNumberOfProblems](CSpellSettingsWithSourceTrace.md#maxnumberofproblems)
- [minWordLength](CSpellSettingsWithSourceTrace.md#minwordlength)
- [name](CSpellSettingsWithSourceTrace.md#name)
- [noConfigSearch](CSpellSettingsWithSourceTrace.md#noconfigsearch)
- [noSuggestDictionaries](CSpellSettingsWithSourceTrace.md#nosuggestdictionaries)
- [numSuggestions](CSpellSettingsWithSourceTrace.md#numsuggestions)
- [overrides](CSpellSettingsWithSourceTrace.md#overrides)
- [patterns](CSpellSettingsWithSourceTrace.md#patterns)
- [pnpFiles](CSpellSettingsWithSourceTrace.md#pnpfiles)
- [readonly](CSpellSettingsWithSourceTrace.md#readonly)
- [showStatus](CSpellSettingsWithSourceTrace.md#showstatus)
- [source](CSpellSettingsWithSourceTrace.md#source)
- [spellCheckDelayMs](CSpellSettingsWithSourceTrace.md#spellcheckdelayms)
- [usePnP](CSpellSettingsWithSourceTrace.md#usepnp)
- [userWords](CSpellSettingsWithSourceTrace.md#userwords)
- [version](CSpellSettingsWithSourceTrace.md#version)
- [words](CSpellSettingsWithSourceTrace.md#words)

## Properties

### $schema

• `Optional` **$schema**: `string`

#### Inherited from

[CSpellSettings](CSpellSettings.md).[$schema](CSpellSettings.md#$schema)

#### Defined in

[settings/CSpellSettingsDef.ts:12](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L12)

___

### \_\_importRef

• `Optional` **\_\_importRef**: [`ImportFileRef`](ImportFileRef.md)

#### Defined in

[settings/CSpellSettingsDef.ts:23](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L23)

___

### \_\_imports

• `Optional` **\_\_imports**: `Map`<`string`, [`ImportFileRef`](ImportFileRef.md)\>

#### Defined in

[settings/CSpellSettingsDef.ts:24](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L24)

___

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[allowCompoundWords](CSpellSettings.md#allowcompoundwords)

#### Defined in

[settings/CSpellSettingsDef.ts:264](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L264)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Words must match case rules.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[caseSensitive](CSpellSettings.md#casesensitive)

#### Defined in

[settings/CSpellSettingsDef.ts:270](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L270)

___

### description

• `Optional` **description**: `string`

Optional description of configuration

#### Inherited from

[CSpellSettings](CSpellSettings.md).[description](CSpellSettings.md#description)

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

[CSpellSettings](CSpellSettings.md).[dictionaries](CSpellSettings.md#dictionaries)

#### Defined in

[settings/CSpellSettingsDef.ts:281](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L281)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries

#### Inherited from

[CSpellSettings](CSpellSettings.md).[dictionaryDefinitions](CSpellSettings.md#dictionarydefinitions)

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

[CSpellSettings](CSpellSettings.md).[enableFiletypes](CSpellSettings.md#enablefiletypes)

#### Defined in

[settings/CSpellSettingsDef.ts:119](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L119)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled

**`default`** true

#### Inherited from

[CSpellSettings](CSpellSettings.md).[enabled](CSpellSettings.md#enabled)

#### Defined in

[settings/CSpellSettingsDef.ts:249](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L249)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[enabledLanguageIds](CSpellSettings.md#enabledlanguageids)

#### Defined in

[settings/CSpellSettingsDef.ts:101](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L101)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be checked.
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[files](CSpellSettings.md#files)

#### Defined in

[settings/CSpellSettingsDef.ts:61](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L61)

___

### flagWords

• `Optional` **flagWords**: `string`[]

list of words to always be considered incorrect.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[flagWords](CSpellSettings.md#flagwords)

#### Defined in

[settings/CSpellSettingsDef.ts:255](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L255)

___

### globRoot

• `Optional` **globRoot**: `string`

The root to use for glop patterns found in this configuration.
Default: location of the configuration file.
  For compatibility reasons, config files with version 0.1, the glob root will
  default to be `${cwd}`.

Use `globRoot` to define a different location.
`globRoot` can be relative to the location of this configuration file.
Defining globRoot, does not impact imported configurations.

Special Values:
- `${cwd}` - will be replaced with the current working directory.
- `.` - will be the location of the containing configuration file.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[globRoot](CSpellSettings.md#globroot)

#### Defined in

[settings/CSpellSettingsDef.ts:55](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L55)

___

### id

• `Optional` **id**: `string`

Optional identifier

#### Inherited from

[CSpellSettings](CSpellSettings.md).[id](CSpellSettings.md#id)

#### Defined in

[settings/CSpellSettingsDef.ts:237](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L237)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be ignored
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[ignorePaths](CSpellSettings.md#ignorepaths)

#### Defined in

[settings/CSpellSettingsDef.ts:67](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L67)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href

#### Inherited from

[CSpellSettings](CSpellSettings.md).[ignoreRegExpList](CSpellSettings.md#ignoreregexplist)

#### Defined in

[settings/CSpellSettingsDef.ts:299](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L299)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[ignoreWords](CSpellSettings.md#ignorewords)

#### Defined in

[settings/CSpellSettingsDef.ts:258](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L258)

___

### import

• `Optional` **import**: `string` \| `string`[]

Other settings files to be included

#### Inherited from

[CSpellSettings](CSpellSettings.md).[import](CSpellSettings.md#import)

#### Defined in

[settings/CSpellSettingsDef.ts:38](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L38)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[includeRegExpList](CSpellSettings.md#includeregexplist)

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

[CSpellSettings](CSpellSettings.md).[language](CSpellSettings.md#language)

#### Defined in

[settings/CSpellSettingsDef.ts:98](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L98)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[languageId](CSpellSettings.md#languageid)

#### Defined in

[settings/CSpellSettingsDef.ts:149](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L149)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[languageSettings](CSpellSettings.md#languagesettings)

#### Defined in

[settings/CSpellSettingsDef.ts:146](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L146)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[CSpellSettings](CSpellSettings.md).[maxDuplicateProblems](CSpellSettings.md#maxduplicateproblems)

#### Defined in

[settings/CSpellSettingsDef.ts:131](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L131)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[CSpellSettings](CSpellSettings.md).[maxNumberOfProblems](CSpellSettings.md#maxnumberofproblems)

#### Defined in

[settings/CSpellSettingsDef.ts:125](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L125)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[CSpellSettings](CSpellSettings.md).[minWordLength](CSpellSettings.md#minwordlength)

#### Defined in

[settings/CSpellSettingsDef.ts:137](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L137)

___

### name

• `Optional` **name**: `string`

Optional name of configuration

#### Inherited from

[CSpellSettings](CSpellSettings.md).[name](CSpellSettings.md#name)

#### Defined in

[settings/CSpellSettingsDef.ts:240](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L240)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

Prevents searching for local configuration when checking individual documents.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[noConfigSearch](CSpellSettings.md#noconfigsearch)

#### Defined in

[settings/CSpellSettingsDef.ts:73](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L73)

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

[CSpellSettings](CSpellSettings.md).[noSuggestDictionaries](CSpellSettings.md#nosuggestdictionaries)

#### Defined in

[settings/CSpellSettingsDef.ts:292](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L292)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make

**`default`** 10

#### Inherited from

[CSpellSettings](CSpellSettings.md).[numSuggestions](CSpellSettings.md#numsuggestions)

#### Defined in

[settings/CSpellSettingsDef.ts:143](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L143)

___

### overrides

• `Optional` **overrides**: [`OverrideSettings`](OverrideSettings.md)[]

Overrides to apply based upon the file path.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[overrides](CSpellSettings.md#overrides)

#### Defined in

[settings/CSpellSettingsDef.ts:86](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L86)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList

#### Inherited from

[CSpellSettings](CSpellSettings.md).[patterns](CSpellSettings.md#patterns)

#### Defined in

[settings/CSpellSettingsDef.ts:308](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L308)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[CSpellSettings](CSpellSettings.md).[pnpFiles](CSpellSettings.md#pnpfiles)

#### Defined in

[settings/CSpellSettingsDef.ts:172](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L172)

___

### readonly

• `Optional` **readonly**: `boolean`

Indicate that the configuration file should not be modified.
This is used to prevent tools like the VS Code Spell Checker from
modifying the file to add words and other configuration.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[readonly](CSpellSettings.md#readonly)

#### Defined in

[settings/CSpellSettingsDef.ts:81](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L81)

___

### showStatus

• `Optional` **showStatus**: `boolean`

Show status

**`deprecated`**

#### Inherited from

[CSpellSettings](CSpellSettings.md).[showStatus](CSpellSettings.md#showstatus)

#### Defined in

[settings/CSpellSettingsDef.ts:212](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L212)

___

### source

• `Optional` **source**: [`Source`](../modules.md#source)

#### Defined in

[settings/CSpellSettingsDef.ts:22](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L22)

___

### spellCheckDelayMs

• `Optional` **spellCheckDelayMs**: `number`

Delay in ms after a document has changed before checking it for spelling errors.

**`deprecated`**

#### Inherited from

[CSpellSettings](CSpellSettings.md).[spellCheckDelayMs](CSpellSettings.md#spellcheckdelayms)

#### Defined in

[settings/CSpellSettingsDef.ts:218](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L218)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[usePnP](CSpellSettings.md#usepnp)

#### Defined in

[settings/CSpellSettingsDef.ts:165](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L165)

___

### userWords

• `Optional` **userWords**: `string`[]

Words to add to global dictionary -- should only be in the user config file.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[userWords](CSpellSettings.md#userwords)

#### Defined in

[settings/CSpellSettingsDef.ts:35](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L35)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

Configuration format version of the settings file.

**`default`** "0.2"

#### Inherited from

[CSpellSettings](CSpellSettings.md).[version](CSpellSettings.md#version)

#### Defined in

[settings/CSpellSettingsDef.ts:32](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L32)

___

### words

• `Optional` **words**: `string`[]

list of words to be always considered correct

#### Inherited from

[CSpellSettings](CSpellSettings.md).[words](CSpellSettings.md#words)

#### Defined in

[settings/CSpellSettingsDef.ts:252](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L252)
