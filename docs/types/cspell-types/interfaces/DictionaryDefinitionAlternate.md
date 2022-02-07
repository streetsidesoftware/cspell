[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionAlternate

# Interface: DictionaryDefinitionAlternate

Only for legacy dictionary definitions.

**`deprecated`** true

**`deprecationmessage`** Use `DictionaryDefinitionPreferred` instead.

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

Optional description.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[description](DictionaryDefinitionBase.md#description)

#### Defined in

[CSpellSettingsDef.ts:439](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L439)

___

### file

• **file**: `string`

Path to the file, only for legacy dictionary definitions.

**`deprecated`** true

**`deprecationmessage`** Use `path` instead.

#### Defined in

[CSpellSettingsDef.ts:500](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L500)

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

[CSpellSettingsDef.ts:437](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L437)

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

[CSpellSettingsDef.ts:453](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L453)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[repMap](DictionaryDefinitionBase.md#repmap)

#### Defined in

[CSpellSettingsDef.ts:441](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L441)

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

[CSpellSettingsDef.ts:463](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L463)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[useCompounds](DictionaryDefinitionBase.md#usecompounds)

#### Defined in

[CSpellSettingsDef.ts:443](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L443)
