[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / Parser

# Interface: Parser

## Table of contents

### Properties

- [name](Parser.md#name)

### Methods

- [parse](Parser.md#parse)

## Properties

### name

• `Readonly` **name**: `string`

Name of parser

#### Defined in

[Parser.ts:7](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/Parser.ts#L7)

## Methods

### parse

▸ **parse**(`content`, `filename`): [`ParseResult`](ParseResult.md)

Parse Method

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `content` | `string` | full content of the file |
| `filename` | `string` | filename |

#### Returns

[`ParseResult`](ParseResult.md)

#### Defined in

[Parser.ts:13](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/Parser.ts#L13)
