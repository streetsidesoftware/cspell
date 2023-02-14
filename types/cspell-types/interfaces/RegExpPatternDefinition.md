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

[CSpellSettingsDef.ts:698](https://github.com/streetsidesoftware/cspell/blob/bc3346a/packages/cspell-types/src/CSpellSettingsDef.ts#L698)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:690](https://github.com/streetsidesoftware/cspell/blob/bc3346a/packages/cspell-types/src/CSpellSettingsDef.ts#L690)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns.

#### Defined in

[CSpellSettingsDef.ts:694](https://github.com/streetsidesoftware/cspell/blob/bc3346a/packages/cspell-types/src/CSpellSettingsDef.ts#L694)
