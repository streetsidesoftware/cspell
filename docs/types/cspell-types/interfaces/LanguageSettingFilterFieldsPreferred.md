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

The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages.

#### Defined in

[CSpellSettingsDef.ts:539](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L539)

___

### locale

• `Optional` **locale**: `string` \| `string`[]

The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.

#### Defined in

[CSpellSettingsDef.ts:541](https://github.com/streetsidesoftware/cspell/blob/b805b11/packages/cspell-types/src/CSpellSettingsDef.ts#L541)
