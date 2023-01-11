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

[CSpellReporter.ts:107](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellReporter.ts#L107)

___

### errors

• **errors**: `number`

Number of processing errors.

#### Defined in

[CSpellReporter.ts:105](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellReporter.ts#L105)

___

### files

• **files**: `number`

Number of files processed.

#### Defined in

[CSpellReporter.ts:99](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellReporter.ts#L99)

___

### filesWithIssues

• **filesWithIssues**: `Set`<`string`\>

Set of files where issues were found.

#### Defined in

[CSpellReporter.ts:101](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellReporter.ts#L101)

___

### issues

• **issues**: `number`

Number of issues found.

#### Defined in

[CSpellReporter.ts:103](https://github.com/streetsidesoftware/cspell/blob/d20c1f2/packages/cspell-types/src/CSpellReporter.ts#L103)
