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

True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:434](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L434)

___

### caseSensitive

• `Optional` **caseSensitive**: `boolean`

Determines if words must match case and accent rules.

- `false` - Case is ignored and accents can be missing on the entire word.
  Incorrect accents or partially missing accents will be marked as incorrect.
- `true` - Case and accents are enforced.

**`default`** false

#### Defined in

[CSpellSettingsDef.ts:445](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L445)

___

### description

• `Optional` **description**: `string`

Optional description of configuration.

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

#### Defined in

[CSpellSettingsDef.ts:459](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L459)

___

### enabled

• `Optional` **enabled**: `boolean`

Is the spell checker enabled.

**`default`** true

#### Defined in

[CSpellSettingsDef.ts:415](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L415)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect.

#### Defined in

[CSpellSettingsDef.ts:421](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L421)

___

### id

• `Optional` **id**: `string`

Optional identifier.

#### Defined in

[CSpellSettingsDef.ts:403](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L403)

___

### ignoreRegExpList

• `Optional` **ignoreRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or pattern names to exclude from spell checking.

Example: ["href"] - to exclude html href.

By default, several patterns are excluded. See
[Configuration](https://cspell.org/configuration/#cspelljson-sections) for more details.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Defined in

[CSpellSettingsDef.ts:495](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L495)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

___

### includeRegExpList

• `Optional` **includeRegExpList**: [`RegExpPatternList`](../modules.md#regexppatternlist)

List of regular expression patterns or defined pattern names to match for spell checking.

If this property is defined, only text matching the included patterns will be checked.

While you can create your own patterns, you can also leverage several patterns that are
[built-in to CSpell](https://github.com/streetsidesoftware/cspell/blob/main/packages/cspell-lib/src/Settings/DefaultSettings.ts#L22).

#### Defined in

[CSpellSettingsDef.ts:505](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L505)

___

### name

• `Optional` **name**: `string`

Optional name of configuration.

#### Defined in

[CSpellSettingsDef.ts:406](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L406)

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

[CSpellSettingsDef.ts:482](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L482)

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

#### Defined in

[CSpellSettingsDef.ts:532](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L532)

___

### words

• `Optional` **words**: `string`[]

List of words to be always considered correct.

#### Defined in

[CSpellSettingsDef.ts:418](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/CSpellSettingsDef.ts#L418)
