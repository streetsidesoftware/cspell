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

The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages.

#### Defined in

[CSpellSettingsDef.ts:708](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L708)

___

### local

• `Optional` **local**: `string` \| `string`[]

Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.

**`Deprecated`**

true

**`Deprecation Message`**

Use `locale` instead.

#### Defined in

[CSpellSettingsDef.ts:714](https://github.com/streetsidesoftware/cspell/blob/aeb24c4/packages/cspell-types/src/CSpellSettingsDef.ts#L714)
