[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / ExtendableSettings

# Interface: ExtendableSettings

In the below JSDoc comment, we helpfully specify an example configuration for the end-user to
reference. And this example will get captured by the automatic documentation generator.

However, specifying the glob pattern inside of a JSDoc is tricky, because the glob contains the
same symbol as the end-of-JSDoc symbol. To work around this, we insert a zero-width space in
between the "*" and the "/" symbols.

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
- [loadDefaultConfiguration](ExtendableSettings.md#loaddefaultconfiguration)
- [maxDuplicateProblems](ExtendableSettings.md#maxduplicateproblems)
- [maxNumberOfProblems](ExtendableSettings.md#maxnumberofproblems)
- [minWordLength](ExtendableSettings.md#minwordlength)
- [name](ExtendableSettings.md#name)
- [noSuggestDictionaries](ExtendableSettings.md#nosuggestdictionaries)
- [numSuggestions](ExtendableSettings.md#numsuggestions)
- [overrides](ExtendableSettings.md#overrides)
- [parser](ExtendableSettings.md#parser)
- [patterns](ExtendableSettings.md#patterns)
- [pnpFiles](ExtendableSettings.md#pnpfiles)
- [suggestionNumChanges](ExtendableSettings.md#suggestionnumchanges)
- [suggestionsTimeout](ExtendableSettings.md#suggestionstimeout)
- [usePnP](ExtendableSettings.md#usepnp)
- [words](ExtendableSettings.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.

**`Default`**

false

#### Inherited from

[Settings](Settings.md).[allowCompoundWords](Settings.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:452](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L452)

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

[Settings](Settings.md).[caseSensitive](Settings.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:463](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L463)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

#### Inherited from

[Settings](Settings.md).[description](Settings.md#description)

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use. Each entry should match the name of the dictionary.

To remove a dictionary from the list, add `!` before the name.

For example, `!typescript` will turn off the dictionary with the name `typescript`.

See the [Dictionaries](https://cspell.org/docs/dictionaries/)
and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.

#### Inherited from

[Settings](Settings.md).[dictionaries](Settings.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:489](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L489)

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

[Settings](Settings.md).[dictionaryDefinitions](Settings.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:477](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L477)

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

[Settings](Settings.md).[enableFiletypes](Settings.md#enablefiletypes)

#### Defined in

[CSpellSettingsDef.ts:208](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L208)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`Default`**

true

#### Inherited from

[Settings](Settings.md).[enabled](Settings.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:433](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L433)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[Settings](Settings.md).[enabledLanguageIds](Settings.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:190](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L190)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect.

#### Inherited from

[Settings](Settings.md).[flagWords](Settings.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:439](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L439)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Inherited from

[Settings](Settings.md).[id](Settings.md#id)

#### Defined in

[CSpellSettingsDef.ts:421](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L421)

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

[Settings](Settings.md).[ignoreRegExpList](Settings.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:513](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L513)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

#### Inherited from

[Settings](Settings.md).[ignoreWords](Settings.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:445](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L445)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Inherited from

[Settings](Settings.md).[includeRegExpList](Settings.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:523](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L523)

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

[Settings](Settings.md).[language](Settings.md#language)

#### Defined in

[CSpellSettingsDef.ts:187](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L187)

___

### languageId

• `Optional` **languageId**: `string`

Forces the spell checker to assume a give language id. Used mainly as an Override.

#### Inherited from

[Settings](Settings.md).[languageId](Settings.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:218](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L218)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.

#### Inherited from

[Settings](Settings.md).[languageSettings](Settings.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:215](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L215)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
will prevent ALL default configuration from being loaded.

**`Default`**

true

#### Inherited from

[Settings](Settings.md).[loadDefaultConfiguration](Settings.md#loaddefaultconfiguration)

#### Defined in

[CSpellSettingsDef.ts:226](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L226)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`Default`**

5

#### Inherited from

[Settings](Settings.md).[maxDuplicateProblems](Settings.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:242](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L242)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`Default`**

100

#### Inherited from

[Settings](Settings.md).[maxNumberOfProblems](Settings.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:235](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L235)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`Default`**

4

#### Inherited from

[Settings](Settings.md).[minWordLength](Settings.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:249](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L249)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Inherited from

[Settings](Settings.md).[name](Settings.md#name)

#### Defined in

[CSpellSettingsDef.ts:424](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L424)

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

[CSpellSettingsDef.ts:500](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L500)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`Default`**

10

#### Inherited from

[Settings](Settings.md).[numSuggestions](Settings.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:258](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L258)

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

#### Defined in

[CSpellSettingsDef.ts:172](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L172)

___

### parser

• `Optional` **parser**: `string`

Parser to use for the file content

**`Version`**

6.2.0

#### Inherited from

[Settings](Settings.md).[parser](Settings.md#parser)

#### Defined in

[CSpellSettingsDef.ts:813](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L813)

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

[Settings](Settings.md).[patterns](Settings.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:550](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L550)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`Default`**

[".pnp.js", ".pnp.cjs"]

#### Inherited from

[Settings](Settings.md).[pnpFiles](Settings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:299](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L299)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`Default`**

3

#### Inherited from

[Settings](Settings.md).[suggestionNumChanges](Settings.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:276](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L276)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`Default`**

500

#### Inherited from

[Settings](Settings.md).[suggestionsTimeout](Settings.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:265](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L265)

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

[Settings](Settings.md).[usePnP](Settings.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:292](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L292)

___

### words

• `Optional` **words**: `string`[]

List of words to be always considered correct.

#### Inherited from

[Settings](Settings.md).[words](Settings.md#words)

#### Defined in

[CSpellSettingsDef.ts:436](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L436)
