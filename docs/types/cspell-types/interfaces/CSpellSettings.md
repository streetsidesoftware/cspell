[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / CSpellSettings

# Interface: CSpellSettings

## Hierarchy

- [`FileSettings`](FileSettings.md)

- [`LegacySettings`](LegacySettings.md)

  ↳ **`CSpellSettings`**

  ↳↳ [`CSpellSettingsWithSourceTrace`](CSpellSettingsWithSourceTrace.md)

## Table of contents

### Properties

- [$schema](CSpellSettings.md#$schema)
- [allowCompoundWords](CSpellSettings.md#allowcompoundwords)
- [caseSensitive](CSpellSettings.md#casesensitive)
- [description](CSpellSettings.md#description)
- [dictionaries](CSpellSettings.md#dictionaries)
- [dictionaryDefinitions](CSpellSettings.md#dictionarydefinitions)
- [enableFiletypes](CSpellSettings.md#enablefiletypes)
- [enabled](CSpellSettings.md#enabled)
- [enabledLanguageIds](CSpellSettings.md#enabledlanguageids)
- [files](CSpellSettings.md#files)
- [flagWords](CSpellSettings.md#flagwords)
- [gitignoreRoot](CSpellSettings.md#gitignoreroot)
- [globRoot](CSpellSettings.md#globroot)
- [id](CSpellSettings.md#id)
- [ignorePaths](CSpellSettings.md#ignorepaths)
- [ignoreRegExpList](CSpellSettings.md#ignoreregexplist)
- [ignoreWords](CSpellSettings.md#ignorewords)
- [import](CSpellSettings.md#import)
- [includeRegExpList](CSpellSettings.md#includeregexplist)
- [language](CSpellSettings.md#language)
- [languageId](CSpellSettings.md#languageid)
- [languageSettings](CSpellSettings.md#languagesettings)
- [maxDuplicateProblems](CSpellSettings.md#maxduplicateproblems)
- [maxNumberOfProblems](CSpellSettings.md#maxnumberofproblems)
- [minWordLength](CSpellSettings.md#minwordlength)
- [name](CSpellSettings.md#name)
- [noConfigSearch](CSpellSettings.md#noconfigsearch)
- [noSuggestDictionaries](CSpellSettings.md#nosuggestdictionaries)
- [numSuggestions](CSpellSettings.md#numsuggestions)
- [overrides](CSpellSettings.md#overrides)
- [patterns](CSpellSettings.md#patterns)
- [pnpFiles](CSpellSettings.md#pnpfiles)
- [readonly](CSpellSettings.md#readonly)
- [reporters](CSpellSettings.md#reporters)
- [showStatus](CSpellSettings.md#showstatus)
- [spellCheckDelayMs](CSpellSettings.md#spellcheckdelayms)
- [suggestionNumChanges](CSpellSettings.md#suggestionnumchanges)
- [suggestionsTimeout](CSpellSettings.md#suggestionstimeout)
- [useGitignore](CSpellSettings.md#usegitignore)
- [usePnP](CSpellSettings.md#usepnp)
- [userWords](CSpellSettings.md#userwords)
- [version](CSpellSettings.md#version)
- [words](CSpellSettings.md#words)

## Properties

### $schema

• `Optional` **$schema**: `string`

#### Defined in

[CSpellSettingsDef.ts:12](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L12)

___

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking.

**`default`** false

#### Inherited from

[FileSettings](FileSettings.md).[allowCompoundWords](FileSettings.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:300](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L300)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`default`** false

#### Inherited from

[FileSettings](FileSettings.md).[caseSensitive](FileSettings.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:311](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L311)

___

### description

• `Optional` **description**: `string`

Optional description of configuration

#### Inherited from

[FileSettings](FileSettings.md).[description](FileSettings.md#description)

#### Defined in

[CSpellSettingsDef.ts:279](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L279)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use.
Each entry should match the name of the dictionary.
To remove a dictionary from the list add `!` before the name.
i.e. `!typescript` will turn off the dictionary with the name `typescript`.

#### Inherited from

[FileSettings](FileSettings.md).[dictionaries](FileSettings.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:322](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L322)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries

#### Inherited from

[FileSettings](FileSettings.md).[dictionaryDefinitions](FileSettings.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:314](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L314)

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

[FileSettings](FileSettings.md).[enableFiletypes](FileSettings.md#enablefiletypes)

#### Defined in

[CSpellSettingsDef.ts:135](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L135)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled

**`default`** true

#### Inherited from

[FileSettings](FileSettings.md).[enabled](FileSettings.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:285](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L285)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[FileSettings](FileSettings.md).[enabledLanguageIds](FileSettings.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:117](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L117)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be checked.
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[FileSettings](FileSettings.md).[files](FileSettings.md#files)

#### Defined in

[CSpellSettingsDef.ts:61](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L61)

___

### flagWords

• `Optional` **flagWords**: `string`[]

list of words to always be considered incorrect.

#### Inherited from

[FileSettings](FileSettings.md).[flagWords](FileSettings.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:291](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L291)

___

### gitignoreRoot

• `Optional` **gitignoreRoot**: `string` \| `string`[]

Tells the spell checker to searching for `.gitignore` files when it reaches a matching root.

#### Inherited from

[FileSettings](FileSettings.md).[gitignoreRoot](FileSettings.md#gitignoreroot)

#### Defined in

[CSpellSettingsDef.ts:97](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L97)

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

[FileSettings](FileSettings.md).[globRoot](FileSettings.md#globroot)

#### Defined in

[CSpellSettingsDef.ts:55](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L55)

___

### id

• `Optional` **id**: `string`

Optional identifier

#### Inherited from

[FileSettings](FileSettings.md).[id](FileSettings.md#id)

#### Defined in

[CSpellSettingsDef.ts:273](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L273)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be ignored
Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[FileSettings](FileSettings.md).[ignorePaths](FileSettings.md#ignorepaths)

#### Defined in

[CSpellSettingsDef.ts:67](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L67)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href

#### Inherited from

[FileSettings](FileSettings.md).[ignoreRegExpList](FileSettings.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:340](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L340)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Inherited from

[FileSettings](FileSettings.md).[ignoreWords](FileSettings.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:294](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L294)

___

### import

• `Optional` **import**: `string` \| `string`[]

Other settings files to be included

#### Inherited from

[FileSettings](FileSettings.md).[import](FileSettings.md#import)

#### Defined in

[CSpellSettingsDef.ts:38](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L38)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Inherited from

[FileSettings](FileSettings.md).[includeRegExpList](FileSettings.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:346](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L346)

___

### language

• `Optional` **language**: `string`

Current active spelling language.

Example: "en-GB" for British English

Example: "en,nl" to enable both English and Dutch

**`default`** "en"

#### Inherited from

[FileSettings](FileSettings.md).[language](FileSettings.md#language)

#### Defined in

[CSpellSettingsDef.ts:114](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L114)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[FileSettings](FileSettings.md).[languageId](FileSettings.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:141](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L141)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

#### Inherited from

[FileSettings](FileSettings.md).[languageSettings](FileSettings.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:138](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L138)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[FileSettings](FileSettings.md).[maxDuplicateProblems](FileSettings.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:155](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L155)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[FileSettings](FileSettings.md).[maxNumberOfProblems](FileSettings.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:149](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L149)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[FileSettings](FileSettings.md).[minWordLength](FileSettings.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:161](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L161)

___

### name

• `Optional` **name**: `string`

Optional name of configuration

#### Inherited from

[FileSettings](FileSettings.md).[name](FileSettings.md#name)

#### Defined in

[CSpellSettingsDef.ts:276](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L276)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

Prevents searching for local configuration when checking individual documents.

**`default`** false

#### Inherited from

[FileSettings](FileSettings.md).[noConfigSearch](FileSettings.md#noconfigsearch)

#### Defined in

[CSpellSettingsDef.ts:73](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L73)

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

[FileSettings](FileSettings.md).[noSuggestDictionaries](FileSettings.md#nosuggestdictionaries)

#### Defined in

[CSpellSettingsDef.ts:333](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L333)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make

**`default`** 10

#### Inherited from

[FileSettings](FileSettings.md).[numSuggestions](FileSettings.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:169](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L169)

___

### overrides

• `Optional` **overrides**: [`OverrideSettings`](OverrideSettings.md)[]

Overrides to apply based upon the file path.

#### Inherited from

[FileSettings](FileSettings.md).[overrides](FileSettings.md#overrides)

#### Defined in

[CSpellSettingsDef.ts:102](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L102)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList

#### Inherited from

[FileSettings](FileSettings.md).[patterns](FileSettings.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:349](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L349)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[FileSettings](FileSettings.md).[pnpFiles](FileSettings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:208](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L208)

___

### readonly

• `Optional` **readonly**: `boolean`

Indicate that the configuration file should not be modified.
This is used to prevent tools like the VS Code Spell Checker from
modifying the file to add words and other configuration.

**`default`** false

#### Inherited from

[FileSettings](FileSettings.md).[readonly](FileSettings.md#readonly)

#### Defined in

[CSpellSettingsDef.ts:81](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L81)

___

### reporters

• `Optional` **reporters**: [`ReporterSettings`](../modules.md#reportersettings)[]

Custom reporters configuration

#### Inherited from

[FileSettings](FileSettings.md).[reporters](FileSettings.md#reporters)

#### Defined in

[CSpellSettingsDef.ts:86](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L86)

___

### showStatus

• `Optional` **showStatus**: `boolean`

Show status

**`deprecated`** true

#### Inherited from

[LegacySettings](LegacySettings.md).[showStatus](LegacySettings.md#showstatus)

#### Defined in

[CSpellSettingsDef.ts:248](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L248)

___

### spellCheckDelayMs

• `Optional` **spellCheckDelayMs**: `number`

Delay in ms after a document has changed before checking it for spelling errors.

**`deprecated`** true

#### Inherited from

[LegacySettings](LegacySettings.md).[spellCheckDelayMs](LegacySettings.md#spellcheckdelayms)

#### Defined in

[CSpellSettingsDef.ts:254](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L254)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Inherited from

[FileSettings](FileSettings.md).[suggestionNumChanges](FileSettings.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:185](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L185)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[FileSettings](FileSettings.md).[suggestionsTimeout](FileSettings.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:175](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L175)

___

### useGitignore

• `Optional` **useGitignore**: `boolean`

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

**`default`** false

#### Inherited from

[FileSettings](FileSettings.md).[useGitignore](FileSettings.md#usegitignore)

#### Defined in

[CSpellSettingsDef.ts:92](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L92)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`default`** false

#### Inherited from

[FileSettings](FileSettings.md).[usePnP](FileSettings.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:201](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L201)

___

### userWords

• `Optional` **userWords**: `string`[]

Words to add to global dictionary -- should only be in the user config file.

#### Inherited from

[FileSettings](FileSettings.md).[userWords](FileSettings.md#userwords)

#### Defined in

[CSpellSettingsDef.ts:35](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L35)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

Configuration format version of the settings file.

**`default`** "0.2"

#### Inherited from

[FileSettings](FileSettings.md).[version](FileSettings.md#version)

#### Defined in

[CSpellSettingsDef.ts:32](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L32)

___

### words

• `Optional` **words**: `string`[]

list of words to be always considered correct

#### Inherited from

[FileSettings](FileSettings.md).[words](FileSettings.md#words)

#### Defined in

[CSpellSettingsDef.ts:288](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L288)
