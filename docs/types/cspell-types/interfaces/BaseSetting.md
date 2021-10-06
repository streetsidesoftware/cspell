[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / BaseSetting

# Interface: BaseSetting

## Hierarchy

- **`BaseSetting`**

  ↳ [`Settings`](Settings.md)

  ↳ [`LanguageSetting`](LanguageSetting.md)

## Table of contents

### Properties

- [allowCompoundWords](BaseSetting.md#allowcompoundwords)
- [caseSensitive](BaseSetting.md#casesensitive)
- [description](BaseSetting.md#description)
- [dictionaries](BaseSetting.md#dictionaries)
- [dictionaryDefinitions](BaseSetting.md#dictionarydefinitions)
- [enabled](BaseSetting.md#enabled)
- [flagWords](BaseSetting.md#flagwords)
- [id](BaseSetting.md#id)
- [ignoreRegExpList](BaseSetting.md#ignoreregexplist)
- [ignoreWords](BaseSetting.md#ignorewords)
- [includeRegExpList](BaseSetting.md#includeregexplist)
- [name](BaseSetting.md#name)
- [noSuggestDictionaries](BaseSetting.md#nosuggestdictionaries)
- [patterns](BaseSetting.md#patterns)
- [words](BaseSetting.md#words)

## Properties

### allowCompoundWords

• `Optional` **allowCompoundWords**: `boolean`

True to enable compound word checking.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:300](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L300)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Words must match case rules.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:306](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L306)

___

### description

• `Optional` **description**: `string`

Optional description of configuration

#### Defined in

[CSpellSettingsDef.ts:279](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L279)

___

### dictionaries

• `Optional` **dictionaries**: `string`[]

Optional list of dictionaries to use.
Each entry should match the name of the dictionary.
To remove a dictionary from the list add `!` before the name.
i.e. `!typescript` will turn off the dictionary with the name `typescript`.

#### Defined in

[CSpellSettingsDef.ts:317](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L317)

___

### dictionaryDefinitions

• `Optional` **dictionaryDefinitions**: [`DictionaryDefinition`](../modules.md#dictionarydefinition)[]

Define additional available dictionaries

#### Defined in

[CSpellSettingsDef.ts:309](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L309)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled

**`default`** true

#### Defined in

[CSpellSettingsDef.ts:285](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L285)

___

### flagWords

• `Optional` **flagWords**: `string`[]

list of words to always be considered incorrect.

#### Defined in

[CSpellSettingsDef.ts:291](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L291)

___

### id

• `Optional` **id**: `string`

Optional identifier

#### Defined in

[CSpellSettingsDef.ts:273](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L273)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or Pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href

#### Defined in

[CSpellSettingsDef.ts:335](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L335)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An Ignored word will not show up as an error even if it is also in the `flagWords`.

#### Defined in

[CSpellSettingsDef.ts:294](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L294)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of RegExp patterns or defined Pattern names to define the text to be included for spell checking.
If includeRegExpList is defined, ONLY, text matching the included patterns will be checked.

#### Defined in

[CSpellSettingsDef.ts:341](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L341)

___

### name

• `Optional` **name**: `string`

Optional name of configuration

#### Defined in

[CSpellSettingsDef.ts:276](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L276)

___

### noSuggestDictionaries

• `Optional` **noSuggestDictionaries**: `string`[]

Optional list of dictionaries that will not be used for suggestions.
Words in these dictionaries are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
one of these dictionaries, it will be removed from the set of
possible suggestions.

#### Defined in

[CSpellSettingsDef.ts:328](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L328)

___

### patterns

• `Optional` **patterns**: [`RegExpPatternDefinition`](RegExpPatternDefinition.md)[]

Defines a list of patterns that can be used in ignoreRegExpList and includeRegExpList

#### Defined in

[CSpellSettingsDef.ts:344](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L344)

___

### words

• `Optional` **words**: `string`[]

list of words to be always considered correct

#### Defined in

[CSpellSettingsDef.ts:288](https://github.com/streetsidesoftware/cspell/blob/34586d56/packages/cspell-types/src/CSpellSettingsDef.ts#L288)
