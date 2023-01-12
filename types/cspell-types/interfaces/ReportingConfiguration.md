[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / ReportingConfiguration

# Interface: ReportingConfiguration

## Hierarchy

- [`SuggestionsConfiguration`](SuggestionsConfiguration.md)

  ↳ **`ReportingConfiguration`**

  ↳↳ [`Settings`](Settings.md)

## Table of contents

### Properties

- [maxDuplicateProblems](ReportingConfiguration.md#maxduplicateproblems)
- [maxNumberOfProblems](ReportingConfiguration.md#maxnumberofproblems)
- [minWordLength](ReportingConfiguration.md#minwordlength)
- [numSuggestions](ReportingConfiguration.md#numsuggestions)
- [suggestionNumChanges](ReportingConfiguration.md#suggestionnumchanges)
- [suggestionsTimeout](ReportingConfiguration.md#suggestionstimeout)

## Properties

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`Default`**

5

#### Defined in

[CSpellSettingsDef.ts:242](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L242)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`Default`**

100

#### Defined in

[CSpellSettingsDef.ts:235](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L235)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`Default`**

4

#### Defined in

[CSpellSettingsDef.ts:249](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L249)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`Default`**

10

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[numSuggestions](SuggestionsConfiguration.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:258](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L258)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`Default`**

3

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[suggestionNumChanges](SuggestionsConfiguration.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:276](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L276)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`Default`**

500

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[suggestionsTimeout](SuggestionsConfiguration.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:265](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellSettingsDef.ts#L265)
