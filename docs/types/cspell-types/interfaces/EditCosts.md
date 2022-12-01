[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / EditCosts

# Interface: EditCosts

## Table of contents

### Properties

- [accentCosts](EditCosts.md#accentcosts)
- [baseCost](EditCosts.md#basecost)
- [capsCosts](EditCosts.md#capscosts)
- [firstLetterPenalty](EditCosts.md#firstletterpenalty)
- [nonAlphabetCosts](EditCosts.md#nonalphabetcosts)

## Properties

### accentCosts

• `Optional` **accentCosts**: `number`

The cost to add / remove an accent
This should be very cheap, it helps with fixing accent issues.

**`Default`**

1

#### Defined in

[DictionaryInformation.ts:200](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/DictionaryInformation.ts#L200)

___

### baseCost

• `Optional` **baseCost**: `number`

This is the base cost for making an edit.

**`Default`**

100

#### Defined in

[DictionaryInformation.ts:173](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/DictionaryInformation.ts#L173)

___

### capsCosts

• `Optional` **capsCosts**: `number`

The cost to change capitalization.
This should be very cheap, it helps with fixing capitalization issues.

**`Default`**

1

#### Defined in

[DictionaryInformation.ts:193](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/DictionaryInformation.ts#L193)

___

### firstLetterPenalty

• `Optional` **firstLetterPenalty**: `number`

The extra cost incurred for changing the first letter of a word.
This value should be less than `100 - baseCost`.

**`Default`**

4

#### Defined in

[DictionaryInformation.ts:186](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/DictionaryInformation.ts#L186)

___

### nonAlphabetCosts

• `Optional` **nonAlphabetCosts**: `number`

This is the cost for characters not in the alphabet.

**`Default`**

110

#### Defined in

[DictionaryInformation.ts:179](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/DictionaryInformation.ts#L179)
