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

• **cachedFiles**: `number`

Number files that used results from the cache.

#### Defined in

[CSpellReporter.ts:61](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellReporter.ts#L61)

___

### errors

• **errors**: `number`

Number of processing errors.

#### Defined in

[CSpellReporter.ts:59](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellReporter.ts#L59)

___

### files

• **files**: `number`

Number of files processed.

#### Defined in

[CSpellReporter.ts:53](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellReporter.ts#L53)

___

### filesWithIssues

• **filesWithIssues**: `Set`<`string`\>

Set of files where issues were found.

#### Defined in

[CSpellReporter.ts:55](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellReporter.ts#L55)

___

### issues

• **issues**: `number`

Number of issues found.

#### Defined in

[CSpellReporter.ts:57](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellReporter.ts#L57)
