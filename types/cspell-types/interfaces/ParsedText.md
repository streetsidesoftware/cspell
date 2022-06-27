[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / ParsedText

# Interface: ParsedText

## Table of contents

### Properties

- [delegate](ParsedText.md#delegate)
- [map](ParsedText.md#map)
- [range](ParsedText.md#range)
- [scope](ParsedText.md#scope)
- [text](ParsedText.md#text)

## Properties

### delegate

• `Optional` `Readonly` **delegate**: `DelegateInfo`

Used to delegate parsing the contents of `text` to another parser.

#### Defined in

[Parser.ts:47](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/Parser.ts#L47)

___

### map

• `Optional` `Readonly` **map**: `SourceMap`

The source map is used to support text transformations.

See: {@link SourceMap}

#### Defined in

[Parser.ts:42](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/Parser.ts#L42)

___

### range

• `Readonly` **range**: `Range`

start and end offsets of the text

#### Defined in

[Parser.ts:30](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/Parser.ts#L30)

___

### scope

• `Optional` `Readonly` **scope**: `Scope`

The Scope annotation for a segment of text.
Used by the spell checker to apply spell checking options
based upon the value of the scope.

#### Defined in

[Parser.ts:36](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/Parser.ts#L36)

___

### text

• `Readonly` **text**: `string`

The text extracted and possibly transformed

#### Defined in

[Parser.ts:26](https://github.com/streetsidesoftware/cspell/blob/dadce5a/packages/cspell-types/src/Parser.ts#L26)
