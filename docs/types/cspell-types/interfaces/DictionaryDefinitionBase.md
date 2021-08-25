[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionBase

# Interface: DictionaryDefinitionBase

## Hierarchy

- **`DictionaryDefinitionBase`**

  ↳ [`DictionaryDefinitionPreferred`](DictionaryDefinitionPreferred.md)

  ↳ [`DictionaryDefinitionAlternate`](DictionaryDefinitionAlternate.md)

## Table of contents

### Properties

- [description](DictionaryDefinitionBase.md#description)
- [name](DictionaryDefinitionBase.md#name)
- [noSuggest](DictionaryDefinitionBase.md#nosuggest)
- [repMap](DictionaryDefinitionBase.md#repmap)
- [useCompounds](DictionaryDefinitionBase.md#usecompounds)

## Properties

### description

• `Optional` **description**: `string`

Optional description

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

#### Defined in

[settings/CSpellSettingsDef.ts:346](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L346)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs

#### Defined in

[settings/CSpellSettingsDef.ts:334](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L334)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds

#### Defined in

[settings/CSpellSettingsDef.ts:336](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L336)
