[@cspell/cspell-types](../README.md) / [Exports](../modules.md) / LanguageSettingFilterFieldsPreferred

# Interface: LanguageSettingFilterFieldsPreferred

## Hierarchy

- **`LanguageSettingFilterFieldsPreferred`**

  ↳ [`LanguageSettingFilterFields`](LanguageSettingFilterFields.md)

## Table of contents

### Properties

- [languageId](LanguageSettingFilterFieldsPreferred.md#languageid)
- [locale](LanguageSettingFilterFieldsPreferred.md#locale)

## Properties

### languageId

• **languageId**: `string` \| `string`[]

The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages

#### Defined in

[settings/CSpellSettingsDef.ts:440](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L440)

___

### locale

• `Optional` **locale**: `string` \| `string`[]

The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.

#### Defined in

[settings/CSpellSettingsDef.ts:442](https://github.com/streetsidesoftware/cspell/blob/2d85fdee/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L442)
