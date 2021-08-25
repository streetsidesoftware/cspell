[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionPreferred

# Interface: DictionaryDefinitionPreferred

## Hierarchy

- [`DictionaryDefinitionBase`](DictionaryDefinitionBase.md)

  ↳ **`DictionaryDefinitionPreferred`**

  ↳↳ [`DictionaryDefinitionCustom`](DictionaryDefinitionCustom.md)

## Table of contents

### Properties

- [description](DictionaryDefinitionPreferred.md#description)
- [name](DictionaryDefinitionPreferred.md#name)
- [noSuggest](DictionaryDefinitionPreferred.md#nosuggest)
- [path](DictionaryDefinitionPreferred.md#path)
- [repMap](DictionaryDefinitionPreferred.md#repmap)
- [useCompounds](DictionaryDefinitionPreferred.md#usecompounds)

## Properties

### description

• `Optional` **description**: `string`

Optional description

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[description](DictionaryDefinitionBase.md#description)

#### Defined in

[settings/CSpellSettingsDef.ts:332](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L332)

___

### name

• **name**: `string`

This is the name of a dictionary.

Name Format:
- Must contain at least 1 number or letter.
- spaces are allowed.
- Leading and trailing space will be removed.
- Names ARE case-sensitive
- Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[name](DictionaryDefinitionBase.md#name)

#### Defined in

[settings/CSpellSettingsDef.ts:330](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L330)

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

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[noSuggest](DictionaryDefinitionBase.md#nosuggest)

#### Defined in

[settings/CSpellSettingsDef.ts:346](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L346)

___

### path

• **path**: `string`

Path to the file

#### Defined in

[settings/CSpellSettingsDef.ts:351](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L351)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[repMap](DictionaryDefinitionBase.md#repmap)

#### Defined in

[settings/CSpellSettingsDef.ts:334](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L334)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[useCompounds](DictionaryDefinitionBase.md#usecompounds)

#### Defined in

[settings/CSpellSettingsDef.ts:336](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L336)
