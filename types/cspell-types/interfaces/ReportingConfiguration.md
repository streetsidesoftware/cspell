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

[CSpellSettingsDef.ts:245](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L245)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`Default`**

100

#### Defined in

[CSpellSettingsDef.ts:238](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L238)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`Default`**

4

#### Defined in

[CSpellSettingsDef.ts:252](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L252)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`Default`**

10

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[numSuggestions](SuggestionsConfiguration.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:261](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L261)

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

[CSpellSettingsDef.ts:279](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L279)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`Default`**

500

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[suggestionsTimeout](SuggestionsConfiguration.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:268](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L268)
