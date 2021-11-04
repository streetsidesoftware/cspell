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

Number of suggestions to make

**`default`** 10

#### Defined in

[CSpellSettingsDef.ts:169](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L169)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Defined in

[CSpellSettingsDef.ts:185](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L185)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Defined in

[CSpellSettingsDef.ts:175](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L175)
