[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionCustom

# Interface: DictionaryDefinitionCustom

For Defining Custom dictionaries. They are generally scoped to a
`user`, `workspace`, or `folder`.
When `addWords` is true, indicates that the spell checker can add words
to the file.
Note: only plain text files with one word per line are supported at this moment.

## Hierarchy

- [`DictionaryDefinitionPreferred`](DictionaryDefinitionPreferred.md)

  ↳ **`DictionaryDefinitionCustom`**

## Table of contents

### Properties

- [addWords](DictionaryDefinitionCustom.md#addwords)
- [description](DictionaryDefinitionCustom.md#description)
- [name](DictionaryDefinitionCustom.md#name)
- [noSuggest](DictionaryDefinitionCustom.md#nosuggest)
- [path](DictionaryDefinitionCustom.md#path)
- [repMap](DictionaryDefinitionCustom.md#repmap)
- [scope](DictionaryDefinitionCustom.md#scope)
- [type](DictionaryDefinitionCustom.md#type)
- [useCompounds](DictionaryDefinitionCustom.md#usecompounds)

## Properties

### addWords

• **addWords**: `boolean`

When `true`, let's the spell checker know that words can be added to this dictionary.

#### Defined in

[DictionaryDefinition.ts:193](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L193)

___

### description

• `Optional` **description**: `string`

Optional description.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[description](DictionaryDefinitionPreferred.md#description)

#### Defined in

[DictionaryDefinition.ts:27](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L27)

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

[DictionaryDefinition.ts:25](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L25)

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

[DictionaryDefinition.ts:41](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L41)

___

### path

• **path**: `string`

Path to custom dictionary text file.

#### Overrides

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[path](DictionaryDefinitionPreferred.md#path)

#### Defined in

[DictionaryDefinition.ts:182](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L182)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[repMap](DictionaryDefinitionPreferred.md#repmap)

#### Defined in

[DictionaryDefinition.ts:29](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L29)

___

### scope

• `Optional` **scope**: [`CustomDictionaryScope`](../modules.md#customdictionaryscope) \| [`CustomDictionaryScope`](../modules.md#customdictionaryscope)[]

Defines the scope for when words will be added to the dictionary.
Scope values: `user`, `workspace`, `folder`.

#### Defined in

[DictionaryDefinition.ts:188](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L188)

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

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[type](DictionaryDefinitionPreferred.md#type)

#### Defined in

[DictionaryDefinition.ts:51](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L51)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[useCompounds](DictionaryDefinitionPreferred.md#usecompounds)

#### Defined in

[DictionaryDefinition.ts:31](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryDefinition.ts#L31)
