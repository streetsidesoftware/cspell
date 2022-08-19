[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / CharacterSetCosts

# Interface: CharacterSetCosts

## Table of contents

### Properties

- [characters](CharacterSetCosts.md#characters)
- [cost](CharacterSetCosts.md#cost)
- [penalty](CharacterSetCosts.md#penalty)

## Properties

### characters

• **characters**: `string`

This is a set of characters that can include `-` or `|`
- `-` - indicates a range of characters: `a-c` => `abc`
- `|` - is a group separator, indicating that the characters on either side
   are not related.

#### Defined in

[DictionaryInformation.ts:218](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/DictionaryInformation.ts#L218)

___

### cost

• **cost**: `number`

the cost to insert / delete / replace / swap the characters in a group

#### Defined in

[DictionaryInformation.ts:221](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/DictionaryInformation.ts#L221)

___

### penalty

• `Optional` **penalty**: `number`

The penalty cost to apply if the accent is used.
This is used to discourage

#### Defined in

[DictionaryInformation.ts:227](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/DictionaryInformation.ts#L227)
