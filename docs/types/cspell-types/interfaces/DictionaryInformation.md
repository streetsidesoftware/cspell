[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / DictionaryInformation

# Interface: DictionaryInformation

Use by dictionary authors to help improve the quality of suggestions
given from the dictionary.

Added with `v5.16.0`.

## Table of contents

### Properties

- [accents](DictionaryInformation.md#accents)
- [adjustments](DictionaryInformation.md#adjustments)
- [alphabet](DictionaryInformation.md#alphabet)
- [costs](DictionaryInformation.md#costs)
- [hunspellInformation](DictionaryInformation.md#hunspellinformation)
- [ignore](DictionaryInformation.md#ignore)
- [locale](DictionaryInformation.md#locale)
- [suggestionEditCosts](DictionaryInformation.md#suggestioneditcosts)

## Properties

### accents

• `Optional` **accents**: `string` \| [`CharacterSetCosts`](CharacterSetCosts.md)[]

The accent characters.

Default: `"\u0300-\u0341"`

#### Defined in

[DictionaryInformation.ts:27](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L27)

___

### adjustments

• `Optional` **adjustments**: `PatternAdjustment`[]

A collection of patterns to test against the suggested words.
If the word matches the pattern, then the penalty is applied.

#### Defined in

[DictionaryInformation.ts:49](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L49)

___

### alphabet

• `Optional` **alphabet**: `string` \| [`CharacterSetCosts`](CharacterSetCosts.md)[]

The alphabet to use.

**`Default`**

"a-zA-Z"

#### Defined in

[DictionaryInformation.ts:20](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L20)

___

### costs

• `Optional` **costs**: [`EditCosts`](EditCosts.md)

Define edit costs.

#### Defined in

[DictionaryInformation.ts:32](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L32)

___

### hunspellInformation

• `Optional` **hunspellInformation**: `HunspellInformation`

Used by dictionary authors

#### Defined in

[DictionaryInformation.ts:43](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L43)

___

### ignore

• `Optional` **ignore**: `string`

An optional set of characters that can possibly be removed from a word before
checking it.

This is useful in languages like Arabic where Harakat accents are optional.

Note: All matching characters are removed or none. Partial removal is not supported.

#### Defined in

[DictionaryInformation.ts:59](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L59)

___

### locale

• `Optional` **locale**: `string`

The locale of the dictionary.
Example: `nl,nl-be`

#### Defined in

[DictionaryInformation.ts:14](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L14)

___

### suggestionEditCosts

• `Optional` **suggestionEditCosts**: [`SuggestionCostsDefs`](../modules.md#suggestioncostsdefs)

Used in making suggestions. The lower the value, the more likely the suggestion
will be near the top of the suggestion list.

#### Defined in

[DictionaryInformation.ts:38](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/DictionaryInformation.ts#L38)
