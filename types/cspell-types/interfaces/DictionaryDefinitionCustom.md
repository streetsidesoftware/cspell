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

[CSpellSettingsDef.ts:690](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L690)

___

### description

• `Optional` **description**: `string`

Optional description.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[description](DictionaryDefinitionPreferred.md#description)

#### Defined in

[CSpellSettingsDef.ts:568](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L568)

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

[CSpellSettingsDef.ts:566](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L566)

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

[CSpellSettingsDef.ts:582](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L582)

___

### path

• **path**: `string`

Path to custom dictionary text file.

#### Overrides

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[path](DictionaryDefinitionPreferred.md#path)

#### Defined in

[CSpellSettingsDef.ts:679](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L679)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[repMap](DictionaryDefinitionPreferred.md#repmap)

#### Defined in

[CSpellSettingsDef.ts:570](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L570)

___

### scope

• `Optional` **scope**: [`CustomDictionaryScope`](../modules.md#customdictionaryscope) \| [`CustomDictionaryScope`](../modules.md#customdictionaryscope)[]

Defines the scope for when words will be added to the dictionary.
Scope values: `user`, `workspace`, `folder`.

#### Defined in

[CSpellSettingsDef.ts:685](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L685)

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

[CSpellSettingsDef.ts:592](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L592)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds.

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[useCompounds](DictionaryDefinitionPreferred.md#usecompounds)

#### Defined in

[CSpellSettingsDef.ts:572](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L572)
