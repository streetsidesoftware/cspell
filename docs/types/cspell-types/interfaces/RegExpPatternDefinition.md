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

[CSpellSettingsDef.ts:753](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellSettingsDef.ts#L753)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:745](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellSettingsDef.ts#L745)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns.

#### Defined in

[CSpellSettingsDef.ts:749](https://github.com/streetsidesoftware/cspell/blob/04d61378/packages/cspell-types/src/CSpellSettingsDef.ts#L749)
