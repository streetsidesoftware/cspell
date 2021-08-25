[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / FileSettings

# Interface: FileSettings

## Hierarchy

- [`ExtendableSettings`](ExtendableSettings.md)

  ↳ **`FileSettings`**

  ↳↳ [`CSpellSettings`](CSpellSettings.md)

## Table of contents

### Properties

- [allowCompoundWords](FileSettings.md#allowcompoundwords)
- [caseSensitive](FileSettings.md#casesensitive)
- [description](FileSettings.md#description)
- [dictionaries](FileSettings.md#dictionaries)
- [dictionaryDefinitions](FileSettings.md#dictionarydefinitions)
- [enableFiletypes](FileSettings.md#enablefiletypes)
- [enabled](FileSettings.md#enabled)
- [enabledLanguageIds](FileSettings.md#enabledlanguageids)
- [files](FileSettings.md#files)
- [flagWords](FileSettings.md#flagwords)
- [globRoot](FileSettings.md#globroot)
- [id](FileSettings.md#id)
- [ignorePaths](FileSettings.md#ignorepaths)
- [ignoreRegExpList](FileSettings.md#ignoreregexplist)
- [ignoreWords](FileSettings.md#ignorewords)
- [import](FileSettings.md#import)
- [includeRegExpList](FileSettings.md#includeregexplist)
- [language](FileSettings.md#language)
- [languageId](FileSettings.md#languageid)
- [languageSettings](FileSettings.md#languagesettings)
- [maxDuplicateProblems](FileSettings.md#maxduplicateproblems)
- [maxNumberOfProblems](FileSettings.md#maxnumberofproblems)
- [minWordLength](FileSettings.md#minwordlength)
- [name](FileSettings.md#name)
- [noConfigSearch](FileSettings.md#noconfigsearch)
- [noSuggestDictionaries](FileSettings.md#nosuggestdictionaries)
- [numSuggestions](FileSettings.md#numsuggestions)
- [overrides](FileSettings.md#overrides)
- [patterns](FileSettings.md#patterns)
- [pnpFiles](FileSettings.md#pnpfiles)
- [readonly](FileSettings.md#readonly)
- [usePnP](FileSettings.md#usepnp)
- [userWords](FileSettings.md#userwords)
- [version](FileSettings.md#version)
- [words](FileSettings.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking.

**`default`** false

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[allowCompoundWords](ExtendableSettings.md#allowcompoundwords)

#### Defined in

[settings/CSpellSettingsDef.ts:264](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L264)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Words must match case rules.

**`default`** false

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[caseSensitive](ExtendableSettings.md#casesensitive)

#### Defined in

[settings/CSpellSettingsDef.ts:270](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L270)

___

### description

• `Optional` **description**: `string`

Optional description of configuration

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[description](ExtendableSettings.md#description)

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

[ExtendableSettings](ExtendableSettings.md).[dictionaries](ExtendableSettings.md#dictionaries)

#### Defined in

[settings/CSpellSettingsDef.ts:281](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L281)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[dictionaryDefinitions](ExtendableSettings.md#dictionarydefinitions)

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

[ExtendableSettings](ExtendableSettings.md).[enableFiletypes](ExtendableSettings.md#enablefiletypes)

#### Defined in

[settings/CSpellSettingsDef.ts:119](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L119)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled

**`default`** true

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[enabled](ExtendableSettings.md#enabled)

#### Defined in

[settings/CSpellSettingsDef.ts:249](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L249)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[enabledLanguageIds](ExtendableSettings.md#enabledlanguageids)

#### Defined in

[settings/CSpellSettingsDef.ts:101](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L101)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be checked.
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Defined in

[settings/CSpellSettingsDef.ts:61](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L61)

___

### flagWords

• `Optional` **flagWords**: `string`[]

list of words to always be considered incorrect.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[flagWords](ExtendableSettings.md#flagwords)

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

#### Defined in

[settings/CSpellSettingsDef.ts:55](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L55)

___

### id

• `Optional` **id**: `string`

Optional identifier

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[id](ExtendableSettings.md#id)

#### Defined in

[settings/CSpellSettingsDef.ts:237](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L237)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be ignored
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Defined in

[settings/CSpellSettingsDef.ts:67](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L67)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[ignoreRegExpList](ExtendableSettings.md#ignoreregexplist)

#### Defined in

[settings/CSpellSettingsDef.ts:299](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L299)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[ignoreWords](ExtendableSettings.md#ignorewords)

#### Defined in

[settings/CSpellSettingsDef.ts:258](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L258)

___

### import

• `Optional` **import**: `string` \| `string`[]

Other settings files to be included

#### Defined in

[settings/CSpellSettingsDef.ts:38](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L38)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[includeRegExpList](ExtendableSettings.md#includeregexplist)

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

[ExtendableSettings](ExtendableSettings.md).[language](ExtendableSettings.md#language)

#### Defined in

[settings/CSpellSettingsDef.ts:98](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L98)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[languageId](ExtendableSettings.md#languageid)

#### Defined in

[settings/CSpellSettingsDef.ts:149](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L149)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[languageSettings](ExtendableSettings.md#languagesettings)

#### Defined in

[settings/CSpellSettingsDef.ts:146](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L146)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[maxDuplicateProblems](ExtendableSettings.md#maxduplicateproblems)

#### Defined in

[settings/CSpellSettingsDef.ts:131](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L131)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[maxNumberOfProblems](ExtendableSettings.md#maxnumberofproblems)

#### Defined in

[settings/CSpellSettingsDef.ts:125](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L125)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[minWordLength](ExtendableSettings.md#minwordlength)

#### Defined in

[settings/CSpellSettingsDef.ts:137](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L137)

___

### name

• `Optional` **name**: `string`

Optional name of configuration

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[name](ExtendableSettings.md#name)

#### Defined in

[settings/CSpellSettingsDef.ts:240](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L240)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

Prevents searching for local configuration when checking individual documents.

**`default`** false

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

[ExtendableSettings](ExtendableSettings.md).[noSuggestDictionaries](ExtendableSettings.md#nosuggestdictionaries)

#### Defined in

[settings/CSpellSettingsDef.ts:292](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L292)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make

**`default`** 10

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[numSuggestions](ExtendableSettings.md#numsuggestions)

#### Defined in

[settings/CSpellSettingsDef.ts:143](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L143)

___

### overrides

• `Optional` **overrides**: [`OverrideSettings`](OverrideSettings.md)[]

Overrides to apply based upon the file path.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[overrides](ExtendableSettings.md#overrides)

#### Defined in

[settings/CSpellSettingsDef.ts:86](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L86)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[patterns](ExtendableSettings.md#patterns)

#### Defined in

[settings/CSpellSettingsDef.ts:308](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L308)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[pnpFiles](ExtendableSettings.md#pnpfiles)

#### Defined in

[settings/CSpellSettingsDef.ts:172](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L172)

___

### readonly

• `Optional` **readonly**: `boolean`

Indicate that the configuration file should not be modified.
This is used to prevent tools like the VS Code Spell Checker from
modifying the file to add words and other configuration.

**`default`** false

#### Defined in

[settings/CSpellSettingsDef.ts:81](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L81)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`default`** false

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[usePnP](ExtendableSettings.md#usepnp)

#### Defined in

[settings/CSpellSettingsDef.ts:165](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L165)

___

### userWords

• `Optional` **userWords**: `string`[]

Words to add to global dictionary -- should only be in the user config file.

#### Defined in

[settings/CSpellSettingsDef.ts:35](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L35)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

Configuration format version of the settings file.

**`default`** "0.2"

#### Defined in

[settings/CSpellSettingsDef.ts:32](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L32)

___

### words

• `Optional` **words**: `string`[]

list of words to be always considered correct

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[words](ExtendableSettings.md#words)

#### Defined in

[settings/CSpellSettingsDef.ts:252](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L252)
