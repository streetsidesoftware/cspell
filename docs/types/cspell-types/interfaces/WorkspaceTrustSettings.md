[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / WorkspaceTrustSettings

# Interface: WorkspaceTrustSettings

To prevent the unwanted execution of untrusted code, WorkspaceTrustSettings
are use to set the trust levels.

Trust setting have an impact on both `cspell.config.js` files and on `.pnp.js` files.
In an untrusted location, these files will NOT be used.

This will also prevent any associated plugins from being loaded.

## Table of contents

### Properties

- [trustLevel](WorkspaceTrustSettings.md#trustlevel)
- [trustedFiles](WorkspaceTrustSettings.md#trustedfiles)
- [untrustedFiles](WorkspaceTrustSettings.md#untrustedfiles)

## Properties

### trustLevel

• `Optional` **trustLevel**: [`TrustLevel`](../modules.md#trustlevel)

Sets the default trust level

**`default`** "trusted"

#### Defined in

[settings/CSpellSettingsDef.ts:199](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L199)

___

### trustedFiles

• `Optional` **trustedFiles**: [`Glob`](../modules.md#glob)[]

Glob patterns of locations that contain ALWAYS trusted files

#### Defined in

[settings/CSpellSettingsDef.ts:188](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L188)

___

### untrustedFiles

• `Optional` **untrustedFiles**: [`Glob`](../modules.md#glob)[]

Glob patterns of locations that contain NEVER trusted files

#### Defined in

[settings/CSpellSettingsDef.ts:193](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L193)
