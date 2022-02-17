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

Sets the default trust level.

**`default`** "trusted"

#### Defined in

[CSpellSettingsDef.ts:304](https://github.com/streetsidesoftware/cspell/blob/5497bd3/packages/cspell-types/src/CSpellSettingsDef.ts#L304)

___

### trustedFiles

• `Optional` **trustedFiles**: [`Glob`](../modules.md#glob)[]

Glob patterns of locations that contain ALWAYS trusted files.

#### Defined in

[CSpellSettingsDef.ts:293](https://github.com/streetsidesoftware/cspell/blob/5497bd3/packages/cspell-types/src/CSpellSettingsDef.ts#L293)

___

### untrustedFiles

• `Optional` **untrustedFiles**: [`Glob`](../modules.md#glob)[]

Glob patterns of locations that contain NEVER trusted files.

#### Defined in

[CSpellSettingsDef.ts:298](https://github.com/streetsidesoftware/cspell/blob/5497bd3/packages/cspell-types/src/CSpellSettingsDef.ts#L298)
