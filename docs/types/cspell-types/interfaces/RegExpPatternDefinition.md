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

[CSpellSettingsDef.ts:910](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/CSpellSettingsDef.ts#L910)

___

### name

• **name**: `string`

Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
It is possible to redefine one of the predefined patterns to override its value.

#### Defined in

[CSpellSettingsDef.ts:902](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/CSpellSettingsDef.ts#L902)

___

### pattern

• **pattern**: [`Pattern`](../modules.md#pattern) \| [`Pattern`](../modules.md#pattern)[]

RegExp pattern or array of RegExp patterns.

#### Defined in

[CSpellSettingsDef.ts:906](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/CSpellSettingsDef.ts#L906)
