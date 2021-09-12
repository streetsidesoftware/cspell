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

[settings/CSpellSettingsDef.ts:687](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L687)

___

### filename

• `Optional` **filename**: `undefined`

filename if this came from a file.

#### Overrides

BaseSource.filename

#### Defined in

[settings/CSpellSettingsDef.ts:683](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L683)

___

### name

• **name**: `string`

name of source

#### Overrides

BaseSource.name

#### Defined in

[settings/CSpellSettingsDef.ts:681](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L681)

___

### sources

• **sources**: [[`CSpellSettings`](CSpellSettings.md)] \| [[`CSpellSettings`](CSpellSettings.md), [`CSpellSettings`](CSpellSettings.md)]

The two settings that were merged to

#### Overrides

BaseSource.sources

#### Defined in

[settings/CSpellSettingsDef.ts:685](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L685)
