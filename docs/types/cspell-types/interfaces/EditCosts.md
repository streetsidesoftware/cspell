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

**`default`** 1

#### Defined in

[DictionaryInformation.ts:190](https://github.com/streetsidesoftware/cspell/blob/a151ccc/packages/cspell-types/src/DictionaryInformation.ts#L190)

___

### baseCost

• `Optional` **baseCost**: `number`

This is the base cost for making an edit.

**`default`** 100

#### Defined in

[DictionaryInformation.ts:163](https://github.com/streetsidesoftware/cspell/blob/a151ccc/packages/cspell-types/src/DictionaryInformation.ts#L163)

___

### capsCosts

• `Optional` **capsCosts**: `number`

The cost to change capitalization.
This should be very cheap, it helps with fixing capitalization issues.

**`default`** 1

#### Defined in

[DictionaryInformation.ts:183](https://github.com/streetsidesoftware/cspell/blob/a151ccc/packages/cspell-types/src/DictionaryInformation.ts#L183)

___

### firstLetterPenalty

• `Optional` **firstLetterPenalty**: `number`

The extra cost incurred for changing the first letter of a word.
This value should be less than `100 - baseCost`.

**`default`** 4

#### Defined in

[DictionaryInformation.ts:176](https://github.com/streetsidesoftware/cspell/blob/a151ccc/packages/cspell-types/src/DictionaryInformation.ts#L176)

___

### nonAlphabetCosts

• `Optional` **nonAlphabetCosts**: `number`

This is the cost for characters not in the alphabet.

**`default`** 110

#### Defined in

[DictionaryInformation.ts:169](https://github.com/streetsidesoftware/cspell/blob/a151ccc/packages/cspell-types/src/DictionaryInformation.ts#L169)
