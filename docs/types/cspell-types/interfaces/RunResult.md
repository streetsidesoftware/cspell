[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / RunResult

# Interface: RunResult

## Table of contents

### Properties

- [cachedFiles](RunResult.md#cachedfiles)
- [errors](RunResult.md#errors)
- [files](RunResult.md#files)
- [filesWithIssues](RunResult.md#fileswithissues)
- [issues](RunResult.md#issues)

## Properties

### cachedFiles

• `Optional` **cachedFiles**: `number`

Number files that used results from the cache.

#### Defined in

[CSpellReporter.ts:73](https://github.com/streetsidesoftware/cspell/blob/7a5f2ef/packages/cspell-types/src/CSpellReporter.ts#L73)

___

### errors

• **errors**: `number`

Number of processing errors.

#### Defined in

[CSpellReporter.ts:71](https://github.com/streetsidesoftware/cspell/blob/7a5f2ef/packages/cspell-types/src/CSpellReporter.ts#L71)

___

### files

• **files**: `number`

Number of files processed.

#### Defined in

[CSpellReporter.ts:65](https://github.com/streetsidesoftware/cspell/blob/7a5f2ef/packages/cspell-types/src/CSpellReporter.ts#L65)

___

### filesWithIssues

• **filesWithIssues**: `Set`<`string`\>

Set of files where issues were found.

#### Defined in

[CSpellReporter.ts:67](https://github.com/streetsidesoftware/cspell/blob/7a5f2ef/packages/cspell-types/src/CSpellReporter.ts#L67)

___

### issues

• **issues**: `number`

Number of issues found.

#### Defined in

[CSpellReporter.ts:69](https://github.com/streetsidesoftware/cspell/blob/7a5f2ef/packages/cspell-types/src/CSpellReporter.ts#L69)
