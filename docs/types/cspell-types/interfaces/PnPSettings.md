[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / PnPSettings

# Interface: PnPSettings

Plug N Play settings to support package systems like Yarn 2.

## Hierarchy

- **`PnPSettings`**

  ↳ [`Settings`](Settings.md)

## Table of contents

### Properties

- [pnpFiles](PnPSettings.md#pnpfiles)
- [usePnP](PnPSettings.md#usepnp)

## Properties

### pnpFiles

• `Optional` **pnpFiles**: `string`[]

The PnP files to search for. Note: `.mjs` files are not currently supported.

**`Default`**

[".pnp.js", ".pnp.cjs"]

#### Defined in

[CSpellSettingsDef.ts:289](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L289)

___

### usePnP

• `Optional` **usePnP**: `boolean`

Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
packages stored in the repository.

When true, the spell checker will search up the directory structure for the existence
of a PnP file and load it.

**`Default`**

false

#### Defined in

[CSpellSettingsDef.ts:282](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L282)
