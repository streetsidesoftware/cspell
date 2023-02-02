[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / RegExpPatternDefinition

# Interface: RegExpPatternDefinition

## Table of contents

### Properties

- [description](RegExpPatternDefinition.md#description)
- [name](RegExpPatternDefinition.md#name)
- [pattern](RegExpPatternDefinition.md#pattern)

## Properties

### description

• `Optional` **description**: `string`

Description of the pattern.

#### Defined in

[CSpellSettingsDef.ts:709](https://github.com/streetsidesoftware/cspell/blob/5bd8203/packages/cspell-types/src/CSpellSettingsDef.ts#L709)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:701](https://github.com/streetsidesoftware/cspell/blob/5bd8203/packages/cspell-types/src/CSpellSettingsDef.ts#L701)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns.

#### Defined in

[CSpellSettingsDef.ts:705](https://github.com/streetsidesoftware/cspell/blob/5bd8203/packages/cspell-types/src/CSpellSettingsDef.ts#L705)
