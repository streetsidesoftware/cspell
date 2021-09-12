[@cspell/cspell-types](README.md) / Exports

# @cspell/cspell-types

## Table of contents

### Interfaces

- [BaseSetting](interfaces/BaseSetting.md)
- [CSpellSettings](interfaces/CSpellSettings.md)
- [CSpellSettingsWithSourceTrace](interfaces/CSpellSettingsWithSourceTrace.md)
- [DictionaryDefinitionAlternate](interfaces/DictionaryDefinitionAlternate.md)
- [DictionaryDefinitionBase](interfaces/DictionaryDefinitionBase.md)
- [DictionaryDefinitionCustom](interfaces/DictionaryDefinitionCustom.md)
- [DictionaryDefinitionPreferred](interfaces/DictionaryDefinitionPreferred.md)
- [ExtendableSettings](interfaces/ExtendableSettings.md)
- [FileSettings](interfaces/FileSettings.md)
- [FileSource](interfaces/FileSource.md)
- [ImportFileRef](interfaces/ImportFileRef.md)
- [InMemorySource](interfaces/InMemorySource.md)
- [LanguageSetting](interfaces/LanguageSetting.md)
- [LanguageSettingFilterFields](interfaces/LanguageSettingFilterFields.md)
- [LanguageSettingFilterFieldsDeprecated](interfaces/LanguageSettingFilterFieldsDeprecated.md)
- [LanguageSettingFilterFieldsPreferred](interfaces/LanguageSettingFilterFieldsPreferred.md)
- [LegacySettings](interfaces/LegacySettings.md)
- [MergeSource](interfaces/MergeSource.md)
- [OverrideFilterFields](interfaces/OverrideFilterFields.md)
- [OverrideSettings](interfaces/OverrideSettings.md)
- [PnPSettings](interfaces/PnPSettings.md)
- [RegExpPatternDefinition](interfaces/RegExpPatternDefinition.md)
- [ReportingConfiguration](interfaces/ReportingConfiguration.md)
- [Settings](interfaces/Settings.md)
- [SuggestionsConfiguration](interfaces/SuggestionsConfiguration.md)
- [WorkspaceTrustSettings](interfaces/WorkspaceTrustSettings.md)

### Type aliases

