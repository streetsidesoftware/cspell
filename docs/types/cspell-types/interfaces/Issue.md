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
- [length](Issue.md#length)
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

[TextOffset.ts:21](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L21)

___

### context

• **context**: [`TextOffset`](TextOffset.md)

text surrounding the issue text

#### Defined in

[CSpellReporter.ts:5](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/CSpellReporter.ts#L5)

___

### isFlagged

• `Optional` **isFlagged**: `boolean`

#### Defined in

[CSpellReporter.ts:6](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/CSpellReporter.ts#L6)

___

### length

• `Optional` **length**: `number`

Assumed to match `text.length` if the text has not been transformed.

#### Inherited from

Omit.length

#### Defined in

[TextOffset.ts:14](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L14)

___

### line

• **line**: [`TextOffset`](TextOffset.md)

#### Inherited from

Omit.line

#### Defined in

[TextOffset.ts:22](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L22)

___

### offset

• **offset**: `number`

The offset into the document.

#### Inherited from

Omit.offset

#### Defined in

[TextOffset.ts:10](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L10)

___

### row

• **row**: `number`

#### Inherited from

Omit.row

#### Defined in

[TextOffset.ts:20](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L20)

___

### suggestions

• `Optional` **suggestions**: `string`[]

#### Defined in

[CSpellReporter.ts:7](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/CSpellReporter.ts#L7)

___

### text

• **text**: `string`

The text found at the offset. If the text has been transformed, then the length might not match `length`.
Example: Original: `cafe\u0301`, text: `café`

#### Inherited from

Omit.text

#### Defined in

[TextOffset.ts:6](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L6)

___

### uri

• `Optional` **uri**: `string`

#### Inherited from

Omit.uri

#### Defined in

[TextOffset.ts:18](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L18)
