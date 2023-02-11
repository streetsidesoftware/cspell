[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / MergeSource

# Interface: MergeSource

## Hierarchy

- `BaseSource`

  ↳ **`MergeSource`**

## Table of contents

### Properties

- [fileSource](MergeSource.md#filesource)
- [filename](MergeSource.md#filename)
- [name](MergeSource.md#name)
- [sources](MergeSource.md#sources)

## Properties

### fileSource

• `Optional` **fileSource**: `undefined`

The configuration read.

#### Overrides

BaseSource.fileSource

#### Defined in

[CSpellSettingsDef.ts:725](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L725)

___

### filename

• `Optional` **filename**: `undefined`

Filename if this came from a file.

#### Overrides

BaseSource.filename

#### Defined in

[CSpellSettingsDef.ts:721](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L721)

___

### name

• **name**: `string`

Name of source.

#### Overrides

BaseSource.name

#### Defined in

[CSpellSettingsDef.ts:719](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L719)

___

### sources

• **sources**: [[`CSpellSettings`](CSpellSettings.md)] \| [[`CSpellSettings`](CSpellSettings.md), [`CSpellSettings`](CSpellSettings.md)]

The two settings that were merged to.

#### Overrides

BaseSource.sources

#### Defined in

[CSpellSettingsDef.ts:723](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L723)
