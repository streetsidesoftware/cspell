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

[CSpellSettingsDef.ts:691](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L691)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:683](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L683)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns

#### Defined in

[CSpellSettingsDef.ts:687](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L687)
