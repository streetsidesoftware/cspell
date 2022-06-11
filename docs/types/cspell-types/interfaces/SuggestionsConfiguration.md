[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / SuggestionsConfiguration

# Interface: SuggestionsConfiguration

## Hierarchy

- **`SuggestionsConfiguration`**

  ↳ [`ReportingConfiguration`](ReportingConfiguration.md)

## Table of contents

### Properties

- [numSuggestions](SuggestionsConfiguration.md#numsuggestions)
- [suggestionNumChanges](SuggestionsConfiguration.md#suggestionnumchanges)
- [suggestionsTimeout](SuggestionsConfiguration.md#suggestionstimeout)

## Properties

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`default`** 10

#### Defined in

[CSpellSettingsDef.ts:251](https://github.com/streetsidesoftware/cspell/blob/6bd2f0c/packages/cspell-types/src/CSpellSettingsDef.ts#L251)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Defined in

[CSpellSettingsDef.ts:269](https://github.com/streetsidesoftware/cspell/blob/6bd2f0c/packages/cspell-types/src/CSpellSettingsDef.ts#L269)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Defined in

[CSpellSettingsDef.ts:258](https://github.com/streetsidesoftware/cspell/blob/6bd2f0c/packages/cspell-types/src/CSpellSettingsDef.ts#L258)
