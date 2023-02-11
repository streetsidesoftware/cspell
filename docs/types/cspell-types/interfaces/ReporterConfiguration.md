[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / ReporterConfiguration

# Interface: ReporterConfiguration

## Hierarchy

- `ReporterCommandLineOptions`

- `ReporterConfigurationBase`

  ↳ **`ReporterConfiguration`**

## Table of contents

### Properties

- [debug](ReporterConfiguration.md#debug)
- [maxDuplicateProblems](ReporterConfiguration.md#maxduplicateproblems)
- [maxNumberOfProblems](ReporterConfiguration.md#maxnumberofproblems)
- [minWordLength](ReporterConfiguration.md#minwordlength)
- [root](ReporterConfiguration.md#root)
- [unique](ReporterConfiguration.md#unique)
- [verbose](ReporterConfiguration.md#verbose)
- [wordsOnly](ReporterConfiguration.md#wordsonly)

## Properties

### debug

• `Optional` **debug**: `boolean`

Show extensive output.

#### Inherited from

ReporterCommandLineOptions.debug

#### Defined in

[CSpellReporter.ts:152](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L152)

___

### maxDuplicateProblems

• `Optional` **maxDuplicateProblems**: `number`

The maximum number of times the same word can be flagged as an error in a file.

**`Default`**

5

#### Inherited from

ReporterConfigurationBase.maxDuplicateProblems

#### Defined in

[CSpellReporter.ts:134](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L134)

___

### maxNumberOfProblems

• `Optional` **maxNumberOfProblems**: `number`

The maximum number of problems to report in a file.

**`Default`**

10000

#### Inherited from

ReporterConfigurationBase.maxNumberOfProblems

#### Defined in

[CSpellReporter.ts:127](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L127)

___

### minWordLength

• `Optional` **minWordLength**: `number`

The minimum length of a word before checking it against a dictionary.

**`Default`**

4

#### Inherited from

ReporterConfigurationBase.minWordLength

#### Defined in

[CSpellReporter.ts:141](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L141)

___

### root

• `Optional` **root**: `string`

root directory, defaults to `cwd`

#### Inherited from

ReporterCommandLineOptions.root

#### Defined in

[CSpellReporter.ts:164](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L164)

___

### unique

• `Optional` **unique**: `boolean`

unique errors per file only.

#### Inherited from

ReporterCommandLineOptions.unique

#### Defined in

[CSpellReporter.ts:160](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L160)

___

### verbose

• `Optional` **verbose**: `boolean`

Display verbose information

#### Inherited from

ReporterCommandLineOptions.verbose

#### Defined in

[CSpellReporter.ts:148](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L148)

___

### wordsOnly

• `Optional` **wordsOnly**: `boolean`

Only report the words, no line numbers or file names.

#### Inherited from

ReporterCommandLineOptions.wordsOnly

#### Defined in

[CSpellReporter.ts:156](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L156)