- [CSpellPackageSettings](modules.md#cspellpackagesettings)
- [CSpellUserSettings](modules.md#cspellusersettings)
- [CSpellUserSettingsWithComments](modules.md#cspellusersettingswithcomments)
- [CustomDictionaryPath](modules.md#customdictionarypath)
- [CustomDictionaryScope](modules.md#customdictionaryscope)
- [DictionaryDefinition](modules.md#dictionarydefinition)
- [DictionaryFileTypes](modules.md#dictionaryfiletypes)
- [DictionaryId](modules.md#dictionaryid)
- [DictionaryNegRef](modules.md#dictionarynegref)
- [DictionaryPath](modules.md#dictionarypath)
- [DictionaryRef](modules.md#dictionaryref)
- [DictionaryReference](modules.md#dictionaryreference)
- [FsPath](modules.md#fspath)
- [Glob](modules.md#glob)
- [LanguageId](modules.md#languageid)
- [LanguageIdMultiple](modules.md#languageidmultiple)
- [LanguageIdMultipleNeg](modules.md#languageidmultipleneg)
- [LanguageIdSingle](modules.md#languageidsingle)
- [LocalId](modules.md#localid)
- [LocaleId](modules.md#localeid)
- [Pattern](modules.md#pattern)
- [PatternId](modules.md#patternid)
- [PatternRef](modules.md#patternref)
- [PredefinedPatterns](modules.md#predefinedpatterns)
- [RegExpPatternList](modules.md#regexppatternlist)
- [ReplaceEntry](modules.md#replaceentry)
- [ReplaceMap](modules.md#replacemap)
- [SimpleGlob](modules.md#simpleglob)
- [Source](modules.md#source)
- [TrustLevel](modules.md#trustlevel)
- [Version](modules.md#version)
- [VersionLatest](modules.md#versionlatest)
- [VersionLegacy](modules.md#versionlegacy)

## Type aliases

### CSpellPackageSettings

Ƭ **CSpellPackageSettings**: [`CSpellUserSettings`](modules.md#cspellusersettings)

These settings come from user and workspace settings.

#### Defined in

[settings/CSpellSettingsDef.ts:7](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L7)

___

### CSpellUserSettings

Ƭ **CSpellUserSettings**: [`CSpellSettings`](interfaces/CSpellSettings.md)

#### Defined in

[settings/CSpellSettingsDef.ts:9](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L9)

___

### CSpellUserSettingsWithComments

Ƭ **CSpellUserSettingsWithComments**: [`CSpellUserSettings`](modules.md#cspellusersettings)

#### Defined in

[settings/CSpellSettingsDef.ts:663](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L663)

___

### CustomDictionaryPath

Ƭ **CustomDictionaryPath**: `string`

A File System Path to a dictionary file.

**`pattern`** ^.*\.txt$

#### Defined in

[settings/CSpellSettingsDef.ts:645](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L645)

___

### CustomDictionaryScope

Ƭ **CustomDictionaryScope**: ``"user"`` \| ``"workspace"`` \| ``"folder"``

Specifies the scope of a dictionary.

#### Defined in

[settings/CSpellSettingsDef.ts:427](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L427)

___

### DictionaryDefinition

Ƭ **DictionaryDefinition**: [`DictionaryDefinitionPreferred`](interfaces/DictionaryDefinitionPreferred.md) \| [`DictionaryDefinitionCustom`](interfaces/DictionaryDefinitionCustom.md) \| [`DictionaryDefinitionAlternate`](interfaces/DictionaryDefinitionAlternate.md) \| `DictionaryDefinitionLegacy`

#### Defined in

[settings/CSpellSettingsDef.ts:333](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L333)

___

### DictionaryFileTypes

Ƭ **DictionaryFileTypes**: ``"S"`` \| ``"W"`` \| ``"C"`` \| ``"T"``

#### Defined in

[settings/CSpellSettingsDef.ts:331](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L331)

___

### DictionaryId

Ƭ **DictionaryId**: `string`

This is the name of a dictionary.

Name Format:
- Must contain at least 1 number or letter.
- spaces are allowed.
- Leading and trailing space will be removed.
- Names ARE case-sensitive
- Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`

**`pattern`** ^(?=[^!*,;{}[\]~\n]+$)(?=(.*\w)).+$

#### Defined in

[settings/CSpellSettingsDef.ts:528](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L528)

___

### DictionaryNegRef

Ƭ **DictionaryNegRef**: `string`

This a negative reference to a named dictionary.

It is used to exclude or include a dictionary by name.

The reference starts with 1 or more `!`.
- `!<dictionary_name>` - Used to exclude the dictionary matching `<dictionary_name>`
- `!!<dictionary_name>` - Used to re-include a dictionary matching `<dictionary_name>`
   Overrides `!<dictionary_name>`.
- `!!!<dictionary_name>` - Used to exclude a dictionary matching `<dictionary_name>`
   Overrides `!!<dictionary_name>`.

**`pattern`** ^(?=!+[^!*,;{}[\]~\n]+$)(?=(.*\w)).+$

#### Defined in

[settings/CSpellSettingsDef.ts:550](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L550)

___

### DictionaryPath

Ƭ **DictionaryPath**: `string`

A File System Path to a dictionary file.

**`pattern`** ^.*\.(?:txt|trie)(?:\.gz)?$

#### Defined in

[settings/CSpellSettingsDef.ts:639](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L639)

___

### DictionaryRef

Ƭ **DictionaryRef**: [`DictionaryId`](modules.md#dictionaryid)

This a reference to a named dictionary.
It is expected to match the name of a dictionary.

#### Defined in

[settings/CSpellSettingsDef.ts:534](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L534)

___

### DictionaryReference

Ƭ **DictionaryReference**: [`DictionaryRef`](modules.md#dictionaryref) \| [`DictionaryNegRef`](modules.md#dictionarynegref)

Reference to a dictionary by name.
One of:
- [DictionaryRef](modules.md#dictionaryref)
- [DictionaryNegRef](modules.md#dictionarynegref)

#### Defined in

[settings/CSpellSettingsDef.ts:558](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L558)

___

### FsPath

Ƭ **FsPath**: `string`

A File System Path

#### Defined in

[settings/CSpellSettingsDef.ts:630](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L630)

___

### Glob

Ƭ **Glob**: [`SimpleGlob`](modules.md#simpleglob) \| `GlobDef`

These are glob expressions

#### Defined in

[settings/CSpellSettingsDef.ts:584](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L584)

___

### LanguageId

Ƭ **LanguageId**: [`LanguageIdSingle`](modules.md#languageidsingle) \| [`LanguageIdMultiple`](modules.md#languageidmultiple) \| [`LanguageIdMultipleNeg`](modules.md#languageidmultipleneg)

#### Defined in

[settings/CSpellSettingsDef.ts:627](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L627)

___

### LanguageIdMultiple

Ƭ **LanguageIdMultiple**: `string`

This can be 'typescript,cpp,json,literal haskell', etc.

**`pattern`** ^([-\w_\s]+)(,[-\w_\s]+)*$

#### Defined in

[settings/CSpellSettingsDef.ts:619](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L619)

___

### LanguageIdMultipleNeg

Ƭ **LanguageIdMultipleNeg**: `string`

This can be 'typescript,cpp,json,literal haskell', etc.

**`pattern`** ^(![-\w_\s]+)(,![-\w_\s]+)*$

#### Defined in

[settings/CSpellSettingsDef.ts:625](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L625)

___

### LanguageIdSingle

Ƭ **LanguageIdSingle**: `string`

This can be '*', 'typescript', 'cpp', 'json', etc.

**`pattern`** ^(!?[-\w_\s]+)|(\*)$

#### Defined in

[settings/CSpellSettingsDef.ts:613](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L613)

___

### LocalId

Ƭ **LocalId**: [`LocaleId`](modules.md#localeid)

**`deprecated`**

**`deprecationmessage`** Use LocaleId instead

#### Defined in

[settings/CSpellSettingsDef.ts:581](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L581)

___

### LocaleId

Ƭ **LocaleId**: `string`

This is a written language locale like: 'en', 'en-GB', 'fr', 'es', 'de', etc.

#### Defined in

[settings/CSpellSettingsDef.ts:561](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L561)

___

### Pattern

Ƭ **Pattern**: `string` \| `InternalRegExp`

#### Defined in

[settings/CSpellSettingsDef.ts:479](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L479)

___

### PatternId

Ƭ **PatternId**: `string`

This matches the name in a pattern definition

#### Defined in

[settings/CSpellSettingsDef.ts:508](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L508)

___

### PatternRef

Ƭ **PatternRef**: [`Pattern`](modules.md#pattern) \| [`PatternId`](modules.md#patternid) \| [`PredefinedPatterns`](modules.md#predefinedpatterns)

A PatternRef is a Pattern or PatternId.

#### Defined in

[settings/CSpellSettingsDef.ts:511](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L511)

___

### PredefinedPatterns

Ƭ **PredefinedPatterns**: ``"Base64"`` \| ``"CStyleComment"`` \| ``"CStyleHexValue"`` \| ``"CSSHexValue"`` \| ``"CommitHash"`` \| ``"CommitHashLink"`` \| ``"Email"`` \| ``"EscapeCharacters"`` \| ``"HexValues"`` \| ``"href"`` \| ``"PhpHereDoc"`` \| ``"PublicKey"`` \| ``"RsaCert"`` \| ``"SHA"`` \| ``"SpellCheckerDisable"`` \| ``"SpellCheckerDisableBlock"`` \| ``"SpellCheckerDisableLine"`` \| ``"SpellCheckerDisableNext"`` \| ``"SpellCheckerIgnoreInDocSetting"`` \| ``"string"`` \| ``"UnicodeRef"`` \| ``"Urls"`` \| ``"UUID"`` \| ``"Everything"``

#### Defined in

[settings/CSpellSettingsDef.ts:481](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L481)

___

### RegExpPatternList

Ƭ **RegExpPatternList**: [`PatternRef`](modules.md#patternref)[]

A list of pattern names or regular expressions

#### Defined in

[settings/CSpellSettingsDef.ts:514](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L514)

___

### ReplaceEntry

Ƭ **ReplaceEntry**: [`string`, `string`]

#### Defined in

[settings/CSpellSettingsDef.ts:1](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L1)

___

### ReplaceMap

Ƭ **ReplaceMap**: [`ReplaceEntry`](modules.md#replaceentry)[]

#### Defined in

[settings/CSpellSettingsDef.ts:2](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L2)

___

### SimpleGlob

Ƭ **SimpleGlob**: `string`

Simple Glob string, the root will be globRoot

#### Defined in

[settings/CSpellSettingsDef.ts:587](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L587)

___

### Source

Ƭ **Source**: [`FileSource`](interfaces/FileSource.md) \| [`MergeSource`](interfaces/MergeSource.md) \| [`InMemorySource`](interfaces/InMemorySource.md) \| `BaseSource`

#### Defined in

[settings/CSpellSettingsDef.ts:666](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L666)

___

### TrustLevel

Ƭ **TrustLevel**: ``"trusted"`` \| ``"untrusted"``

Trust Security Level

#### Defined in

[settings/CSpellSettingsDef.ts:633](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L633)

___

### Version

Ƭ **Version**: [`VersionLatest`](modules.md#versionlatest) \| [`VersionLegacy`](modules.md#versionlegacy)

#### Defined in

[settings/CSpellSettingsDef.ts:575](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L575)

___

### VersionLatest

Ƭ **VersionLatest**: ``"0.2"``

Configuration File Version

#### Defined in

[settings/CSpellSettingsDef.ts:566](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L566)

___

### VersionLegacy

Ƭ **VersionLegacy**: ``"0.1"``

Legacy Configuration File Versions

**`deprecated`**

**`deprecationmessage`** Use `0.2`

#### Defined in

[settings/CSpellSettingsDef.ts:573](https://github.com/streetsidesoftware/cspell/blob/2bb6c82a/packages/cspell-types/src/settings/CSpellSettingsDef.ts#L573)
