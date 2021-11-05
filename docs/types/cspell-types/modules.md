[@cspell/cspell-types](README.md) / Exports

# @cspell/cspell-types

## Table of contents

### Interfaces

- [BaseSetting](interfaces/BaseSetting.md)
- [CSpellReporter](interfaces/CSpellReporter.md)
- [CSpellReporterModule](interfaces/CSpellReporterModule.md)
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
- [Issue](interfaces/Issue.md)
- [LanguageSetting](interfaces/LanguageSetting.md)
- [LanguageSettingFilterFields](interfaces/LanguageSettingFilterFields.md)
- [LanguageSettingFilterFieldsDeprecated](interfaces/LanguageSettingFilterFieldsDeprecated.md)
- [LanguageSettingFilterFieldsPreferred](interfaces/LanguageSettingFilterFieldsPreferred.md)
- [LegacySettings](interfaces/LegacySettings.md)
- [MergeSource](interfaces/MergeSource.md)
- [OverrideFilterFields](interfaces/OverrideFilterFields.md)
- [OverrideSettings](interfaces/OverrideSettings.md)
- [PnPSettings](interfaces/PnPSettings.md)
- [ProgressFileComplete](interfaces/ProgressFileComplete.md)
- [RegExpPatternDefinition](interfaces/RegExpPatternDefinition.md)
- [ReportingConfiguration](interfaces/ReportingConfiguration.md)
- [RunResult](interfaces/RunResult.md)
- [Settings](interfaces/Settings.md)
- [SuggestionsConfiguration](interfaces/SuggestionsConfiguration.md)
- [TextDocumentOffset](interfaces/TextDocumentOffset.md)
- [TextOffset](interfaces/TextOffset.md)
- [WorkspaceTrustSettings](interfaces/WorkspaceTrustSettings.md)

### Type aliases

