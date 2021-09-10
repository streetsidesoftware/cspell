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

[settings/CSpellSettingsDef.ts:352](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L352)

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

[settings/CSpellSettingsDef.ts:350](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L350)

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

[settings/CSpellSettingsDef.ts:366](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L366)

___

### path

• **path**: `string`

Path to the file

#### Defined in

[settings/CSpellSettingsDef.ts:371](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L371)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[repMap](DictionaryDefinitionBase.md#repmap)

#### Defined in

[settings/CSpellSettingsDef.ts:354](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L354)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[useCompounds](DictionaryDefinitionBase.md#usecompounds)

#### Defined in

[settings/CSpellSettingsDef.ts:356](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L356)
