[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / CSpellSettings

# Interface: CSpellSettings

In the below JSDoc comment, we helpfully specify an example configuration for the end-user to
reference. And this example will get captured by the automatic documentation generator.

However, specifying the glob pattern inside of a JSDoc is tricky, because the glob contains the
same symbol as the end-of-JSDoc symbol. To work around this, we insert a zero-width space in
between the "*" and the "/" symbols.

## Hierarchy

- [`FileSettings`](FileSettings.md)

- [`LegacySettings`](LegacySettings.md)

  ↳ **`CSpellSettings`**

  ↳↳ [`CSpellSettingsWithSourceTrace`](CSpellSettingsWithSourceTrace.md)

## Table of contents

### Properties

- [$schema](CSpellSettings.md#$schema)
- [allowCompoundWords](CSpellSettings.md#allowcompoundwords)
- [cache](CSpellSettings.md#cache)
- [caseSensitive](CSpellSettings.md#casesensitive)
- [description](CSpellSettings.md#description)
- [dictionaries](CSpellSettings.md#dictionaries)
- [dictionaryDefinitions](CSpellSettings.md#dictionarydefinitions)
- [enableFiletypes](CSpellSettings.md#enablefiletypes)
- [enableGlobDot](CSpellSettings.md#enableglobdot)
- [enabled](CSpellSettings.md#enabled)
- [enabledLanguageIds](CSpellSettings.md#enabledlanguageids)
- [failFast](CSpellSettings.md#failfast)
- [features](CSpellSettings.md#features)
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
- [loadDefaultConfiguration](CSpellSettings.md#loaddefaultconfiguration)
- [maxDuplicateProblems](CSpellSettings.md#maxduplicateproblems)
- [maxNumberOfProblems](CSpellSettings.md#maxnumberofproblems)
- [minWordLength](CSpellSettings.md#minwordlength)
- [name](CSpellSettings.md#name)
- [noConfigSearch](CSpellSettings.md#noconfigsearch)
- [noSuggestDictionaries](CSpellSettings.md#nosuggestdictionaries)
- [numSuggestions](CSpellSettings.md#numsuggestions)
- [overrides](CSpellSettings.md#overrides)
- [parser](CSpellSettings.md#parser)
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
- [validateDirectives](CSpellSettings.md#validatedirectives)
- [version](CSpellSettings.md#version)
- [words](CSpellSettings.md#words)

## Properties

### $schema

• `Optional` **$schema**: `string`

Url to JSON Schema

**`Default`**

"https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json"

#### Inherited from

[FileSettings](FileSettings.md).[$schema](FileSettings.md#$schema)

#### Defined in

[CSpellSettingsDef.ts:38](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L38)

___

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[allowCompoundWords](FileSettings.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:430](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L430)

___

### cache

• `Optional` **cache**: [`CacheSettings`](CacheSettings.md)

Define cache settings.

#### Inherited from

[FileSettings](FileSettings.md).[cache](FileSettings.md#cache)

#### Defined in

[CSpellSettingsDef.ts:341](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L341)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[caseSensitive](FileSettings.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:441](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L441)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

#### Inherited from

[FileSettings](FileSettings.md).[description](FileSettings.md#description)

#### Defined in

[CSpellSettingsDef.ts:417](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L417)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use. Each entry should match the name of the dictionary.

To remove a dictionary from the list, add `!` before the name.

For example, `!typescript` will turn off the dictionary with the name `typescript`.

See the [Dictionaries](https://cspell.org/docs/dictionaries/)
and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.

#### Inherited from

[FileSettings](FileSettings.md).[dictionaries](FileSettings.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:467](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L467)

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

[FileSettings](FileSettings.md).[dictionaryDefinitions](FileSettings.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:455](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L455)

___

### enableFiletypes

• `Optional` **enableFiletypes**: `string`[]

**`Title`**

File Types to Check

**`Scope`**

resource

**`Unique Items`**

true

**`Markdown Description`**

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

[CSpellSettingsDef.ts:219](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L219)

___

### enableGlobDot

• `Optional` **enableGlobDot**: `boolean`

Enable scanning files and directories beginning with `.` (period).

By default, CSpell does not scan `hidden` files.

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[enableGlobDot](FileSettings.md#enableglobdot)

#### Defined in

[CSpellSettingsDef.ts:90](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L90)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`Default`**

true

#### Inherited from

[FileSettings](FileSettings.md).[enabled](FileSettings.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:423](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L423)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[FileSettings](FileSettings.md).[enabledLanguageIds](FileSettings.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:201](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L201)

___

### failFast

• `Optional` **failFast**: `boolean`

Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks)

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[failFast](FileSettings.md#failfast)

#### Defined in

[CSpellSettingsDef.ts:346](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L346)

___

### features

• `Optional` **features**: [`Features`](Features.md)

Configure CSpell features.

**`Version`**

5.16.0

#### Inherited from

[FileSettings](FileSettings.md).[features](FileSettings.md#features)

#### Defined in

[CSpellSettingsDef.ts:150](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L150)

___

### files

• `Optional` **files**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be checked.

Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[FileSettings](FileSettings.md).[files](FileSettings.md#files)

#### Defined in

[CSpellSettingsDef.ts:81](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L81)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect. Words found in `flagWords` override `words`.

Format of `flagWords`
- single word entry - `word`
- with suggestions - `word:suggestion` or `word->suggestion, suggestions`

Example:
```ts
"flagWords": [
  "color: colour",
  "incase: in case, encase",
  "canot->cannot",
  "cancelled->canceled"
]
```

#### Inherited from

[FileSettings](FileSettings.md).[flagWords](FileSettings.md#flagwords)

#### Defined in

[InlineDictionary.ts:25](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/InlineDictionary.ts#L25)

___

### gitignoreRoot

• `Optional` **gitignoreRoot**: `string` \| `string`[]

Tells the spell checker to searching for `.gitignore` files when it reaches a matching root.

#### Inherited from

[FileSettings](FileSettings.md).[gitignoreRoot](FileSettings.md#gitignoreroot)

#### Defined in

[CSpellSettingsDef.ts:138](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L138)

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

[FileSettings](FileSettings.md).[globRoot](FileSettings.md#globroot)

#### Defined in

[CSpellSettingsDef.ts:74](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L74)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Inherited from

[FileSettings](FileSettings.md).[id](FileSettings.md#id)

#### Defined in

[CSpellSettingsDef.ts:411](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L411)

___

### ignorePaths

• `Optional` **ignorePaths**: [`Glob`](../modules.md#glob)[]

Glob patterns of files to be ignored.

Glob patterns are relative to the `globRoot` of the configuration file that defines them.

#### Inherited from

[FileSettings](FileSettings.md).[ignorePaths](FileSettings.md#ignorepaths)

#### Defined in

[CSpellSettingsDef.ts:97](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L97)

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

[FileSettings](FileSettings.md).[ignoreRegExpList](FileSettings.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:491](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L491)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

#### Inherited from

[FileSettings](FileSettings.md).[ignoreWords](FileSettings.md#ignorewords)

#### Defined in

[InlineDictionary.ts:31](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/InlineDictionary.ts#L31)

___

### import

• `Optional` **import**: `string` \| `string`[]

Allows this configuration to inherit configuration for one or more other files.

See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.

#### Inherited from

[FileSettings](FileSettings.md).[import](FileSettings.md#import)

#### Defined in

[CSpellSettingsDef.ts:57](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L57)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Inherited from

[FileSettings](FileSettings.md).[includeRegExpList](FileSettings.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:501](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L501)

___

### language

• `Optional` **language**: `string`

Current active spelling language. This specifies the language locale to use in choosing the
general dictionary.

For example:

- "en-GB" for British English.
- "en,nl" to enable both English and Dutch.

**`Default`**

"en"

#### Inherited from

[FileSettings](FileSettings.md).[language](FileSettings.md#language)

#### Defined in

[CSpellSettingsDef.ts:198](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L198)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[FileSettings](FileSettings.md).[languageId](FileSettings.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:229](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L229)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.

#### Inherited from

[FileSettings](FileSettings.md).[languageSettings](FileSettings.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:226](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L226)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
will prevent ALL default configuration from being loaded.

**`Default`**

true

#### Inherited from

[FileSettings](FileSettings.md).[loadDefaultConfiguration](FileSettings.md#loaddefaultconfiguration)

#### Defined in

[CSpellSettingsDef.ts:237](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L237)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`Default`**

5

#### Inherited from

[FileSettings](FileSettings.md).[maxDuplicateProblems](FileSettings.md#maxduplicateproblems)

#### Defined in

[CSpellReporter.ts:134](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L134)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`Default`**

10000

#### Inherited from

[FileSettings](FileSettings.md).[maxNumberOfProblems](FileSettings.md#maxnumberofproblems)

#### Defined in

[CSpellReporter.ts:127](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L127)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`Default`**

4

#### Inherited from

[FileSettings](FileSettings.md).[minWordLength](FileSettings.md#minwordlength)

#### Defined in

[CSpellReporter.ts:141](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L141)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Inherited from

[FileSettings](FileSettings.md).[name](FileSettings.md#name)

#### Defined in

[CSpellSettingsDef.ts:414](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L414)

___

### noConfigSearch

• `Optional` **noConfigSearch**: `boolean`

Prevents searching for local configuration when checking individual documents.

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[noConfigSearch](FileSettings.md#noconfigsearch)

#### Defined in

[CSpellSettingsDef.ts:104](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L104)

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

[CSpellSettingsDef.ts:478](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L478)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`Default`**

10

#### Inherited from

[FileSettings](FileSettings.md).[numSuggestions](FileSettings.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:248](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L248)

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

[FileSettings](FileSettings.md).[overrides](FileSettings.md#overrides)

#### Defined in

[CSpellSettingsDef.ts:183](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L183)

___

### parser

• `Optional` **parser**: `string`

Parser to use for the file content

**`Version`**

6.2.0

#### Inherited from

[FileSettings](FileSettings.md).[parser](FileSettings.md#parser)

#### Defined in

[CSpellSettingsDef.ts:811](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L811)

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

[FileSettings](FileSettings.md).[patterns](FileSettings.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:528](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L528)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`Default`**

[".pnp.js", ".pnp.cjs"]

#### Inherited from

[FileSettings](FileSettings.md).[pnpFiles](FileSettings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:289](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L289)

___

### readonly

• `Optional` **readonly**: `boolean`

Indicate that the configuration file should not be modified.
This is used to prevent tools like the VS Code Spell Checker from
modifying the file to add words and other configuration.

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[readonly](FileSettings.md#readonly)

#### Defined in

[CSpellSettingsDef.ts:113](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L113)

___

### reporters

• `Optional` **reporters**: [`ReporterSettings`](../modules.md#reportersettings)[]

Define which reports to use.
`default` - is a special name for the default cli reporter.

Examples:
- `["default"]` - to use the default reporter
- `["@cspell/cspell-json-reporter"]` - use the cspell JSON reporter.
- `[["@cspell/cspell-json-reporter", { "outFile": "out.json" }]]`
- `[ "default", ["@cspell/cspell-json-reporter", { "outFile": "out.json" }]]` - Use both the default reporter and the cspell-json-reporter.

**`Default`**

["default"]

#### Inherited from

[FileSettings](FileSettings.md).[reporters](FileSettings.md#reporters)

#### Defined in

[CSpellSettingsDef.ts:127](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L127)

___

### showStatus

• `Optional` **showStatus**: `boolean`

Show status.

**`Deprecated`**

true

#### Inherited from

[LegacySettings](LegacySettings.md).[showStatus](LegacySettings.md#showstatus)

#### Defined in

[CSpellSettingsDef.ts:386](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L386)

___

### spellCheckDelayMs

• `Optional` **spellCheckDelayMs**: `number`

Delay in ms after a document has changed before checking it for spelling errors.

**`Deprecated`**

true

#### Inherited from

[LegacySettings](LegacySettings.md).[spellCheckDelayMs](LegacySettings.md#spellcheckdelayms)

#### Defined in

[CSpellSettingsDef.ts:392](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L392)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`Default`**

3

#### Inherited from

[FileSettings](FileSettings.md).[suggestionNumChanges](FileSettings.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:266](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L266)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`Default`**

500

#### Inherited from

[FileSettings](FileSettings.md).[suggestionsTimeout](FileSettings.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:255](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L255)

___

### useGitignore

• `Optional` **useGitignore**: `boolean`

Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[useGitignore](FileSettings.md#usegitignore)

#### Defined in

[CSpellSettingsDef.ts:133](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L133)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`Default`**

false

#### Inherited from

[FileSettings](FileSettings.md).[usePnP](FileSettings.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:282](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L282)

___

### userWords

• `Optional` **userWords**: `string`[]

Words to add to global dictionary -- should only be in the user config file.

#### Inherited from

[FileSettings](FileSettings.md).[userWords](FileSettings.md#userwords)

#### Defined in

[CSpellSettingsDef.ts:50](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L50)

___

### validateDirectives

• `Optional` **validateDirectives**: `boolean`

Verify that the in-document directives are correct.

#### Inherited from

[FileSettings](FileSettings.md).[validateDirectives](FileSettings.md#validatedirectives)

#### Defined in

[CSpellSettingsDef.ts:143](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L143)

___

### version

• `Optional` **version**: [`Version`](../modules.md#version)

Configuration format version of the settings file.

This controls how the settings in the configuration file behave.

**`Default`**

"0.2"

#### Inherited from

[FileSettings](FileSettings.md).[version](FileSettings.md#version)

#### Defined in

[CSpellSettingsDef.ts:47](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L47)

___

### words

• `Optional` **words**: `string`[]

List of words to be considered correct.

#### Inherited from

[FileSettings](FileSettings.md).[words](FileSettings.md#words)

#### Defined in

[InlineDictionary.ts:5](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/InlineDictionary.ts#L5)
