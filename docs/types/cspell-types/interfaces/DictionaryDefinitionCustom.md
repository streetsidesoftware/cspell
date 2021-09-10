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
- [useCompounds](DictionaryDefinitionCustom.md#usecompounds)

## Properties

### addWords

• **addWords**: `boolean`

When `true`, let's the spell checker know that words can be added to this dictionary.

#### Defined in

[settings/CSpellSettingsDef.ts:449](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L449)

___

### description

• `Optional` **description**: `string`

Optional description

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[description](DictionaryDefinitionPreferred.md#description)

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

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[name](DictionaryDefinitionPreferred.md#name)

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

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[noSuggest](DictionaryDefinitionPreferred.md#nosuggest)

#### Defined in

[settings/CSpellSettingsDef.ts:366](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L366)

___

### path

• **path**: `string`

Path to custom dictionary text file.

#### Overrides

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[path](DictionaryDefinitionPreferred.md#path)

#### Defined in

[settings/CSpellSettingsDef.ts:438](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L438)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[repMap](DictionaryDefinitionPreferred.md#repmap)

#### Defined in

[settings/CSpellSettingsDef.ts:354](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L354)

___

### scope

• `Optional` **scope**: [`CustomDictionaryScope`](../modules.md#customdictionaryscope) \| [`CustomDictionaryScope`](../modules.md#customdictionaryscope)[]

Defines the scope for when words will be added to the dictionary.
Scope values: `user`, `workspace`, `folder`

#### Defined in

[settings/CSpellSettingsDef.ts:444](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L444)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds

#### Inherited from

[DictionaryDefinitionPreferred](DictionaryDefinitionPreferred.md).[useCompounds](DictionaryDefinitionPreferred.md#usecompounds)

#### Defined in

[settings/CSpellSettingsDef.ts:356](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L356)
