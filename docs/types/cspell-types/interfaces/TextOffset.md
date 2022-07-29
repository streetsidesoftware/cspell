[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / TextOffset

# Interface: TextOffset

## Hierarchy

- **`TextOffset`**

  ↳ [`TextDocumentOffset`](TextDocumentOffset.md)

## Table of contents

### Properties

- [length](TextOffset.md#length)
- [offset](TextOffset.md#offset)
- [text](TextOffset.md#text)

## Properties

### length

• `Optional` **length**: `number`

Assumed to match `text.length` if the text has not been transformed.

#### Defined in

[TextOffset.ts:14](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L14)

___

### offset

• **offset**: `number`

The offset into the document.

#### Defined in

[TextOffset.ts:10](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L10)

___

### text

• **text**: `string`

The text found at the offset. If the text has been transformed, then the length might not match `length`.
Example: Original: `cafe\u0301`, text: `café`

#### Defined in

[TextOffset.ts:6](https://github.com/streetsidesoftware/cspell/blob/d3fbe6c/packages/cspell-types/src/TextOffset.ts#L6)
