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

[CSpellSettingsDef.ts:818](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L818)

___

### filename

• `Optional` **filename**: `undefined`

Filename if this came from a file.

#### Overrides

BaseSource.filename

#### Defined in

[CSpellSettingsDef.ts:814](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L814)

___

### name

• **name**: `string`

Name of source.

#### Overrides

BaseSource.name

#### Defined in

[CSpellSettingsDef.ts:812](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L812)

___

### sources

• **sources**: [[`CSpellSettings`](CSpellSettings.md)] \| [[`CSpellSettings`](CSpellSettings.md), [`CSpellSettings`](CSpellSettings.md)]

The two settings that were merged to.

#### Overrides

BaseSource.sources

#### Defined in

[CSpellSettingsDef.ts:816](https://github.com/streetsidesoftware/cspell/blob/ffde5ac/packages/cspell-types/src/CSpellSettingsDef.ts#L816)
