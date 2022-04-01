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
- [patterns](OverrideSettings.md#patterns)
- [pnpFiles](OverrideSettings.md#pnpfiles)
- [suggestionNumChanges](OverrideSettings.md#suggestionnumchanges)
- [suggestionsTimeout](OverrideSettings.md#suggestionstimeout)
- [usePnP](OverrideSettings.md#usepnp)
- [words](OverrideSettings.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking.

**`default`** false

#### Inherited from

[Settings](Settings.md).[allowCompoundWords](Settings.md#allowcompoundwords)

#### Defined in

[CSpellSettingsDef.ts:376](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L376)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`default`** false

#### Inherited from

[Settings](Settings.md).[caseSensitive](Settings.md#casesensitive)

#### Defined in

[CSpellSettingsDef.ts:387](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L387)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

#### Inherited from

[Settings](Settings.md).[description](Settings.md#description)

#### Defined in

[CSpellSettingsDef.ts:355](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L355)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use.
Each entry should match the name of the dictionary.
To remove a dictionary from the list add `!` before the name.
i.e. `!typescript` will turn off the dictionary with the name `typescript`.

#### Inherited from

[Settings](Settings.md).[dictionaries](Settings.md#dictionaries)

#### Defined in

[CSpellSettingsDef.ts:398](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L398)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries.

#### Inherited from

[Settings](Settings.md).[dictionaryDefinitions](Settings.md#dictionarydefinitions)

#### Defined in

[CSpellSettingsDef.ts:390](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L390)

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

[Settings](Settings.md).[enableFiletypes](Settings.md#enablefiletypes)

#### Defined in

[CSpellSettingsDef.ts:157](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L157)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`default`** true

#### Inherited from

[Settings](Settings.md).[enabled](Settings.md#enabled)

#### Defined in

[CSpellSettingsDef.ts:361](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L361)

___

### enabledLanguageIds

• `Optional` **enabledLanguageIds**: `string`[]

languageIds for the files to spell check.

#### Inherited from

[Settings](Settings.md).[enabledLanguageIds](Settings.md#enabledlanguageids)

#### Defined in

[CSpellSettingsDef.ts:139](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L139)

___

### filename

• **filename**: [`Glob`](../modules.md#glob) \| [`Glob`](../modules.md#glob)[]

Glob pattern or patterns to match against.

#### Inherited from

[OverrideFilterFields](OverrideFilterFields.md).[filename](OverrideFilterFields.md#filename)

#### Defined in

[CSpellSettingsDef.ts:344](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L344)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect.

#### Inherited from

[Settings](Settings.md).[flagWords](Settings.md#flagwords)

#### Defined in

[CSpellSettingsDef.ts:367](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L367)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Inherited from

[Settings](Settings.md).[id](Settings.md#id)

#### Defined in

[CSpellSettingsDef.ts:349](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L349)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href.

#### Inherited from

[Settings](Settings.md).[ignoreRegExpList](Settings.md#ignoreregexplist)

#### Defined in

[CSpellSettingsDef.ts:416](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L416)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Inherited from

[Settings](Settings.md).[ignoreWords](Settings.md#ignorewords)

#### Defined in

[CSpellSettingsDef.ts:370](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L370)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Inherited from

[Settings](Settings.md).[includeRegExpList](Settings.md#includeregexplist)

#### Defined in

[CSpellSettingsDef.ts:422](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L422)

___

### language

• `Optional` **language**: `string`

Sets the locale.

#### Overrides

[Settings](Settings.md).[language](Settings.md#language)

#### Defined in

[CSpellSettingsDef.ts:339](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L339)

___

### languageId

• `Optional` **languageId**: `string`

Sets the programming language id.

#### Overrides

[Settings](Settings.md).[languageId](Settings.md#languageid)

#### Defined in

[CSpellSettingsDef.ts:336](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L336)

___

### languageSettings

• `Optional` **languageSettings**: [`LanguageSetting`](LanguageSetting.md)[]

Additional settings for individual languages.

#### Inherited from

[Settings](Settings.md).[languageSettings](Settings.md#languagesettings)

#### Defined in

[CSpellSettingsDef.ts:160](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L160)

___

### loadDefaultConfiguration

• `Optional` **loadDefaultConfiguration**: `boolean`

By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
will prevent ALL default configuration from being loaded.

**`default`** true;

#### Inherited from

[Settings](Settings.md).[loadDefaultConfiguration](Settings.md#loaddefaultconfiguration)

#### Defined in

[CSpellSettingsDef.ts:170](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L170)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`default`** 5

#### Inherited from

[Settings](Settings.md).[maxDuplicateProblems](Settings.md#maxduplicateproblems)

#### Defined in

[CSpellSettingsDef.ts:184](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L184)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Inherited from

[Settings](Settings.md).[maxNumberOfProblems](Settings.md#maxnumberofproblems)

#### Defined in

[CSpellSettingsDef.ts:178](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L178)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Inherited from

[Settings](Settings.md).[minWordLength](Settings.md#minwordlength)

#### Defined in

[CSpellSettingsDef.ts:190](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L190)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Inherited from

[Settings](Settings.md).[name](Settings.md#name)

#### Defined in

[CSpellSettingsDef.ts:352](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L352)

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

[CSpellSettingsDef.ts:409](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L409)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`default`** 10

#### Inherited from

[Settings](Settings.md).[numSuggestions](Settings.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:198](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L198)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList.

#### Inherited from

[Settings](Settings.md).[patterns](Settings.md#patterns)

#### Defined in

[CSpellSettingsDef.ts:425](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L425)

___

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`default`** [".pnp.js", ".pnp.cjs"]

#### Inherited from

[Settings](Settings.md).[pnpFiles](Settings.md#pnpfiles)

#### Defined in

[CSpellSettingsDef.ts:237](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L237)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Inherited from

[Settings](Settings.md).[suggestionNumChanges](Settings.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:214](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L214)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[Settings](Settings.md).[suggestionsTimeout](Settings.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:204](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L204)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`default`** false

#### Inherited from

[Settings](Settings.md).[usePnP](Settings.md#usepnp)

#### Defined in

[CSpellSettingsDef.ts:230](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L230)

___

### words

• `Optional` **words**: `string`[]

List of words to be always considered correct.

#### Inherited from

[Settings](Settings.md).[words](Settings.md#words)

#### Defined in

[CSpellSettingsDef.ts:364](https://github.com/streetsidesoftware/cspell/blob/46c1e4f/packages/cspell-types/src/CSpellSettingsDef.ts#L364)
