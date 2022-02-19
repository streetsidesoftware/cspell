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

**`default`** 5

#### Defined in

[CSpellSettingsDef.ts:177](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L177)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`default`** 100

#### Defined in

[CSpellSettingsDef.ts:171](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L171)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`default`** 4

#### Defined in

[CSpellSettingsDef.ts:183](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L183)

___

### numSuggestions

• `Optional` **numSuggestions**: `number`

Number of suggestions to make.

**`default`** 10

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[numSuggestions](SuggestionsConfiguration.md#numsuggestions)

#### Defined in

[CSpellSettingsDef.ts:191](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L191)

___

### suggestionNumChanges

• `Optional` **suggestionNumChanges**: `number`

The maximum number of changes allowed on a word to be considered a suggestions.

For example, appending an `s` onto `example` -> `examples` is considered 1 change.

Range: between 1 and 5.

**`default`** 3

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[suggestionNumChanges](SuggestionsConfiguration.md#suggestionnumchanges)

#### Defined in

[CSpellSettingsDef.ts:207](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L207)

___

### suggestionsTimeout

• `Optional` **suggestionsTimeout**: `number`

The maximum amount of time in milliseconds to generate suggestions for a word.

**`default`** 500

#### Inherited from

[SuggestionsConfiguration](SuggestionsConfiguration.md).[suggestionsTimeout](SuggestionsConfiguration.md#suggestionstimeout)

#### Defined in

[CSpellSettingsDef.ts:197](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L197)
