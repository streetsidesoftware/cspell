[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / ParsedText

# Interface: ParsedText

## Table of contents

### Properties

- [delegate](ParsedText.md#delegate)
- [map](ParsedText.md#map)
- [range](ParsedText.md#range)
- [rawText](ParsedText.md#rawtext)
- [scope](ParsedText.md#scope)
- [text](ParsedText.md#text)

## Properties

### delegate

• `Optional` `Readonly` **delegate**: `DelegateInfo`

Used to delegate parsing the contents of `text` to another parser.

#### Defined in

[Parser/index.ts:51](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/Parser/index.ts#L51)

___

### map

• `Optional` `Readonly` **map**: `SourceMap`

The source map is used to support text transformations.

See: SourceMap

#### Defined in

[Parser/index.ts:46](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/Parser/index.ts#L46)

___

### range

• `Readonly` **range**: `Range`

start and end offsets of the text

#### Defined in

[Parser/index.ts:34](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/Parser/index.ts#L34)

___

### rawText

• `Optional` `Readonly` **rawText**: `string`

The raw text before it has been transformed

#### Defined in

[Parser/index.ts:30](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/Parser/index.ts#L30)

___

### scope

• `Optional` `Readonly` **scope**: `Scope`

The Scope annotation for a segment of text.
Used by the spell checker to apply spell checking options
based upon the value of the scope.

#### Defined in

[Parser/index.ts:40](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/Parser/index.ts#L40)

___

### text

• `Readonly` **text**: `string`

The text extracted and possibly transformed

#### Defined in

[Parser/index.ts:26](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/Parser/index.ts#L26)
