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

[CSpellSettingsDef.ts:498](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L498)

___

### local

• `Optional` **local**: `string` \| `string`[]

Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.

**`deprecated`**

**`deprecationmessage`** Use `locale` instead

#### Defined in

[CSpellSettingsDef.ts:504](https://github.com/streetsidesoftware/cspell/blob/27fe1d6b/packages/cspell-types/src/CSpellSettingsDef.ts#L504)
