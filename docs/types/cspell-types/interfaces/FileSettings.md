[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / FileSettings

# Interface: FileSettings

## Hierarchy

- [`ExtendableSettings`](ExtendableSettings.md)

- [`CommandLineSettings`](CommandLineSettings.md)

  ↳ **`FileSettings`**

  ↳↳ [`CSpellSettings`](CSpellSettings.md)

## Table of contents

### Properties

- [allowCompoundWords](FileSettings.md#allowcompoundwords)
- [cache](FileSettings.md#cache)
- [caseSensitive](FileSettings.md#casesensitive)
- [description](FileSettings.md#description)
- [dictionaries](FileSettings.md#dictionaries)
- [dictionaryDefinitions](FileSettings.md#dictionarydefinitions)
- [enableFiletypes](FileSettings.md#enablefiletypes)
- [enableGlobDot](FileSettings.md#enableglobdot)
- [enabled](FileSettings.md#enabled)
- [enabledLanguageIds](FileSettings.md#enabledlanguageids)
- [failFast](FileSettings.md#failfast)
- [features](FileSettings.md#features)
- [files](FileSettings.md#files)
- [flagWords](FileSettings.md#flagwords)
- [gitignoreRoot](FileSettings.md#gitignoreroot)
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
- [loadDefaultConfiguration](FileSettings.md#loaddefaultconfiguration)
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
- [reporters](FileSettings.md#reporters)
- [suggestionNumChanges](FileSettings.md#suggestionnumchanges)
- [suggestionsTimeout](FileSettings.md#suggestionstimeout)
- [useGitignore](FileSettings.md#usegitignore)
- [usePnP](FileSettings.md#usepnp)
- [userWords](FileSettings.md#userwords)
- [version](FileSettings.md#version)
- [words](FileSettings.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.

**`default`** false

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[allowCompoundWords](ExtendableSettings.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:434](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L434)

___

### cache

• `Optional` **cache**: [`CacheSettings`](CacheSettings.md)

Define cache settings.

#### Inherited from

[CommandLineSettings](CommandLineSettings.md).[cache](CommandLineSettings.md#cache)

#### Defined in

[CSpellSettingsDef.ts:333](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L333)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`default`** false

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[caseSensitive](ExtendableSettings.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:445](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L445)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[description](ExtendableSettings.md#description)

#### Defined in

[CSpellSettingsDef.ts:409](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L409)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use. Each entry should match the name of the dictionary.

To remove a dictionary from the list, add `!` before the name.

For example, `!typescript` will turn off the dictionary with the name `typescript`.

See the [Dictionaries](https://cspell.org/docs/dictionaries/)
and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[dictionaries](ExtendableSettings.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:471](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L471)

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

[ExtendableSettings](ExtendableSettings.md).[dictionaryDefinitions](ExtendableSettings.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:459](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L459)

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

[CSpellSettingsDef.ts:200](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L200)

___

### enableGlobDot

• `Optional` **enableGlobDot**: `boolean`

Enable scanning files and directories beginning with `.` (period).

By default, CSpell does not scan `hidden` files.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:85](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L85)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`default`** true

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[enabled](ExtendableSettings.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:415](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L415)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[enabledLanguageIds](ExtendableSettings.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:182](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L182)

___

### failFast

• `Optional` **failFast**: `boolean`

Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks)

**`default`** false

#### Inherited from

[CommandLineSettings](CommandLineSettings.md).[failFast](CommandLineSettings.md#failfast)

#### Defined in

[CSpellSettingsDef.ts:338](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L338)

___

### features

• `Optional` **features**: [`Features`](Features.md)

Configure CSpell features.

- Added with `v5.16.0`.

#### Defined in

[CSpellSettingsDef.ts:131](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L131)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be checked.

Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Defined in

[CSpellSettingsDef.ts:76](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L76)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[flagWords](ExtendableSettings.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:421](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L421)

___

### gitignoreRoot

• `Optional` **gitignoreRoot**: `string` \| `string`[]

Tells the spell checker to searching for `.gitignore` files when it reaches a matching root.

#### Defined in

[CSpellSettingsDef.ts:124](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L124)

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

#### Defined in

[CSpellSettingsDef.ts:69](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L69)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[id](ExtendableSettings.md#id)

#### Defined in

[CSpellSettingsDef.ts:403](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L403)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be ignored.

Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Defined in

[CSpellSettingsDef.ts:92](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L92)

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

[ExtendableSettings](ExtendableSettings.md).[ignoreRegExpList](ExtendableSettings.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:495](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L495)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[ignoreWords](ExtendableSettings.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

___

### import

• `Optional` **import**: `string` \| `string`[]

Allows this configuration to inherit configuration for one or more other files.

See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.

#### Defined in

[CSpellSettingsDef.ts:52](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L52)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[includeRegExpList](ExtendableSettings.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:505](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L505)

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

[ExtendableSettings](ExtendableSettings.md).[language](ExtendableSettings.md#language)

#### Defined in

[CSpellSettingsDef.ts:179](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L179)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[languageId](ExtendableSettings.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:210](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L210)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[languageSettings](ExtendableSettings.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:207](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L207)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
will prevent ALL default configuration from being loaded.

**`default`** true

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[loadDefaultConfiguration](ExtendableSettings.md#loaddefaultconfiguration)

#### Defined in

[CSpellSettingsDef.ts:218](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L218)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[maxDuplicateProblems](ExtendableSettings.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:234](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L234)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[maxNumberOfProblems](ExtendableSettings.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:227](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L227)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[minWordLength](ExtendableSettings.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:241](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L241)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[name](ExtendableSettings.md#name)

#### Defined in

[CSpellSettingsDef.ts:406](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L406)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

Prevents searching for local configuration when checking individual documents.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:99](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L99)

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

[CSpellSettingsDef.ts:482](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L482)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`default`** 10

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[numSuggestions](ExtendableSettings.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:250](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L250)

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

[ExtendableSettings](ExtendableSettings.md).[overrides](ExtendableSettings.md#overrides)

#### Defined in

[CSpellSettingsDef.ts:164](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L164)

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

[ExtendableSettings](ExtendableSettings.md).[patterns](ExtendableSettings.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:532](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L532)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[pnpFiles](ExtendableSettings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:291](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L291)

___

### readonly

• `Optional` **readonly**: `boolean`

Indicate that the configuration file should not be modified.
This is used to prevent tools like the VS Code Spell Checker from
modifying the file to add words and other configuration.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:108](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L108)

___

### reporters

• `Optional` **reporters**: [`ReporterSettings`](../modules.md#reportersettings)[]

Custom reporters configuration.

#### Defined in

[CSpellSettingsDef.ts:113](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L113)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[suggestionNumChanges](ExtendableSettings.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:268](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L268)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[suggestionsTimeout](ExtendableSettings.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:257](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L257)

___

### useGitignore

• `Optional` **useGitignore**: `boolean`

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:119](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L119)

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

[CSpellSettingsDef.ts:284](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L284)

___

### userWords

• `Optional` **userWords**: `string`[]

Words to add to global dictionary -- should only be in the user config file.

#### Defined in

[CSpellSettingsDef.ts:45](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L45)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

Configuration format version of the settings file.

This controls how the settings in the configuration file behave.

**`default`** "0.2"

#### Defined in

[CSpellSettingsDef.ts:42](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L42)

___

### words

• `Optional` **words**: `string`[]

List of words to be always considered correct.

#### Inherited from

[ExtendableSettings](ExtendableSettings.md).[words](ExtendableSettings.md#words)

#### Defined in

[CSpellSettingsDef.ts:418](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L418)
