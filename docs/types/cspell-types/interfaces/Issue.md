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
- [issueType](Issue.md#issuetype)
- [length](Issue.md#length)
- [line](Issue.md#line)
- [message](Issue.md#message)
- [offset](Issue.md#offset)
- [row](Issue.md#row)
- [suggestions](Issue.md#suggestions)
- [suggestionsEx](Issue.md#suggestionsex)
- [text](Issue.md#text)
- [uri](Issue.md#uri)

## Properties

### col

• **col**: `number`

#### Inherited from

Omit.col

#### Defined in

[TextOffset.ts:21](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/TextOffset.ts#L21)

___

### context

• **context**: [`TextOffset`](TextOffset.md)

text surrounding the issue text

#### Defined in

[CSpellReporter.ts:16](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L16)

___

### isFlagged

• `Optional` **isFlagged**: `boolean`

true if the issue has been flagged as a forbidden word.

#### Defined in

[CSpellReporter.ts:20](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L20)

___

### issueType

• `Optional` **issueType**: [`IssueType`](../enums/IssueType.md)

Issues are spelling issues unless otherwise specified.

#### Defined in

[CSpellReporter.ts:32](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L32)

___

### length

• `Optional` **length**: `number`

Assumed to match `text.length` if the text has not been transformed.

#### Inherited from

Omit.length

#### Defined in

[TextOffset.ts:14](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/TextOffset.ts#L14)

___

### line

• **line**: [`TextOffset`](TextOffset.md)

#### Inherited from

Omit.line

#### Defined in

[TextOffset.ts:22](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/TextOffset.ts#L22)

___

### message

• `Optional` **message**: `string`

Optional message to show.

#### Defined in

[CSpellReporter.ts:36](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L36)

___

### offset

• **offset**: `number`

The offset into the document.

#### Inherited from

Omit.offset

#### Defined in

[TextOffset.ts:10](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/TextOffset.ts#L10)

___

### row

• **row**: `number`

#### Inherited from

Omit.row

#### Defined in

[TextOffset.ts:20](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/TextOffset.ts#L20)

___

### suggestions

• `Optional` **suggestions**: `string`[]

An optional array of replacement strings.

#### Defined in

[CSpellReporter.ts:24](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L24)

___

### suggestionsEx

• `Optional` **suggestionsEx**: `Suggestion`[]

An optional array of suggestions.

#### Defined in

[CSpellReporter.ts:28](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellReporter.ts#L28)

___

### text

• **text**: `string`

The text found at the offset. If the text has been transformed, then the length might not match `length`.
Example: Original: `cafe\u0301`, text: `café`

#### Inherited from

Omit.text

#### Defined in

[TextOffset.ts:6](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/TextOffset.ts#L6)

___

### uri

• `Optional` **uri**: `string`

#### Inherited from

Omit.uri

#### Defined in

[TextOffset.ts:18](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/TextOffset.ts#L18)
