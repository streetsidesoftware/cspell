[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / LanguageSettingFilterFieldsDeprecated

# Interface: LanguageSettingFilterFieldsDeprecated

## Hierarchy

- **`LanguageSettingFilterFieldsDeprecated`**

  ↳ [`LanguageSettingFilterFields`](LanguageSettingFilterFields.md)

## Table of contents

### Properties

- [languageId](LanguageSettingFilterFieldsDeprecated.md#languageid)
- [local](LanguageSettingFilterFieldsDeprecated.md#local)

## Properties

### languageId

• **languageId**: `string` \| `string`[]

The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages

#### Defined in

[settings/CSpellSettingsDef.ts:447](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L447)

___

### local

• `Optional` **local**: `string` \| `string`[]

Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.

**`deprecated`**

**`deprecationmessage`** Use `locale` instead

#### Defined in

[settings/CSpellSettingsDef.ts:453](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L453)
