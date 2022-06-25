[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionPreferred

# Interface: DictionaryDefinitionPreferred

## Hierarchy

- [`DictionaryDefinitionBase`](DictionaryDefinitionBase.md)

  ↳ **`DictionaryDefinitionPreferred`**

  ↳↳ [`DictionaryDefinitionAugmented`](DictionaryDefinitionAugmented.md)

  ↳↳ [`DictionaryDefinitionCustom`](DictionaryDefinitionCustom.md)

## Table of contents

### Properties

- [description](DictionaryDefinitionPreferred.md#description)
- [name](DictionaryDefinitionPreferred.md#name)
- [noSuggest](DictionaryDefinitionPreferred.md#nosuggest)
- [path](DictionaryDefinitionPreferred.md#path)
- [repMap](DictionaryDefinitionPreferred.md#repmap)
- [type](DictionaryDefinitionPreferred.md#type)
- [useCompounds](DictionaryDefinitionPreferred.md#usecompounds)

## Properties

### description

• `Optional` **description**: `string`

Optional description.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[description](DictionaryDefinitionBase.md#description)

#### Defined in

[CSpellSettingsDef.ts:558](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/CSpellSettingsDef.ts#L558)

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

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[name](DictionaryDefinitionBase.md#name)

#### Defined in

[CSpellSettingsDef.ts:556](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/CSpellSettingsDef.ts#L556)

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

[CSpellSettingsDef.ts:572](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/CSpellSettingsDef.ts#L572)

___

### path

• **path**: `string`

Path to the file.

#### Defined in

[CSpellSettingsDef.ts:587](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/CSpellSettingsDef.ts#L587)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[repMap](DictionaryDefinitionBase.md#repmap)

#### Defined in

[CSpellSettingsDef.ts:560](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/CSpellSettingsDef.ts#L560)

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

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[type](DictionaryDefinitionBase.md#type)

#### Defined in

[CSpellSettingsDef.ts:582](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/CSpellSettingsDef.ts#L582)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[useCompounds](DictionaryDefinitionBase.md#usecompounds)

#### Defined in

[CSpellSettingsDef.ts:562](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/CSpellSettingsDef.ts#L562)
