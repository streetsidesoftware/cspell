[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / CacheSettings

# Interface: CacheSettings

## Table of contents

### Properties

- [cacheFormat](CacheSettings.md#cacheformat)
- [cacheLocation](CacheSettings.md#cachelocation)
- [cacheStrategy](CacheSettings.md#cachestrategy)
- [useCache](CacheSettings.md#usecache)

## Properties

### cacheFormat

• `Optional` **cacheFormat**: [`CacheFormat`](../modules.md#cacheformat)

Format of the cache file.
- `legacy` - use absolute paths in the cache file
- `universal` - use a sharable format.

**`Default`**

'legacy'

#### Defined in

[CSpellSettingsDef.ts:341](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellSettingsDef.ts#L341)

___

### cacheLocation

• `Optional` **cacheLocation**: `string`

Path to the cache location. Can be a file or a directory.
If none specified `.cspellcache` will be used.
Relative paths are relative to the config file in which it
is defined.

A prefix of `${cwd}` is replaced with the current working directory.

#### Defined in

[CSpellSettingsDef.ts:327](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellSettingsDef.ts#L327)

___

### cacheStrategy

• `Optional` **cacheStrategy**: [`CacheStrategy`](../modules.md#cachestrategy)

Strategy to use for detecting changed files, default: metadata

**`Default`**

'metadata'

#### Defined in

[CSpellSettingsDef.ts:333](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellSettingsDef.ts#L333)

___

### useCache

• `Optional` **useCache**: `boolean`

Store the results of processed files in order to only operate on the changed ones.

**`Default`**

false

#### Defined in

[CSpellSettingsDef.ts:316](https://github.com/streetsidesoftware/cspell/blob/bb436cd/packages/cspell-types/src/CSpellSettingsDef.ts#L316)