- [CSpellPackageSettings](modules.md#cspellpackagesettings)
- [CSpellUserSettings](modules.md#cspellusersettings)
- [CSpellUserSettingsWithComments](modules.md#cspellusersettingswithcomments)
- [CustomDictionaryPath](modules.md#customdictionarypath)
- [CustomDictionaryScope](modules.md#customdictionaryscope)
- [DebugEmitter](modules.md#debugemitter)
- [DictionaryDefinition](modules.md#dictionarydefinition)
- [DictionaryFileTypes](modules.md#dictionaryfiletypes)
- [DictionaryId](modules.md#dictionaryid)
- [DictionaryNegRef](modules.md#dictionarynegref)
- [DictionaryPath](modules.md#dictionarypath)
- [DictionaryRef](modules.md#dictionaryref)
- [DictionaryReference](modules.md#dictionaryreference)
- [ErrorEmitter](modules.md#erroremitter)
- [ErrorLike](modules.md#errorlike)
- [FsPath](modules.md#fspath)
- [Glob](modules.md#glob)
- [LanguageId](modules.md#languageid)
- [LanguageIdMultiple](modules.md#languageidmultiple)
- [LanguageIdMultipleNeg](modules.md#languageidmultipleneg)
- [LanguageIdSingle](modules.md#languageidsingle)
- [LocalId](modules.md#localid)
- [LocaleId](modules.md#localeid)
- [MessageEmitter](modules.md#messageemitter)
- [MessageType](modules.md#messagetype)
- [MessageTypeLookup](modules.md#messagetypelookup)
- [Pattern](modules.md#pattern)
- [PatternId](modules.md#patternid)
- [PatternRef](modules.md#patternref)
- [PredefinedPatterns](modules.md#predefinedpatterns)
- [ProgressEmitter](modules.md#progressemitter)
- [ProgressItem](modules.md#progressitem)
- [ProgressTypes](modules.md#progresstypes)
- [RegExpPatternList](modules.md#regexppatternlist)
- [ReplaceEntry](modules.md#replaceentry)
- [ReplaceMap](modules.md#replacemap)
- [ReporterSettings](modules.md#reportersettings)
- [ResultEmitter](modules.md#resultemitter)
- [SimpleGlob](modules.md#simpleglob)
- [Source](modules.md#source)
- [SpellingErrorEmitter](modules.md#spellingerroremitter)
- [TrustLevel](modules.md#trustlevel)
- [Version](modules.md#version)
- [VersionLatest](modules.md#versionlatest)
- [VersionLegacy](modules.md#versionlegacy)

### Variables

- [MessageTypes](modules.md#messagetypes)

## Type aliases

### CSpellPackageSettings

Ƭ **CSpellPackageSettings**: [`CSpellUserSettings`](modules.md#cspellusersettings)

These settings come from user and workspace settings.

#### Defined in

[CSpellSettingsDef.ts:7](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L7)

___

### CSpellUserSettings

Ƭ **CSpellUserSettings**: [`CSpellSettings`](interfaces/CSpellSettings.md)

#### Defined in

[CSpellSettingsDef.ts:9](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L9)

___

### CSpellUserSettingsWithComments

Ƭ **CSpellUserSettingsWithComments**: [`CSpellUserSettings`](modules.md#cspellusersettings)

#### Defined in

[CSpellSettingsDef.ts:694](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L694)

___

### CustomDictionaryPath

Ƭ **CustomDictionaryPath**: `string`

A File System Path to a dictionary file.

**`pattern`** ^.*\.txt$

#### Defined in

[CSpellSettingsDef.ts:676](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L676)

___

### CustomDictionaryScope

Ƭ **CustomDictionaryScope**: ``"user"`` \| ``"workspace"`` \| ``"folder"``

Specifies the scope of a dictionary.

#### Defined in

[CSpellSettingsDef.ts:458](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L458)

___

### DebugEmitter

Ƭ **DebugEmitter**: (`message`: `string`) => `void`

#### Type declaration

▸ (`message`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |

##### Returns

`void`

#### Defined in

[CSpellReporter.ts:24](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L24)

___

### DictionaryDefinition

Ƭ **DictionaryDefinition**: [`DictionaryDefinitionPreferred`](interfaces/DictionaryDefinitionPreferred.md) \| [`DictionaryDefinitionCustom`](interfaces/DictionaryDefinitionCustom.md) \| [`DictionaryDefinitionAlternate`](interfaces/DictionaryDefinitionAlternate.md) \| `DictionaryDefinitionLegacy`

#### Defined in

[CSpellSettingsDef.ts:354](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L354)

___

### DictionaryFileTypes

Ƭ **DictionaryFileTypes**: ``"S"`` \| ``"W"`` \| ``"C"`` \| ``"T"``

#### Defined in

[CSpellSettingsDef.ts:352](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L352)

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

[CSpellSettingsDef.ts:559](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L559)

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

[CSpellSettingsDef.ts:581](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L581)

___

### DictionaryPath

Ƭ **DictionaryPath**: `string`

A File System Path to a dictionary file.

**`pattern`** ^.*\.(?:txt|trie)(?:\.gz)?$

#### Defined in

[CSpellSettingsDef.ts:670](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L670)

___

### DictionaryRef

Ƭ **DictionaryRef**: [`DictionaryId`](modules.md#dictionaryid)

This a reference to a named dictionary.
It is expected to match the name of a dictionary.

#### Defined in

[CSpellSettingsDef.ts:565](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L565)

___

### DictionaryReference

Ƭ **DictionaryReference**: [`DictionaryRef`](modules.md#dictionaryref) \| [`DictionaryNegRef`](modules.md#dictionarynegref)

Reference to a dictionary by name.
One of:
- [DictionaryRef](modules.md#dictionaryref)
- [DictionaryNegRef](modules.md#dictionarynegref)

#### Defined in

[CSpellSettingsDef.ts:589](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L589)

___

### ErrorEmitter

Ƭ **ErrorEmitter**: (`message`: `string`, `error`: [`ErrorLike`](modules.md#errorlike)) => `void`

#### Type declaration

▸ (`message`, `error`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `error` | [`ErrorLike`](modules.md#errorlike) |

##### Returns

`void`

#### Defined in

[CSpellReporter.ts:28](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L28)

___

### ErrorLike

Ƭ **ErrorLike**: `Error` \| { `message`: `string` ; `name`: `string` ; `toString`: () => `string`  }

#### Defined in

[CSpellReporter.ts:26](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L26)

___

### FsPath

Ƭ **FsPath**: `string`

A File System Path

#### Defined in

[CSpellSettingsDef.ts:661](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L661)

___

### Glob

Ƭ **Glob**: [`SimpleGlob`](modules.md#simpleglob) \| `GlobDef`

These are glob expressions

#### Defined in

[CSpellSettingsDef.ts:615](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L615)

___

### LanguageId

Ƭ **LanguageId**: [`LanguageIdSingle`](modules.md#languageidsingle) \| [`LanguageIdMultiple`](modules.md#languageidmultiple) \| [`LanguageIdMultipleNeg`](modules.md#languageidmultipleneg)

#### Defined in

[CSpellSettingsDef.ts:658](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L658)

___

### LanguageIdMultiple

Ƭ **LanguageIdMultiple**: `string`

This can be 'typescript,cpp,json,literal haskell', etc.

**`pattern`** ^([-\w_\s]+)(,[-\w_\s]+)*$

#### Defined in

[CSpellSettingsDef.ts:650](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L650)

___

### LanguageIdMultipleNeg

Ƭ **LanguageIdMultipleNeg**: `string`

This can be 'typescript,cpp,json,literal haskell', etc.

**`pattern`** ^(![-\w_\s]+)(,![-\w_\s]+)*$

#### Defined in

[CSpellSettingsDef.ts:656](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L656)

___

### LanguageIdSingle

Ƭ **LanguageIdSingle**: `string`

This can be '*', 'typescript', 'cpp', 'json', etc.

**`pattern`** ^(!?[-\w_\s]+)|(\*)$

#### Defined in

[CSpellSettingsDef.ts:644](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L644)

___

### LocalId

Ƭ **LocalId**: [`LocaleId`](modules.md#localeid)

**`deprecated`** true

**`deprecationmessage`** Use LocaleId instead

#### Defined in

[CSpellSettingsDef.ts:612](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L612)

___

### LocaleId

Ƭ **LocaleId**: `string`

This is a written language locale like: 'en', 'en-GB', 'fr', 'es', 'de', etc.

#### Defined in

[CSpellSettingsDef.ts:592](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L592)

___

### MessageEmitter

Ƭ **MessageEmitter**: (`message`: `string`, `msgType`: [`MessageType`](modules.md#messagetype)) => `void`

#### Type declaration

▸ (`message`, `msgType`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `msgType` | [`MessageType`](modules.md#messagetype) |

##### Returns

`void`

#### Defined in

[CSpellReporter.ts:22](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L22)

___

### MessageType

Ƭ **MessageType**: ``"Debug"`` \| ``"Info"`` \| ``"Warning"``

#### Defined in

[CSpellReporter.ts:10](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L10)

___

### MessageTypeLookup

Ƭ **MessageTypeLookup**: { [key in MessageType]: key }

#### Defined in

[CSpellReporter.ts:12](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L12)

___

### Pattern

Ƭ **Pattern**: `string` \| `InternalRegExp`

#### Defined in

[CSpellSettingsDef.ts:510](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L510)

___

### PatternId

Ƭ **PatternId**: `string`

This matches the name in a pattern definition

#### Defined in

[CSpellSettingsDef.ts:539](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L539)

___

### PatternRef

Ƭ **PatternRef**: [`Pattern`](modules.md#pattern) \| [`PatternId`](modules.md#patternid) \| [`PredefinedPatterns`](modules.md#predefinedpatterns)

A PatternRef is a Pattern or PatternId.

#### Defined in

[CSpellSettingsDef.ts:542](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L542)

___

### PredefinedPatterns

Ƭ **PredefinedPatterns**: ``"Base64"`` \| ``"CStyleComment"`` \| ``"CStyleHexValue"`` \| ``"CSSHexValue"`` \| ``"CommitHash"`` \| ``"CommitHashLink"`` \| ``"Email"`` \| ``"EscapeCharacters"`` \| ``"HexValues"`` \| ``"href"`` \| ``"PhpHereDoc"`` \| ``"PublicKey"`` \| ``"RsaCert"`` \| ``"SHA"`` \| ``"SpellCheckerDisable"`` \| ``"SpellCheckerDisableBlock"`` \| ``"SpellCheckerDisableLine"`` \| ``"SpellCheckerDisableNext"`` \| ``"SpellCheckerIgnoreInDocSetting"`` \| ``"string"`` \| ``"UnicodeRef"`` \| ``"Urls"`` \| ``"UUID"`` \| ``"Everything"``

#### Defined in

[CSpellSettingsDef.ts:512](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L512)

___

### ProgressEmitter

Ƭ **ProgressEmitter**: (`p`: [`ProgressItem`](modules.md#progressitem) \| [`ProgressFileComplete`](interfaces/ProgressFileComplete.md)) => `void`

#### Type declaration

▸ (`p`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `p` | [`ProgressItem`](modules.md#progressitem) \| [`ProgressFileComplete`](interfaces/ProgressFileComplete.md) |

##### Returns

`void`

#### Defined in

[CSpellReporter.ts:49](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L49)

___

### ProgressItem

Ƭ **ProgressItem**: [`ProgressFileComplete`](interfaces/ProgressFileComplete.md)

#### Defined in

[CSpellReporter.ts:33](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L33)

___

### ProgressTypes

Ƭ **ProgressTypes**: ``"ProgressFileComplete"``

#### Defined in

[CSpellReporter.ts:32](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L32)

___

### RegExpPatternList

Ƭ **RegExpPatternList**: [`PatternRef`](modules.md#patternref)[]

A list of pattern names or regular expressions

#### Defined in

[CSpellSettingsDef.ts:545](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L545)

___

### ReplaceEntry

Ƭ **ReplaceEntry**: [`string`, `string`]

#### Defined in

[CSpellSettingsDef.ts:1](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L1)

___

### ReplaceMap

Ƭ **ReplaceMap**: [`ReplaceEntry`](modules.md#replaceentry)[]

#### Defined in

[CSpellSettingsDef.ts:2](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L2)

___

### ReporterSettings

Ƭ **ReporterSettings**: `string` \| [`string`] \| [`string`, `unknown`]

reporter name or reporter name + reporter config

#### Defined in

[CSpellSettingsDef.ts:746](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L746)

___

### ResultEmitter

Ƭ **ResultEmitter**: (`result`: [`RunResult`](interfaces/RunResult.md)) => `void` \| `Promise`<`void`\>

#### Type declaration

▸ (`result`): `void` \| `Promise`<`void`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `result` | [`RunResult`](interfaces/RunResult.md) |

##### Returns

`void` \| `Promise`<`void`\>

#### Defined in

[CSpellReporter.ts:58](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L58)

___

### SimpleGlob

Ƭ **SimpleGlob**: `string`

Simple Glob string, the root will be globRoot

#### Defined in

[CSpellSettingsDef.ts:618](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L618)

___

### Source

Ƭ **Source**: [`FileSource`](interfaces/FileSource.md) \| [`MergeSource`](interfaces/MergeSource.md) \| [`InMemorySource`](interfaces/InMemorySource.md) \| `BaseSource`

#### Defined in

[CSpellSettingsDef.ts:697](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L697)

___

### SpellingErrorEmitter

Ƭ **SpellingErrorEmitter**: (`issue`: [`Issue`](interfaces/Issue.md)) => `void`

#### Type declaration

▸ (`issue`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `issue` | [`Issue`](interfaces/Issue.md) |

##### Returns

`void`

#### Defined in

[CSpellReporter.ts:30](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L30)

___

### TrustLevel

Ƭ **TrustLevel**: ``"trusted"`` \| ``"untrusted"``

Trust Security Level

#### Defined in

[CSpellSettingsDef.ts:664](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L664)

___

### Version

Ƭ **Version**: [`VersionLatest`](modules.md#versionlatest) \| [`VersionLegacy`](modules.md#versionlegacy)

#### Defined in

[CSpellSettingsDef.ts:606](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L606)

___

### VersionLatest

Ƭ **VersionLatest**: ``"0.2"``

Configuration File Version

#### Defined in

[CSpellSettingsDef.ts:597](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L597)

___

### VersionLegacy

Ƭ **VersionLegacy**: ``"0.1"``

Legacy Configuration File Versions

**`deprecated`** true

**`deprecationmessage`** Use `0.2`

#### Defined in

[CSpellSettingsDef.ts:604](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellSettingsDef.ts#L604)

## Variables

### MessageTypes

• **MessageTypes**: [`MessageTypeLookup`](modules.md#messagetypelookup)

#### Defined in

[CSpellReporter.ts:16](https://github.com/streetsidesoftware/cspell/blob/b8502b6d/packages/cspell-types/src/CSpellReporter.ts#L16)
