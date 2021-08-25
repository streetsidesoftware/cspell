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

[settings/CSpellSettingsDef.ts:669](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L669)

___

### filename

• `Optional` **filename**: `undefined`

filename if this came from a file.

#### Overrides

BaseSource.filename

#### Defined in

[settings/CSpellSettingsDef.ts:665](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L665)

___

### name

• **name**: `string`

name of source

#### Overrides

BaseSource.name

#### Defined in

[settings/CSpellSettingsDef.ts:663](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L663)

___

### sources

• **sources**: [[`CSpellSettings`](CSpellSettings.md)] \| [[`CSpellSettings`](CSpellSettings.md), [`CSpellSettings`](CSpellSettings.md)]

The two settings that were merged to

#### Overrides

BaseSource.sources

#### Defined in

[settings/CSpellSettingsDef.ts:667](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L667)
