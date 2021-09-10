[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / LanguageSettingFilterFields

# Interface: LanguageSettingFilterFields

## Hierarchy

- [`LanguageSettingFilterFieldsPreferred`](LanguageSettingFilterFieldsPreferred.md)

- [`LanguageSettingFilterFieldsDeprecated`](LanguageSettingFilterFieldsDeprecated.md)

  ↳ **`LanguageSettingFilterFields`**

  ↳↳ [`LanguageSetting`](LanguageSetting.md)

## Table of contents

### Properties

- [languageId](LanguageSettingFilterFields.md#languageid)
- [local](LanguageSettingFilterFields.md#local)
- [locale](LanguageSettingFilterFields.md#locale)

## Properties

### languageId

• **languageId**: `string` \| `string`[]

The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages

#### Inherited from

[LanguageSettingFilterFieldsDeprecated](LanguageSettingFilterFieldsDeprecated.md).[languageId](LanguageSettingFilterFieldsDeprecated.md#languageid)

#### Defined in

[settings/CSpellSettingsDef.ts:460](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L460)

___

### local

• `Optional` **local**: `string` \| `string`[]

Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.

**`deprecated`**

**`deprecationmessage`** Use `locale` instead

#### Inherited from

[LanguageSettingFilterFieldsDeprecated](LanguageSettingFilterFieldsDeprecated.md).[local](LanguageSettingFilterFieldsDeprecated.md#local)

#### Defined in

[settings/CSpellSettingsDef.ts:473](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L473)

___

### locale

• `Optional` **locale**: `string` \| `string`[]

The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.

#### Inherited from

[LanguageSettingFilterFieldsPreferred](LanguageSettingFilterFieldsPreferred.md).[locale](LanguageSettingFilterFieldsPreferred.md#locale)

#### Defined in

[settings/CSpellSettingsDef.ts:462](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L462)
