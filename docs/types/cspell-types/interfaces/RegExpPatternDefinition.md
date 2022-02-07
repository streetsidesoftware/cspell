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

[CSpellSettingsDef.ts:787](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L787)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:779](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L779)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns.

#### Defined in

[CSpellSettingsDef.ts:783](https://github.com/streetsidesoftware/cspell/blob/91b035f/packages/cspell-types/src/CSpellSettingsDef.ts#L783)
