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

[CSpellSettingsDef.ts:782](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/CSpellSettingsDef.ts#L782)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:774](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/CSpellSettingsDef.ts#L774)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns.

#### Defined in

[CSpellSettingsDef.ts:778](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/CSpellSettingsDef.ts#L778)
