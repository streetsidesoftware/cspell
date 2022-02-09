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
- [cache](CSpellSettingsWithSourceTrace.md#cache)
- [caseSensitive](CSpellSettingsWithSourceTrace.md#casesensitive)
- [description](CSpellSettingsWithSourceTrace.md#description)
- [dictionaries](CSpellSettingsWithSourceTrace.md#dictionaries)
- [dictionaryDefinitions](CSpellSettingsWithSourceTrace.md#dictionarydefinitions)
- [enableFiletypes](CSpellSettingsWithSourceTrace.md#enablefiletypes)
- [enableGlobDot](CSpellSettingsWithSourceTrace.md#enableglobdot)
- [enabled](CSpellSettingsWithSourceTrace.md#enabled)
- [enabledLanguageIds](CSpellSettingsWithSourceTrace.md#enabledlanguageids)
- [failFast](CSpellSettingsWithSourceTrace.md#failfast)
- [features](CSpellSettingsWithSourceTrace.md#features)
- [files](CSpellSettingsWithSourceTrace.md#files)
- [flagWords](CSpellSettingsWithSourceTrace.md#flagwords)
- [gitignoreRoot](CSpellSettingsWithSourceTrace.md#gitignoreroot)
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
- [reporters](CSpellSettingsWithSourceTrace.md#reporters)
- [showStatus](CSpellSettingsWithSourceTrace.md#showstatus)
- [source](CSpellSettingsWithSourceTrace.md#source)
- [spellCheckDelayMs](CSpellSettingsWithSourceTrace.md#spellcheckdelayms)
- [suggestionNumChanges](CSpellSettingsWithSourceTrace.md#suggestionnumchanges)
- [suggestionsTimeout](CSpellSettingsWithSourceTrace.md#suggestionstimeout)
- [useGitignore](CSpellSettingsWithSourceTrace.md#usegitignore)
- [usePnP](CSpellSettingsWithSourceTrace.md#usepnp)
- [userWords](CSpellSettingsWithSourceTrace.md#userwords)
- [version](CSpellSettingsWithSourceTrace.md#version)
- [words](CSpellSettingsWithSourceTrace.md#words)

## Properties

### $schema

• `Optional` **$schema**: `string`

Url to JSON Schema

**`default`** "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json"

#### Inherited from

[CSpellSettings](CSpellSettings.md).[$schema](CSpellSettings.md#$schema)

#### Defined in

[CSpellSettingsDef.ts:19](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L19)

___

### \_\_importRef

• `Optional` **\_\_importRef**: [`ImportFileRef`](ImportFileRef.md)

#### Defined in

[CSpellSettingsDef.ts:30](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L30)

___

### \_\_imports

• `Optional` **\_\_imports**: `Map`<`string`, [`ImportFileRef`](ImportFileRef.md)\>

#### Defined in

[CSpellSettingsDef.ts:31](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L31)

___

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[allowCompoundWords](CSpellSettings.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:369](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L369)

___

### cache

• `Optional` **cache**: [`CacheSettings`](CacheSettings.md)

Define cache settings.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[cache](CSpellSettings.md#cache)

#### Defined in

[CSpellSettingsDef.ts:272](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L272)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[caseSensitive](CSpellSettings.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:380](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L380)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[description](CSpellSettings.md#description)

#### Defined in

[CSpellSettingsDef.ts:348](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L348)

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

[CSpellSettingsDef.ts:391](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L391)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[dictionaryDefinitions](CSpellSettings.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:383](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L383)

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

[CSpellSettingsDef.ts:157](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L157)

___

### enableGlobDot

• `Optional` **enableGlobDot**: `boolean`

Enable scanning files and directories beginning with `.` (period).
By default, CSpell does not scan `hidden` files.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[enableGlobDot](CSpellSettings.md#enableglobdot)

#### Defined in

[CSpellSettingsDef.ts:76](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L76)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`default`** true

#### Inherited from

[CSpellSettings](CSpellSettings.md).[enabled](CSpellSettings.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:354](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L354)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[enabledLanguageIds](CSpellSettings.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:139](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L139)

___

### failFast

• `Optional` **failFast**: `boolean`

Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks)

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[failFast](CSpellSettings.md#failfast)

#### Defined in

[CSpellSettingsDef.ts:277](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L277)

___

### features

• `Optional` **features**: [`Features`](Features.md)

Configure CSpell features.

- Added with `v5.16.0`.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[features](CSpellSettings.md#features)

#### Defined in

[CSpellSettingsDef.ts:119](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L119)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be checked.
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[files](CSpellSettings.md#files)

#### Defined in

[CSpellSettingsDef.ts:68](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L68)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[flagWords](CSpellSettings.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:360](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L360)

___

### gitignoreRoot

• `Optional` **gitignoreRoot**: `string` \| `string`[]

Tells the spell checker to searching for `.gitignore` files when it reaches a matching root.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[gitignoreRoot](CSpellSettings.md#gitignoreroot)

#### Defined in

[CSpellSettingsDef.ts:112](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L112)

___

### globRoot

• `Optional` **globRoot**: `string`

The root to use for glob patterns found in this configuration.
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

[CSpellSettingsDef.ts:62](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L62)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[id](CSpellSettings.md#id)

#### Defined in

[CSpellSettingsDef.ts:342](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L342)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be ignored.
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[ignorePaths](CSpellSettings.md#ignorepaths)

#### Defined in

[CSpellSettingsDef.ts:82](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L82)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[ignoreRegExpList](CSpellSettings.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:409](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L409)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[ignoreWords](CSpellSettings.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:363](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L363)

___

### import

• `Optional` **import**: `string` \| `string`[]

Other settings files to be included.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[import](CSpellSettings.md#import)

#### Defined in

[CSpellSettingsDef.ts:45](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L45)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[includeRegExpList](CSpellSettings.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:415](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L415)

___

### language

• `Optional` **language**: `string`

Current active spelling language.

Example: "en-GB" for British English.

Example: "en,nl" to enable both English and Dutch.

**`default`** "en"

#### Inherited from

[CSpellSettings](CSpellSettings.md).[language](CSpellSettings.md#language)

#### Defined in

[CSpellSettingsDef.ts:136](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L136)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[languageId](CSpellSettings.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:163](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L163)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[languageSettings](CSpellSettings.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:160](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L160)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[CSpellSettings](CSpellSettings.md).[maxDuplicateProblems](CSpellSettings.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:177](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L177)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[CSpellSettings](CSpellSettings.md).[maxNumberOfProblems](CSpellSettings.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:171](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L171)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[CSpellSettings](CSpellSettings.md).[minWordLength](CSpellSettings.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:183](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L183)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[name](CSpellSettings.md#name)

#### Defined in

[CSpellSettingsDef.ts:345](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L345)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

Prevents searching for local configuration when checking individual documents.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[noConfigSearch](CSpellSettings.md#noconfigsearch)

#### Defined in

[CSpellSettingsDef.ts:88](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L88)

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

[CSpellSettingsDef.ts:402](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L402)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`default`** 10

#### Inherited from

[CSpellSettings](CSpellSettings.md).[numSuggestions](CSpellSettings.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:191](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L191)

___

### overrides

• `Optional` **overrides**: [`OverrideSettings`](OverrideSettings.md)[]

Overrides to apply based upon the file path.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[overrides](CSpellSettings.md#overrides)

#### Defined in

[CSpellSettingsDef.ts:124](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L124)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[patterns](CSpellSettings.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:418](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L418)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[CSpellSettings](CSpellSettings.md).[pnpFiles](CSpellSettings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:230](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L230)

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

[CSpellSettingsDef.ts:96](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L96)

___

### reporters

• `Optional` **reporters**: [`ReporterSettings`](../modules.md#reportersettings)[]

Custom reporters configuration.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[reporters](CSpellSettings.md#reporters)

#### Defined in

[CSpellSettingsDef.ts:101](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L101)

___

### showStatus

• `Optional` **showStatus**: `boolean`

Show status.

**`deprecated`** true

#### Inherited from

[CSpellSettings](CSpellSettings.md).[showStatus](CSpellSettings.md#showstatus)

#### Defined in

[CSpellSettingsDef.ts:317](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L317)

___

### source

• `Optional` **source**: [`Source`](../modules.md#source)

#### Defined in

[CSpellSettingsDef.ts:29](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L29)

___

### spellCheckDelayMs

• `Optional` **spellCheckDelayMs**: `number`

Delay in ms after a document has changed before checking it for spelling errors.

**`deprecated`** true

#### Inherited from

[CSpellSettings](CSpellSettings.md).[spellCheckDelayMs](CSpellSettings.md#spellcheckdelayms)

#### Defined in

[CSpellSettingsDef.ts:323](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L323)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Inherited from

[CSpellSettings](CSpellSettings.md).[suggestionNumChanges](CSpellSettings.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:207](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L207)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[CSpellSettings](CSpellSettings.md).[suggestionsTimeout](CSpellSettings.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:197](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L197)

___

### useGitignore

• `Optional` **useGitignore**: `boolean`

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

**`default`** false

#### Inherited from

[CSpellSettings](CSpellSettings.md).[useGitignore](CSpellSettings.md#usegitignore)

#### Defined in

[CSpellSettingsDef.ts:107](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L107)

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

[CSpellSettingsDef.ts:223](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L223)

___

### userWords

• `Optional` **userWords**: `string`[]

Words to add to global dictionary -- should only be in the user config file.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[userWords](CSpellSettings.md#userwords)

#### Defined in

[CSpellSettingsDef.ts:42](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L42)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

Configuration format version of the settings file.

**`default`** "0.2"

#### Inherited from

[CSpellSettings](CSpellSettings.md).[version](CSpellSettings.md#version)

#### Defined in

[CSpellSettingsDef.ts:39](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L39)

___

### words

• `Optional` **words**: `string`[]

List of words to be always considered correct.

#### Inherited from

[CSpellSettings](CSpellSettings.md).[words](CSpellSettings.md#words)

#### Defined in

[CSpellSettingsDef.ts:357](https://github.com/streetsidesoftware/cspell/blob/51d5a71/packages/cspell-types/src/CSpellSettingsDef.ts#L357)
