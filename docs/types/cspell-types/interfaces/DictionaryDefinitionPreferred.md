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

[DictionaryDefinition.ts:27](https://github.com/streetsidesoftware/cspell/blob/9347337/packages/cspell-types/src/DictionaryDefinition.ts#L27)

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

[DictionaryDefinition.ts:25](https://github.com/streetsidesoftware/cspell/blob/9347337/packages/cspell-types/src/DictionaryDefinition.ts#L25)

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

[DictionaryDefinition.ts:41](https://github.com/streetsidesoftware/cspell/blob/9347337/packages/cspell-types/src/DictionaryDefinition.ts#L41)

___

### path

• **path**: `string`

Path to the file.

#### Defined in

[DictionaryDefinition.ts:56](https://github.com/streetsidesoftware/cspell/blob/9347337/packages/cspell-types/src/DictionaryDefinition.ts#L56)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[repMap](DictionaryDefinitionBase.md#repmap)

#### Defined in

[DictionaryDefinition.ts:29](https://github.com/streetsidesoftware/cspell/blob/9347337/packages/cspell-types/src/DictionaryDefinition.ts#L29)

___

### type

• `Optional` **type**: [`DictionaryFileTypes`](../modules.md#dictionaryfiletypes)

Type of file:
S - single word per line,
W - each line can contain one or more words separated by space,
C - each line is treated like code (Camel Case is allowed).
Default is S.
C is the slowest to load due to the need to split each line based upon code splitting rules.

**`Default`**

"S"

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[type](DictionaryDefinitionBase.md#type)

#### Defined in

[DictionaryDefinition.ts:51](https://github.com/streetsidesoftware/cspell/blob/9347337/packages/cspell-types/src/DictionaryDefinition.ts#L51)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds.

#### Inherited from

[DictionaryDefinitionBase](DictionaryDefinitionBase.md).[useCompounds](DictionaryDefinitionBase.md#usecompounds)

#### Defined in

[DictionaryDefinition.ts:31](https://github.com/streetsidesoftware/cspell/blob/9347337/packages/cspell-types/src/DictionaryDefinition.ts#L31)
