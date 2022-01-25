[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / Issue

# Interface: Issue

## Hierarchy

- `Omit`<[`TextDocumentOffset`](TextDocumentOffset.md), ``"doc"``\>

  ↳ **`Issue`**

## Table of contents

### Properties

- [col](Issue.md#col)
- [context](Issue.md#context)
- [isFlagged](Issue.md#isflagged)
- [line](Issue.md#line)
- [offset](Issue.md#offset)
- [row](Issue.md#row)
- [suggestions](Issue.md#suggestions)
- [text](Issue.md#text)
- [uri](Issue.md#uri)

## Properties

### col

• **col**: `number`

#### Inherited from

Omit.col

#### Defined in

[TextOffset.ts:10](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/TextOffset.ts#L10)

___

### context

• **context**: [`TextOffset`](TextOffset.md)

text surrounding the issue text

#### Defined in

[CSpellReporter.ts:5](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/CSpellReporter.ts#L5)

___

### isFlagged

• `Optional` **isFlagged**: `boolean`

#### Defined in

[CSpellReporter.ts:6](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/CSpellReporter.ts#L6)

___

### line

• **line**: [`TextOffset`](TextOffset.md)

#### Inherited from

Omit.line

#### Defined in

[TextOffset.ts:11](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/TextOffset.ts#L11)

___

### offset

• **offset**: `number`

#### Inherited from

Omit.offset

#### Defined in

[TextOffset.ts:3](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/TextOffset.ts#L3)

___

### row

• **row**: `number`

#### Inherited from

Omit.row

#### Defined in

[TextOffset.ts:9](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/TextOffset.ts#L9)

___

### suggestions

• `Optional` **suggestions**: `string`[]

#### Defined in

[CSpellReporter.ts:7](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/CSpellReporter.ts#L7)

___

### text

• **text**: `string`

#### Inherited from

Omit.text

#### Defined in

[TextOffset.ts:2](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/TextOffset.ts#L2)

___

### uri

• `Optional` **uri**: `string`

#### Inherited from

Omit.uri

#### Defined in

[TextOffset.ts:7](https://github.com/streetsidesoftware/cspell/blob/b9fa206/packages/cspell-types/src/TextOffset.ts#L7)
