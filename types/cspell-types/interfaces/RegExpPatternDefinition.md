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

[CSpellSettingsDef.ts:720](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/CSpellSettingsDef.ts#L720)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:712](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/CSpellSettingsDef.ts#L712)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns.

#### Defined in

[CSpellSettingsDef.ts:716](https://github.com/streetsidesoftware/cspell/blob/8b25077/packages/cspell-types/src/CSpellSettingsDef.ts#L716)
