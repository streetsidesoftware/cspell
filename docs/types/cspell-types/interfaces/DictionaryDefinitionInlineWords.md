[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryDefinitionInlineWords

# Interface: DictionaryDefinitionInlineWords

## Hierarchy

- `DictionaryDefinitionInlineBase`

- `Required`<`Pick`<`InlineDictionary`, ``"words"``\>\>

  ↳ **`DictionaryDefinitionInlineWords`**

## Table of contents

### Properties

- [description](DictionaryDefinitionInlineWords.md#description)
- [flagWords](DictionaryDefinitionInlineWords.md#flagwords)
- [ignoreWords](DictionaryDefinitionInlineWords.md#ignorewords)
- [name](DictionaryDefinitionInlineWords.md#name)
- [noSuggest](DictionaryDefinitionInlineWords.md#nosuggest)
- [repMap](DictionaryDefinitionInlineWords.md#repmap)
- [suggestWords](DictionaryDefinitionInlineWords.md#suggestwords)
- [type](DictionaryDefinitionInlineWords.md#type)
- [useCompounds](DictionaryDefinitionInlineWords.md#usecompounds)
- [words](DictionaryDefinitionInlineWords.md#words)

## Properties

### description

• `Optional` **description**: `string`

Optional description.

#### Inherited from

DictionaryDefinitionInlineBase.description

#### Defined in

[DictionaryDefinition.ts:27](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/DictionaryDefinition.ts#L27)

___

### flagWords

• `Optional` **flagWords**: `string`[]

List of words to always be considered incorrect. Words found in `flagWords` override `words`.

Format of `flagWords`
- single word entry - `word`
- with suggestions - `word:suggestion` or `word->suggestion, suggestions`

Example:
```ts
"flagWords": [
  "color: colour",
  "incase: in case, encase",
  "canot->cannot",
  "cancelled->canceled"
]
```

#### Inherited from

DictionaryDefinitionInlineBase.flagWords

#### Defined in

[InlineDictionary.ts:25](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/InlineDictionary.ts#L25)

___

### ignoreWords

• `Optional` **ignoreWords**: `string`[]

List of words to be ignored. An ignored word will not show up as an error, even if it is
also in the `flagWords`.

#### Inherited from

DictionaryDefinitionInlineBase.ignoreWords

#### Defined in

[InlineDictionary.ts:31](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/InlineDictionary.ts#L31)

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

DictionaryDefinitionInlineBase.name

#### Defined in

[DictionaryDefinition.ts:25](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/DictionaryDefinition.ts#L25)

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

DictionaryDefinitionInlineBase.noSuggest

#### Defined in

[DictionaryDefinition.ts:41](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/DictionaryDefinition.ts#L41)

___

### repMap

• `Optional` **repMap**: [`ReplaceMap`](../modules.md#replacemap)

Replacement pairs.

#### Inherited from

DictionaryDefinitionInlineBase.repMap

#### Defined in

[DictionaryDefinition.ts:29](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/DictionaryDefinition.ts#L29)

___

### suggestWords

• `Optional` **suggestWords**: `string`[]

A list of suggested replacements for words.
Suggested words provide a way to make preferred suggestions on word replacements.
To hint at a preferred change, but not to require it.

Format of `suggestWords`
- Single suggestion (possible auto fix)
    - `word: suggestion`
    - `word->suggestion`
- Multiple suggestions (not auto fixable)
   - `word: first, second, third`
   - `word->first, second, third`

#### Inherited from

DictionaryDefinitionInlineBase.suggestWords

#### Defined in

[InlineDictionary.ts:46](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/InlineDictionary.ts#L46)

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

DictionaryDefinitionInlineBase.type

#### Defined in

[DictionaryDefinition.ts:51](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/DictionaryDefinition.ts#L51)

___

### useCompounds

• `Optional` **useCompounds**: `boolean`

Use Compounds.

#### Inherited from

DictionaryDefinitionInlineBase.useCompounds

#### Defined in

[DictionaryDefinition.ts:31](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/DictionaryDefinition.ts#L31)

___

### words

• **words**: `string`[]

#### Overrides

DictionaryDefinitionInlineBase.words

#### Defined in

[DictionaryDefinition.ts:97](https://github.com/streetsidesoftware/cspell/blob/c69f8c4/packages/cspell-types/src/DictionaryDefinition.ts#L97)
