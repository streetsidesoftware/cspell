[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionAlternate

# Interface: DictionaryDefinitionAlternate

Only for legacy dictionary definitions

**`deprecated`** true

**`deprecationmessage`** Use `DictionaryDefinitionPreferred`

## Hierarchy

- [`DictionaryDefinitionBase`](DictionaryDefinitionBase.md)

  ↳ **`DictionaryDefinitionAlternate`**

## Table of contents

### Properties

- [description](DictionaryDefinitionAlternate.md#description)
- [file](DictionaryDefinitionAlternate.md#file)
- [name](DictionaryDefinitionAlternate.md#name)
- [noSuggest](DictionaryDefinitionAlternate.md#nosuggest)
- [repMap](DictionaryDefinitionAlternate.md#repmap)
- [type](DictionaryDefinitionAlternate.md#type)
- [useCompounds](DictionaryDefinitionAlternate.md#usecompounds)

## Properties

### description

• `Optional` **description**: `string`

Optional description

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[description](DictionaryDefinitionBase.md#description)

#### Defined in

[CSpellSettingsDef.ts:373](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L373)

___

### file

• **file**: `string`

Path to the file, only for legacy dictionary definitions

**`deprecated`** true

**`deprecationmessage`** Use `path` instead.

#### Defined in

[CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L427)

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

[CSpellSettingsDef.ts:371](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L371)

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

[CSpellSettingsDef.ts:387](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L387)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[repMap](DictionaryDefinitionBase.md#repmap)

#### Defined in

[CSpellSettingsDef.ts:375](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L375)

___

### type

• `Optional` **type**: [`DictionaryFileTypes`](../modules.md#dictionaryfiletypes)

Type of file:
S - single word per line,
W - each line can contain one or more words separated by space,
C - each line is treated like code (Camel Case is allowed)
Default is S
C is the slowest to load due to the need to split each line based upon code splitting rules.

**`default`** "S"

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[type](DictionaryDefinitionBase.md#type)

#### Defined in

[CSpellSettingsDef.ts:397](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L397)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[useCompounds](DictionaryDefinitionBase.md#usecompounds)

#### Defined in

[CSpellSettingsDef.ts:377](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L377)
