[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / TextDocumentOffset

# Interface: TextDocumentOffset

## Hierarchy

- [`TextOffset`](TextOffset.md)

  ↳ **`TextDocumentOffset`**

## Table of contents

### Properties

- [col](TextDocumentOffset.md#col)
- [doc](TextDocumentOffset.md#doc)
- [length](TextDocumentOffset.md#length)
- [line](TextDocumentOffset.md#line)
- [offset](TextDocumentOffset.md#offset)
- [row](TextDocumentOffset.md#row)
- [text](TextDocumentOffset.md#text)
- [uri](TextDocumentOffset.md#uri)

## Properties

### col

• **col**: `number`

#### Defined in

[TextOffset.ts:21](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L21)

___

### doc

• **doc**: `string`

#### Defined in

[TextOffset.ts:19](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L19)

___

### length

• `Optional` **length**: `number`

Assumed to match `text.length` if the text has not been transformed.

#### Inherited from

[TextOffset](TextOffset.md).[length](TextOffset.md#length)

#### Defined in

[TextOffset.ts:14](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L14)

___

### line

• **line**: [`TextOffset`](TextOffset.md)

#### Defined in

[TextOffset.ts:22](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L22)

___

### offset

• **offset**: `number`

The offset into the document.

#### Inherited from

[TextOffset](TextOffset.md).[offset](TextOffset.md#offset)

#### Defined in

[TextOffset.ts:10](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L10)

___

### row

• **row**: `number`

#### Defined in

[TextOffset.ts:20](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L20)

___

### text

• **text**: `string`

The text found at the offset. If the text has been transformed, then the length might not match `length`.
Example: Original: `cafe\u0301`, text: `café`

#### Inherited from

[TextOffset](TextOffset.md).[text](TextOffset.md#text)

#### Defined in

[TextOffset.ts:6](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L6)

___

### uri

• `Optional` **uri**: `string`

#### Defined in

[TextOffset.ts:18](https://github.com/streetsidesoftware/cspell/blob/59a0fe3/packages/cspell-types/src/TextOffset.ts#L18)
