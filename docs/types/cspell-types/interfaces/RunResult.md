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

[CSpellReporter.ts:92](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellReporter.ts#L92)

___

### errors

• **errors**: `number`

Number of processing errors.

#### Defined in

[CSpellReporter.ts:90](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellReporter.ts#L90)

___

### files

• **files**: `number`

Number of files processed.

#### Defined in

[CSpellReporter.ts:84](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellReporter.ts#L84)

___

### filesWithIssues

• **filesWithIssues**: `Set`<`string`\>

Set of files where issues were found.

#### Defined in

[CSpellReporter.ts:86](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellReporter.ts#L86)

___

### issues

• **issues**: `number`

Number of issues found.

#### Defined in

[CSpellReporter.ts:88](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellReporter.ts#L88)
