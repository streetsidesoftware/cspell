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

Url to JSON Schema

**`default`** "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json"

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[$schema](CSpellSettingsWithSourceTrace.md#$schema)

#### Defined in

[CSpellSettingsDef.ts:39](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L39)

___

### \_\_importRef

• `Optional` **\_\_importRef**: [`ImportFileRef`](ImportFileRef.md)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[__importRef](CSpellSettingsWithSourceTrace.md#__importref)

#### Defined in

[CSpellSettingsDef.ts:26](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L26)

___

### \_\_imports

• `Optional` **\_\_imports**: `Map`<`string`, [`ImportFileRef`](ImportFileRef.md)\>

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[__imports](CSpellSettingsWithSourceTrace.md#__imports)

#### Defined in

[CSpellSettingsDef.ts:27](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L27)

___

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[allowCompoundWords](CSpellSettingsWithSourceTrace.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:440](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L440)

___

### cache

• `Optional` **cache**: [`CacheSettings`](CacheSettings.md)

Define cache settings.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[cache](CSpellSettingsWithSourceTrace.md#cache)

#### Defined in

[CSpellSettingsDef.ts:339](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L339)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[caseSensitive](CSpellSettingsWithSourceTrace.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:451](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L451)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[description](CSpellSettingsWithSourceTrace.md#description)

#### Defined in

[CSpellSettingsDef.ts:415](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L415)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use. Each entry should match the name of the dictionary.

To remove a dictionary from the list, add `!` before the name.

For example, `!typescript` will turn off the dictionary with the name `typescript`.

See the [Dictionaries](https://cspell.org/docs/dictionaries/)
and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[dictionaries](CSpellSettingsWithSourceTrace.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:477](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L477)

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

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[dictionaryDefinitions](CSpellSettingsWithSourceTrace.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:465](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L465)

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

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enableFiletypes](CSpellSettingsWithSourceTrace.md#enablefiletypes)

#### Defined in

[CSpellSettingsDef.ts:206](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L206)

___

### enableGlobDot

• `Optional` **enableGlobDot**: `boolean`

Enable scanning files and directories beginning with `.` (period).

By default, CSpell does not scan `hidden` files.

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enableGlobDot](CSpellSettingsWithSourceTrace.md#enableglobdot)

#### Defined in

[CSpellSettingsDef.ts:91](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L91)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`default`** true

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enabled](CSpellSettingsWithSourceTrace.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:421](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L421)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[enabledLanguageIds](CSpellSettingsWithSourceTrace.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:188](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L188)

___

### failFast

• `Optional` **failFast**: `boolean`

Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks)

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[failFast](CSpellSettingsWithSourceTrace.md#failfast)

#### Defined in

[CSpellSettingsDef.ts:344](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L344)

___

### features

• `Optional` **features**: [`Features`](Features.md)

Configure CSpell features.

- Added with `v5.16.0`.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[features](CSpellSettingsWithSourceTrace.md#features)

#### Defined in

[CSpellSettingsDef.ts:137](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L137)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be checked.

Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[files](CSpellSettingsWithSourceTrace.md#files)

#### Defined in

[CSpellSettingsDef.ts:82](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L82)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[flagWords](CSpellSettingsWithSourceTrace.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

___

### gitignoreRoot

• `Optional` **gitignoreRoot**: `string` \| `string`[]

Tells the spell checker to searching for `.gitignore` files when it reaches a matching root.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[gitignoreRoot](CSpellSettingsWithSourceTrace.md#gitignoreroot)

#### Defined in

[CSpellSettingsDef.ts:130](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L130)

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

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[globRoot](CSpellSettingsWithSourceTrace.md#globroot)

#### Defined in

[CSpellSettingsDef.ts:75](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L75)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[id](CSpellSettingsWithSourceTrace.md#id)

#### Defined in

[CSpellSettingsDef.ts:409](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L409)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be ignored.

Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[ignorePaths](CSpellSettingsWithSourceTrace.md#ignorepaths)

#### Defined in

[CSpellSettingsDef.ts:98](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L98)

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

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[ignoreRegExpList](CSpellSettingsWithSourceTrace.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:501](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L501)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[ignoreWords](CSpellSettingsWithSourceTrace.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:433](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L433)

___

### import

• `Optional` **import**: `string` \| `string`[]

Allows this configuration to inherit configuration for one or more other files.

See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[import](CSpellSettingsWithSourceTrace.md#import)

#### Defined in

[CSpellSettingsDef.ts:58](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L58)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[includeRegExpList](CSpellSettingsWithSourceTrace.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:511](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L511)

___

### language

• `Optional` **language**: `string`

Current active spelling language. This specifies the language locale to use in choosing the
general dictionary.

For example:

- "en-GB" for British English.
- "en,nl" to enable both English and Dutch.

**`default`** "en"

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[language](CSpellSettingsWithSourceTrace.md#language)

#### Defined in

[CSpellSettingsDef.ts:185](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L185)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[languageId](CSpellSettingsWithSourceTrace.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:216](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L216)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[languageSettings](CSpellSettingsWithSourceTrace.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:213](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L213)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
will prevent ALL default configuration from being loaded.

**`default`** true

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[loadDefaultConfiguration](CSpellSettingsWithSourceTrace.md#loaddefaultconfiguration)

#### Defined in

[CSpellSettingsDef.ts:224](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L224)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[maxDuplicateProblems](CSpellSettingsWithSourceTrace.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:240](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L240)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[maxNumberOfProblems](CSpellSettingsWithSourceTrace.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:233](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L233)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[minWordLength](CSpellSettingsWithSourceTrace.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:247](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L247)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[name](CSpellSettingsWithSourceTrace.md#name)

#### Defined in

[CSpellSettingsDef.ts:412](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L412)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

Prevents searching for local configuration when checking individual documents.

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[noConfigSearch](CSpellSettingsWithSourceTrace.md#noconfigsearch)

#### Defined in

[CSpellSettingsDef.ts:105](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L105)

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

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[noSuggestDictionaries](CSpellSettingsWithSourceTrace.md#nosuggestdictionaries)

#### Defined in

[CSpellSettingsDef.ts:488](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L488)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`default`** 10

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[numSuggestions](CSpellSettingsWithSourceTrace.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:256](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L256)

___

### overrides

• `Optional` **overrides**: [`OverrideSettings`](OverrideSettings.md)[]

Overrides are used to apply settings for specific files in your project.

For example:

```javascript
"overrides": [
  // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
  {
    "filename": "**​/{*.hrr,*.crr}",
    "languageId": "cpp"
  },
  // Force `*.txt` to use the Dutch dictionary (Dutch dictionary needs to be installed separately):
  {
    "language": "nl",
    "filename": "**​/dutch/**​/*.txt"
  }
]
```

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[overrides](CSpellSettingsWithSourceTrace.md#overrides)

#### Defined in

[CSpellSettingsDef.ts:170](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L170)

___

### parser

• `Optional` **parser**: `string`

Parser to use for the file content

**`experimental`**

**`version`** 6.2.0

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[parser](CSpellSettingsWithSourceTrace.md#parser)

#### Defined in

[CSpellSettingsDef.ts:1003](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L1003)

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

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[patterns](CSpellSettingsWithSourceTrace.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:538](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L538)

___

### plugins

• `Optional` **plugins**: [`Plugin`](Plugin.md)[]

Future Plugin support

**`experimental`**

**`version`** 6.2.0

#### Inherited from

ExperimentalFileSettings.plugins

#### Defined in

[CSpellSettingsDef.ts:980](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L980)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[pnpFiles](CSpellSettingsWithSourceTrace.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:297](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L297)

___

### readonly

• `Optional` **readonly**: `boolean`

Indicate that the configuration file should not be modified.
This is used to prevent tools like the VS Code Spell Checker from
modifying the file to add words and other configuration.

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[readonly](CSpellSettingsWithSourceTrace.md#readonly)

#### Defined in

[CSpellSettingsDef.ts:114](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L114)

___

### reporters

• `Optional` **reporters**: [`ReporterSettings`](../modules.md#reportersettings)[]

Custom reporters configuration.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[reporters](CSpellSettingsWithSourceTrace.md#reporters)

#### Defined in

[CSpellSettingsDef.ts:119](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L119)

___

### showStatus

• `Optional` **showStatus**: `boolean`

Show status.

**`deprecated`** true

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[showStatus](CSpellSettingsWithSourceTrace.md#showstatus)

#### Defined in

[CSpellSettingsDef.ts:384](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L384)

___

### source

• `Optional` **source**: [`Source`](../modules.md#source)

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[source](CSpellSettingsWithSourceTrace.md#source)

#### Defined in

[CSpellSettingsDef.ts:25](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L25)

___

### spellCheckDelayMs

• `Optional` **spellCheckDelayMs**: `number`

Delay in ms after a document has changed before checking it for spelling errors.

**`deprecated`** true

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[spellCheckDelayMs](CSpellSettingsWithSourceTrace.md#spellcheckdelayms)

#### Defined in

[CSpellSettingsDef.ts:390](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L390)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[suggestionNumChanges](CSpellSettingsWithSourceTrace.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:274](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L274)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[suggestionsTimeout](CSpellSettingsWithSourceTrace.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:263](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L263)

___

### useGitignore

• `Optional` **useGitignore**: `boolean`

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[useGitignore](CSpellSettingsWithSourceTrace.md#usegitignore)

#### Defined in

[CSpellSettingsDef.ts:125](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L125)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`default`** false

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[usePnP](CSpellSettingsWithSourceTrace.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:290](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L290)

___

### userWords

• `Optional` **userWords**: `string`[]

Words to add to global dictionary -- should only be in the user config file.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[userWords](CSpellSettingsWithSourceTrace.md#userwords)

#### Defined in

[CSpellSettingsDef.ts:51](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L51)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

Configuration format version of the settings file.

This controls how the settings in the configuration file behave.

**`default`** "0.2"

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[version](CSpellSettingsWithSourceTrace.md#version)

#### Defined in

[CSpellSettingsDef.ts:48](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L48)

___

### words

• `Optional` **words**: `string`[]

List of words to be always considered correct.

#### Inherited from

[CSpellSettingsWithSourceTrace](CSpellSettingsWithSourceTrace.md).[words](CSpellSettingsWithSourceTrace.md#words)

#### Defined in

[CSpellSettingsDef.ts:424](https://github.com/streetsidesoftware/cspell/blob/e5b7f09/packages/cspell-types/src/CSpellSettingsDef.ts#L424)
