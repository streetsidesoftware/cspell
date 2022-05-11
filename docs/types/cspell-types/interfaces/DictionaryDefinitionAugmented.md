[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionAugmented

# Interface: DictionaryDefinitionAugmented

Used to provide extra data related to the dictionary

## Hierarchy

- [`DictionaryDefinitionPreferred`](DictionaryDefinitionPreferred.md)

  ↳ **`DictionaryDefinitionAugmented`**

## Table of contents

### Properties

- [description](DictionaryDefinitionAugmented.md#description)
- [dictionaryInformation](DictionaryDefinitionAugmented.md#dictionaryinformation)
- [name](DictionaryDefinitionAugmented.md#name)
- [noSuggest](DictionaryDefinitionAugmented.md#nosuggest)
- [path](DictionaryDefinitionAugmented.md#path)
- [repMap](DictionaryDefinitionAugmented.md#repmap)
- [type](DictionaryDefinitionAugmented.md#type)
- [useCompounds](DictionaryDefinitionAugmented.md#usecompounds)

## Properties

### description

• `Optional` **description**: `string`

Optional description.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[description](DictionaryDefinitionPreferred.md#description)

#### Defined in

[CSpellSettingsDef.ts:557](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L557)

___

### dictionaryInformation

• `Optional` **dictionaryInformation**: [`DictionaryInformation`](DictionaryInformation.md)

#### Defined in

[CSpellSettingsDef.ts:601](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L601)

___

### name

• **name**: `string`

This is the name of a dictionary.

Name Format:
- Must contain at least 1 number or letter.
- Spaces are allowed.
- Leading and trailing space will be removed.
- Names ARE case-sensitive.
- Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[name](DictionaryDefinitionPreferred.md#name)

#### Defined in

[CSpellSettingsDef.ts:555](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L555)

___

### noSuggest

• `Optional` **noSuggest**: `boolean`

Indicate that suggestions should not come from this dictionary.
Words in this dictionary are considered correct, but will not be
used when making spell correction suggestions.

Note: if a word is suggested by another dictionary, but found in
this dictionary, it will be removed from the set of
possible suggestions.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[noSuggest](DictionaryDefinitionPreferred.md#nosuggest)

#### Defined in

[CSpellSettingsDef.ts:571](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L571)

___

### path

• **path**: `string`

Path to the file.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[path](DictionaryDefinitionPreferred.md#path)

#### Defined in

[CSpellSettingsDef.ts:586](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L586)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[repMap](DictionaryDefinitionPreferred.md#repmap)

#### Defined in

[CSpellSettingsDef.ts:559](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L559)

___

### type

• `Optional` **type**: [`DictionaryFileTypes`](../modules.md#dictionaryfiletypes)

Type of file:
S - single word per line,
W - each line can contain one or more words separated by space,
C - each line is treated like code (Camel Case is allowed).
Default is S.
C is the slowest to load due to the need to split each line based upon code splitting rules.

**`default`** "S"

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[type](DictionaryDefinitionPreferred.md#type)

#### Defined in

[CSpellSettingsDef.ts:581](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L581)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[useCompounds](DictionaryDefinitionPreferred.md#usecompounds)

#### Defined in

[CSpellSettingsDef.ts:561](https://github.com/streetsidesoftware/cspell/blob/b1f296d/packages/cspell-types/src/CSpellSettingsDef.ts#L561)
