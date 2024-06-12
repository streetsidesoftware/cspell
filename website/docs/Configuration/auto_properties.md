---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-properties.js`
title: Properties
slug: properties
toc_max_heading_level: 5
format: md
---

# CSpell Configuration



## Settings

| Field | Type | Description |
| --- | --- | --- |
| [$schema](#settings--schema) | `string` | Url to JSON Schema | 
| [allowCompoundWords](#settings-allowcompoundwords) | `boolean` | True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details. | 
| [cache](#settings-cache) | `CacheSettings` | Define cache settings. | 
| [caseSensitive](#settings-casesensitive) | `boolean` | Determines if words must match case and accent rules. | 
| [description](#settings-description) | `string` | Optional description of configuration. | 
| [dictionaries](#settings-dictionaries) | `DictionaryReference[]` | Optional list of dictionaries to use. Each entry should match the name of the dictionary. | 
| [dictionaryDefinitions](#settings-dictionarydefinitions) | `DictionaryDefinition[]` | Define additional available dictionaries. | 
| [enableFiletypes](#settings-enablefiletypes) | `LanguageIdSingle[]` | Enable / Disable checking file types (languageIds). | 
| [enableGlobDot](#settings-enableglobdot) | `boolean` | Enable scanning files and directories beginning with `.` (period). | 
| [enabled](#settings-enabled) | `boolean` | Is the spell checker enabled. | 
| [enabledFileTypes](#settings-enabledfiletypes) | `object` | Enable / Disable checking file types (languageIds). | 
| [enabledLanguageIds](#settings-enabledlanguageids) | `LanguageIdSingle[]` | Specify a list of file types to spell check. It is better to use  [Settings.enabledFileTypes](#settings-enabledfiletypes)  to Enable / Disable checking files types. | 
| [failFast](#settings-failfast) | `boolean` | Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks) | 
| [features](#settings-features) | `Features` | Configure CSpell features. | 
| [files](#settings-files) | `Glob[]` | Glob patterns of files to be checked. | 
| [flagWords](#settings-flagwords) | `string[]` | List of words to always be considered incorrect. Words found in `flagWords` override `words`. | 
| [gitignoreRoot](#settings-gitignoreroot) | `FsPath`<br />`FsPath[]` | Tells the spell checker to stop searching for `.gitignore` files when it reaches a matching root. | 
| [globRoot](#settings-globroot) | `FSPathResolvable` | The root to use for glob patterns found in this configuration. | 
| [id](#settings-id) | `string` | Optional identifier. | 
| [ignorePaths](#settings-ignorepaths) | `Glob[]` | Glob patterns of files to be ignored. | 
| [ignoreRegExpList](#settings-ignoreregexplist) | `RegExpPatternList` | List of regular expression patterns or pattern names to exclude from spell checking. | 
| [ignoreWords](#settings-ignorewords) | `string[]` | List of words to be ignored. An ignored word will not show up as an error, even if it is | 
| [import](#settings-import) | `FsPath`<br />`FsPath[]` | Allows this configuration to inherit configuration for one or more other files. | 
| [includeRegExpList](#settings-includeregexplist) | `RegExpPatternList` | List of regular expression patterns or defined pattern names to match for spell checking. | 
| [language](#settings-language) | `LocaleId` | Current active spelling language. This specifies the language locale to use in choosing the | 
| [languageId](#settings-languageid) | `MatchingFileType` | Forces the spell checker to assume a give language id. Used mainly as an Override. | 
| [languageSettings](#settings-languagesettings) | `LanguageSetting[]` | Additional settings for individual languages. | 
| [loadDefaultConfiguration](#settings-loaddefaultconfiguration) | `boolean` | By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false` | 
| [maxDuplicateProblems](#settings-maxduplicateproblems) | `number` | The maximum number of times the same word can be flagged as an error in a file. | 
| [maxNumberOfProblems](#settings-maxnumberofproblems) | `number` | The maximum number of problems to report in a file. | 
| [minWordLength](#settings-minwordlength) | `number` | The minimum length of a word before checking it against a dictionary. | 
| [name](#settings-name) | `string` | Optional name of configuration. | 
| [noConfigSearch](#settings-noconfigsearch) | `boolean` | Prevents searching for local configuration when checking individual documents. | 
| [noSuggestDictionaries](#settings-nosuggestdictionaries) | `DictionaryReference[]` | Optional list of dictionaries that will not be used for suggestions. | 
| [numSuggestions](#settings-numsuggestions) | `number` | Number of suggestions to make. | 
| [overrides](#settings-overrides) | `OverrideSettings[]` | Overrides are used to apply settings for specific files in your project. | 
| [patterns](#settings-patterns) | `RegExpPatternDefinition[]` | Defines a list of patterns that can be used with the `ignoreRegExpList` and | 
| [pnpFiles](#settings-pnpfiles) | `string[]` | The PnP files to search for. Note: `.mjs` files are not currently supported. | 
| [readonly](#settings-readonly) | `boolean` | Indicate that the configuration file should not be modified. | 
| [reporters](#settings-reporters) | `ReporterSettings[]` | Define which reports to use. | 
| [showStatus](#settings-showstatus) | `boolean` | Show status. | 
| [spellCheckDelayMs](#settings-spellcheckdelayms) | `number` | Delay in ms after a document has changed before checking it for spelling errors. | 
| [suggestWords](#settings-suggestwords) | `string[]` | A list of suggested replacements for words. | 
| [suggestionNumChanges](#settings-suggestionnumchanges) | `number` | The maximum number of changes allowed on a word to be considered a suggestions. | 
| [suggestionsTimeout](#settings-suggestionstimeout) | `number` | The maximum amount of time in milliseconds to generate suggestions for a word. | 
| [useGitignore](#settings-usegitignore) | `boolean` | Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found. | 
| [usePnP](#settings-usepnp) | `boolean` | Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading | 
| [userWords](#settings-userwords) | `string[]` | Words to add to global dictionary -- should only be in the user config file. | 
| [validateDirectives](#settings-validatedirectives) | `boolean` | Verify that the in-document directives are correct. | 
| [version](#settings-version) | `Version` | Configuration format version of the settings file. | 
| [words](#settings-words) | `string[]` | List of words to be considered correct. | 


### Settings Fields


---

#### `$schema` {#settings--schema}


<dl>
    
    <dt>Description</dt>
    <dd>
        Url to JSON Schema
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `allowCompoundWords` {#settings-allowcompoundwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `cache` {#settings-cache}


<dl>
    
    <dt>Description</dt>
    <dd>
        Define cache settings.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CacheSettings`
    </dd>
</dl>




---

#### `caseSensitive` {#settings-casesensitive}


<dl>
    
    <dt>Description</dt>
    <dd>
        Determines if words must match case and accent rules.
        
        - `false` - Case is ignored and accents can be missing on the entire word.
          Incorrect accents or partially missing accents will be marked as incorrect.
        - `true` - Case and accents are enforced.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `description` {#settings-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description of configuration.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `dictionaries` {#settings-dictionaries}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional list of dictionaries to use. Each entry should match the name of the dictionary.
        
        To remove a dictionary from the list, add `!` before the name.
        
        For example, `!typescript` will turn off the dictionary with the name `typescript`.
        
        See the [Dictionaries](https://cspell.org/docs/dictionaries/)
        and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryReference[]`
    </dd>
</dl>




---

#### `dictionaryDefinitions` {#settings-dictionarydefinitions}


<dl>
    
    <dt>Description</dt>
    <dd>
        Define additional available dictionaries.
        
        For example, you can use the following to add a custom dictionary:
        
        ```json
        "dictionaryDefinitions": [
          { "name": "custom-words", "path": "./custom-words.txt"}
        ],
        "dictionaries": ["custom-words"]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryDefinition[]`
    </dd>
</dl>




---

#### `enableFiletypes` {#settings-enablefiletypes}


<dl>
    
    <dt>Description</dt>
    <dd>
        Enable / Disable checking file types (languageIds).
        
        These are in additional to the file types specified by  [Settings.enabledLanguageIds](#settings-enabledlanguageids) .
        To disable a language, prefix with `!` as in `!json`,
        
        
        **Example: individual file types**
        
        ```
        jsonc       // enable checking for jsonc
        !json       // disable checking for json
        kotlin      // enable checking for kotlin
        ```
        
        **Example: enable all file types**
        
        ```
        *           // enable checking for all file types
        !json       // except for json
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LanguageIdSingle[]`
    </dd>
</dl>




---

#### `enableGlobDot` {#settings-enableglobdot}


<dl>
    
    <dt>Description</dt>
    <dd>
        Enable scanning files and directories beginning with `.` (period).
        
        By default, CSpell does not scan `hidden` files.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `enabled` {#settings-enabled}


<dl>
    
    <dt>Description</dt>
    <dd>
        Is the spell checker enabled.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `enabledFileTypes` {#settings-enabledfiletypes}


<dl>
    
    <dt>Description</dt>
    <dd>
        Enable / Disable checking file types (languageIds).
        
        This setting replaces:  [Settings.enabledLanguageIds](#settings-enabledlanguageids)  and  [Settings.enableFiletypes](#settings-enablefiletypes) .
        
        A Value of:
        - `true` - enable checking for the file type
        - `false` - disable checking for the file type
        
        A file type of `*` is a wildcard that enables all file types.
        
        **Example: enable all file types**
        
        | File Type | Enabled | Comment |
        | --------- | ------- | ------- |
        | `*`       | `true`  | Enable all file types. |
        | `json`    | `false` | Disable checking for json files. |
    </dd>
    
    <dt>Type</dt>
    <dd>
        `object`
    </dd>
</dl>




---

#### `enabledLanguageIds` {#settings-enabledlanguageids}


<dl>
    
    <dt>Description</dt>
    <dd>
        Specify a list of file types to spell check. It is better to use  [Settings.enabledFileTypes](#settings-enabledfiletypes)  to Enable / Disable checking files types.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LanguageIdSingle[]`
    </dd>
</dl>




---

#### `failFast` {#settings-failfast}


<dl>
    
    <dt>Description</dt>
    <dd>
        Exit with non-zero code as soon as an issue/error is encountered (useful for CI or git hooks)
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `features` {#settings-features}


<dl>
    
    <dt>Description</dt>
    <dd>
        Configure CSpell features.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Features`
    </dd>
</dl>




---

#### `files` {#settings-files}


<dl>
    
    <dt>Description</dt>
    <dd>
        Glob patterns of files to be checked.
        
        Glob patterns are relative to the `globRoot` of the configuration file that defines them.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Glob[]`
    </dd>
</dl>




---

#### `flagWords` {#settings-flagwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to always be considered incorrect. Words found in `flagWords` override `words`.
        
        Format of `flagWords`
        - single word entry - `word`
        - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
        
        Example:
        ```ts
        "flagWords": [
          "color: colour",
          "incase: in case, encase",
          "canot->cannot",
          "cancelled->canceled"
        ]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `gitignoreRoot` {#settings-gitignoreroot}


<dl>
    
    <dt>Description</dt>
    <dd>
        Tells the spell checker to stop searching for `.gitignore` files when it reaches a matching root.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `FsPath`<br />`FsPath[]`
    </dd>
</dl>




---

#### `globRoot` {#settings-globroot}


<dl>
    
    <dt>Description</dt>
    <dd>
        The root to use for glob patterns found in this configuration.
        Default: location of the configuration file.
          For compatibility reasons, config files with version 0.1, the glob root will
          default to be `${cwd}`.
        
        Use `globRoot` to define a different location.
        `globRoot` can be relative to the location of this configuration file.
        Defining globRoot, does not impact imported configurations.
        
        Special Values:
        - `${cwd}` - will be replaced with the current working directory.
        - `.` - will be the location of the containing configuration file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `FSPathResolvable`
    </dd>
</dl>




---

#### `id` {#settings-id}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional identifier.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `ignorePaths` {#settings-ignorepaths}


<dl>
    
    <dt>Description</dt>
    <dd>
        Glob patterns of files to be ignored.
        
        Glob patterns are relative to the `globRoot` of the configuration file that defines them.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Glob[]`
    </dd>
</dl>




---

#### `ignoreRegExpList` {#settings-ignoreregexplist}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of regular expression patterns or pattern names to exclude from spell checking.
        
        Example: `["href"]` - to exclude html href pattern.
        
        Regular expressions use JavaScript regular expression syntax.
        
        Example: to ignore ALL-CAPS words
        
        JSON
        ```json
        "ignoreRegExpList": ["/\\b[A-Z]+\\b/g"]
        ```
        
        YAML
        ```yaml
        ignoreRegExpList:
          - >-
           /\b[A-Z]+\b/g
        ```
        
        By default, several patterns are excluded. See
        [Configuration](https://cspell.org/configuration/patterns) for more details.
        
        While you can create your own patterns, you can also leverage several patterns that are
        [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternList`
    </dd>
</dl>




---

#### `ignoreWords` {#settings-ignorewords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be ignored. An ignored word will not show up as an error, even if it is
        also in the `flagWords`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `import` {#settings-import}


<dl>
    
    <dt>Description</dt>
    <dd>
        Allows this configuration to inherit configuration for one or more other files.
        
        See [Importing / Extending Configuration](https://cspell.org/configuration/imports/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `FsPath`<br />`FsPath[]`
    </dd>
</dl>




---

#### `includeRegExpList` {#settings-includeregexplist}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of regular expression patterns or defined pattern names to match for spell checking.
        
        If this property is defined, only text matching the included patterns will be checked.
        
        While you can create your own patterns, you can also leverage several patterns that are
        [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternList`
    </dd>
</dl>




---

#### `language` {#settings-language}


<dl>
    
    <dt>Description</dt>
    <dd>
        Current active spelling language. This specifies the language locale to use in choosing the
        general dictionary.
        
        For example:
        
        - "en-GB" for British English.
        - "en,nl" to enable both English and Dutch.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LocaleId`
    </dd>
</dl>




---

#### `languageId` {#settings-languageid}


<dl>
    
    <dt>Description</dt>
    <dd>
        Forces the spell checker to assume a give language id. Used mainly as an Override.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `MatchingFileType`
    </dd>
</dl>




---

#### `languageSettings` {#settings-languagesettings}


<dl>
    
    <dt>Description</dt>
    <dd>
        Additional settings for individual languages.
        
        See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LanguageSetting[]`
    </dd>
</dl>




---

#### `loadDefaultConfiguration` {#settings-loaddefaultconfiguration}


<dl>
    
    <dt>Description</dt>
    <dd>
        By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
        will prevent ALL default configuration from being loaded.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `maxDuplicateProblems` {#settings-maxduplicateproblems}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum number of times the same word can be flagged as an error in a file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `maxNumberOfProblems` {#settings-maxnumberofproblems}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum number of problems to report in a file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `minWordLength` {#settings-minwordlength}


<dl>
    
    <dt>Description</dt>
    <dd>
        The minimum length of a word before checking it against a dictionary.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `name` {#settings-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional name of configuration.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `noConfigSearch` {#settings-noconfigsearch}


<dl>
    
    <dt>Description</dt>
    <dd>
        Prevents searching for local configuration when checking individual documents.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `noSuggestDictionaries` {#settings-nosuggestdictionaries}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional list of dictionaries that will not be used for suggestions.
        Words in these dictionaries are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        one of these dictionaries, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryReference[]`
    </dd>
</dl>




---

#### `numSuggestions` {#settings-numsuggestions}


<dl>
    
    <dt>Description</dt>
    <dd>
        Number of suggestions to make.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `overrides` {#settings-overrides}


<dl>
    
    <dt>Description</dt>
    <dd>
        Overrides are used to apply settings for specific files in your project.
        
        For example:
        
        ```javascript
        "overrides": [
          // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
          {
            "filename": "**/{*.hrr,*.crr}",
            "languageId": "cpp"
          },
          // Force `*.txt` to use the Dutch dictionary (Dutch dictionary needs to be installed separately):
          {
            "language": "nl",
            "filename": "**/dutch/**/*.txt"
          }
        ]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `OverrideSettings[]`
    </dd>
</dl>




---

#### `patterns` {#settings-patterns}


<dl>
    
    <dt>Description</dt>
    <dd>
        Defines a list of patterns that can be used with the `ignoreRegExpList` and
        `includeRegExpList` options.
        
        For example:
        
        ```javascript
        "ignoreRegExpList": ["comments"],
        "patterns": [
          {
            "name": "comment-single-line",
            "pattern": "/#.*/g"
          },
          {
            "name": "comment-multi-line",
            "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
          },
          // You can also combine multiple named patterns into one single named pattern
          {
            "name": "comments",
            "pattern": ["comment-single-line", "comment-multi-line"]
          }
        ]
        ```
        Defines a list of patterns that can be used with the `ignoreRegExpList` and
        `includeRegExpList` options.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternDefinition[]`
    </dd>
</dl>




---

#### `pnpFiles` {#settings-pnpfiles}


<dl>
    
    <dt>Description</dt>
    <dd>
        The PnP files to search for. Note: `.mjs` files are not currently supported.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `readonly` {#settings-readonly}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that the configuration file should not be modified.
        This is used to prevent tools like the VS Code Spell Checker from
        modifying the file to add words and other configuration.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `reporters` {#settings-reporters}


<dl>
    
    <dt>Description</dt>
    <dd>
        Define which reports to use.
        `default` - is a special name for the default cli reporter.
        
        Examples:
        - `["default"]` - to use the default reporter
        - `["@cspell/cspell-json-reporter"]` - use the cspell JSON reporter.
        - `[["@cspell/cspell-json-reporter", { "outFile": "out.json" }]]`
        - `[ "default", ["@cspell/cspell-json-reporter", { "outFile": "out.json" }]]` - Use both the default reporter and the cspell-json-reporter.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReporterSettings[]`
    </dd>
</dl>




---

#### `showStatus` {#settings-showstatus}


<dl>
    
    <dt>Description</dt>
    <dd>
        Show status.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `spellCheckDelayMs` {#settings-spellcheckdelayms}


<dl>
    
    <dt>Description</dt>
    <dd>
        Delay in ms after a document has changed before checking it for spelling errors.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `suggestWords` {#settings-suggestwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        A list of suggested replacements for words.
        Suggested words provide a way to make preferred suggestions on word replacements.
        To hint at a preferred change, but not to require it.
        
        Format of `suggestWords`
        - Single suggestion (possible auto fix)
            - `word: suggestion`
            - `word->suggestion`
        - Multiple suggestions (not auto fixable)
           - `word: first, second, third`
           - `word->first, second, third`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `suggestionNumChanges` {#settings-suggestionnumchanges}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum number of changes allowed on a word to be considered a suggestions.
        
        For example, appending an `s` onto `example` -> `examples` is considered 1 change.
        
        Range: between 1 and 5.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `suggestionsTimeout` {#settings-suggestionstimeout}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum amount of time in milliseconds to generate suggestions for a word.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `useGitignore` {#settings-usegitignore}


<dl>
    
    <dt>Description</dt>
    <dd>
        Tells the spell checker to load `.gitignore` files and skip files that match the globs in the `.gitignore` files found.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `usePnP` {#settings-usepnp}


<dl>
    
    <dt>Description</dt>
    <dd>
        Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
        packages stored in the repository.
        
        When true, the spell checker will search up the directory structure for the existence
        of a PnP file and load it.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `userWords` {#settings-userwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        Words to add to global dictionary -- should only be in the user config file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `validateDirectives` {#settings-validatedirectives}


<dl>
    
    <dt>Description</dt>
    <dd>
        Verify that the in-document directives are correct.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `version` {#settings-version}


<dl>
    
    <dt>Description</dt>
    <dd>
        Configuration format version of the settings file.
        
        This controls how the settings in the configuration file behave.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Version`
    </dd>
</dl>




---

#### `words` {#settings-words}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be considered correct.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>





---

## CacheFormat {#cacheformat}


<dl>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>



## CacheSettings

| Field | Type | Description |
| --- | --- | --- |
| [cacheFormat](#cachesettings-cacheformat) | `CacheFormat` | Format of the cache file. | 
| [cacheLocation](#cachesettings-cachelocation) | `FSPathResolvable` | Path to the cache location. Can be a file or a directory. | 
| [cacheStrategy](#cachesettings-cachestrategy) | `CacheStrategy` | Strategy to use for detecting changed files, default: metadata | 
| [useCache](#cachesettings-usecache) | `boolean` | Store the results of processed files in order to only operate on the changed ones. | 


### CacheSettings Fields


---

#### `cacheFormat` {#cachesettings-cacheformat}


<dl>
    
    <dt>Description</dt>
    <dd>
        Format of the cache file.
        - `legacy` - use absolute paths in the cache file
        - `universal` - use a sharable format.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CacheFormat`
    </dd>
</dl>




---

#### `cacheLocation` {#cachesettings-cachelocation}


<dl>
    
    <dt>Description</dt>
    <dd>
        Path to the cache location. Can be a file or a directory.
        If none specified `.cspellcache` will be used.
        Relative paths are relative to the config file in which it
        is defined.
        
        A prefix of `${cwd}` is replaced with the current working directory.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `FSPathResolvable`
    </dd>
</dl>




---

#### `cacheStrategy` {#cachesettings-cachestrategy}


<dl>
    
    <dt>Description</dt>
    <dd>
        Strategy to use for detecting changed files, default: metadata
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CacheStrategy`
    </dd>
</dl>




---

#### `useCache` {#cachesettings-usecache}


<dl>
    
    <dt>Description</dt>
    <dd>
        Store the results of processed files in order to only operate on the changed ones.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>





---

## CacheStrategy {#cachestrategy}


<dl>
    
    <dt>Description</dt>
    <dd>
        The Strategy to use to detect if a file has changed.
        - `metadata` - uses the file system timestamp and size to detect changes (fastest).
        - `content` - uses a hash of the file content to check file changes (slower - more accurate).
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## CharacterSet {#characterset}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is a set of characters that can include `-` or `|`
        - `-` - indicates a range of characters: `a-c` => `abc`
        - `|` - is a group separator, indicating that the characters on either side
           are not related.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>



## CharacterSetCosts

| Field | Type | Description |
| --- | --- | --- |
| [characters](#charactersetcosts-characters) | `CharacterSet` | This is a set of characters that can include `-` or `|` | 
| [cost](#charactersetcosts-cost) | `number` | the cost to insert / delete / replace / swap the characters in a group | 
| [penalty](#charactersetcosts-penalty) | `number` | The penalty cost to apply if the accent is used. | 


### CharacterSetCosts Fields


---

#### `characters` {#charactersetcosts-characters}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is a set of characters that can include `-` or `|`
        - `-` - indicates a range of characters: `a-c` => `abc`
        - `|` - is a group separator, indicating that the characters on either side
           are not related.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CharacterSet`
    </dd>
</dl>




---

#### `cost` {#charactersetcosts-cost}


<dl>
    
    <dt>Description</dt>
    <dd>
        the cost to insert / delete / replace / swap the characters in a group
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `penalty` {#charactersetcosts-penalty}


<dl>
    
    <dt>Description</dt>
    <dd>
        The penalty cost to apply if the accent is used.
        This is used to discourage
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>



## CostMapDefInsDel

| Field | Type | Description |
| --- | --- | --- |
| [description](#costmapdefinsdel-description) | `string` | A description to describe the purpose of the map. | 
| [insDel](#costmapdefinsdel-insdel) | `number` | The cost to insert/delete one of the substrings in the map. Note: insert/delete costs are symmetrical. | 
| [map](#costmapdefinsdel-map) | `string` | The set of substrings to map, these are generally single character strings. | 
| [penalty](#costmapdefinsdel-penalty) | `number` | Add a penalty to the final cost. | 
| [replace](#costmapdefinsdel-replace) | `number` | The cost to replace of of the substrings in the map with another substring in the map. | 
| [swap](#costmapdefinsdel-swap) | `number` | The cost to swap two adjacent substrings found in the map. | 


### CostMapDefInsDel Fields


---

#### `description` {#costmapdefinsdel-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        A description to describe the purpose of the map.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `insDel` {#costmapdefinsdel-insdel}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to insert/delete one of the substrings in the map. Note: insert/delete costs are symmetrical.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `map` {#costmapdefinsdel-map}


<dl>
    
    <dt>Description</dt>
    <dd>
        The set of substrings to map, these are generally single character strings.
        
        Multiple sets can be defined by using a `|` to separate them.
        
        Example: `"eéê|aåá"` contains two different sets.
        
        To add a multi-character substring use `()`.
        
        Example: `"f(ph)(gh)"` results in the following set: `f`, `ph`, `gh`.
        
        - To match the beginning of a word, use `^`: `"(^I)""`.
        - To match the end of a word, use `$`: `"(e$)(ing$)"`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `penalty` {#costmapdefinsdel-penalty}


<dl>
    
    <dt>Description</dt>
    <dd>
        Add a penalty to the final cost.
        This is used to discourage certain suggestions.
        
        Example:
        ```yaml
        # Match adding/removing `-` to the end of a word.
        map: "$(-$)"
        replace: 50
        penalty: 100
        ```
        
        This makes adding a `-` to the end of a word more expensive.
        
        Think of it as taking the toll way for speed but getting the bill later.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `replace` {#costmapdefinsdel-replace}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to replace of of the substrings in the map with another substring in the map.
        Example: Map['a', 'i']
        This would be the cost to substitute `a` with `i`: Like `bat` to `bit` or the reverse.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `swap` {#costmapdefinsdel-swap}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to swap two adjacent substrings found in the map.
        Example: Map['e', 'i']
        This represents the cost to change `ei` to `ie` or the reverse.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>



## CostMapDefReplace

| Field | Type | Description |
| --- | --- | --- |
| [description](#costmapdefreplace-description) | `string` | A description to describe the purpose of the map. | 
| [insDel](#costmapdefreplace-insdel) | `number` | The cost to insert/delete one of the substrings in the map. Note: insert/delete costs are symmetrical. | 
| [map](#costmapdefreplace-map) | `string` | The set of substrings to map, these are generally single character strings. | 
| [penalty](#costmapdefreplace-penalty) | `number` | Add a penalty to the final cost. | 
| [replace](#costmapdefreplace-replace) | `number` | The cost to replace of of the substrings in the map with another substring in the map. | 
| [swap](#costmapdefreplace-swap) | `number` | The cost to swap two adjacent substrings found in the map. | 


### CostMapDefReplace Fields


---

#### `description` {#costmapdefreplace-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        A description to describe the purpose of the map.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `insDel` {#costmapdefreplace-insdel}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to insert/delete one of the substrings in the map. Note: insert/delete costs are symmetrical.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `map` {#costmapdefreplace-map}


<dl>
    
    <dt>Description</dt>
    <dd>
        The set of substrings to map, these are generally single character strings.
        
        Multiple sets can be defined by using a `|` to separate them.
        
        Example: `"eéê|aåá"` contains two different sets.
        
        To add a multi-character substring use `()`.
        
        Example: `"f(ph)(gh)"` results in the following set: `f`, `ph`, `gh`.
        
        - To match the beginning of a word, use `^`: `"(^I)""`.
        - To match the end of a word, use `$`: `"(e$)(ing$)"`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `penalty` {#costmapdefreplace-penalty}


<dl>
    
    <dt>Description</dt>
    <dd>
        Add a penalty to the final cost.
        This is used to discourage certain suggestions.
        
        Example:
        ```yaml
        # Match adding/removing `-` to the end of a word.
        map: "$(-$)"
        replace: 50
        penalty: 100
        ```
        
        This makes adding a `-` to the end of a word more expensive.
        
        Think of it as taking the toll way for speed but getting the bill later.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `replace` {#costmapdefreplace-replace}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to replace of of the substrings in the map with another substring in the map.
        Example: Map['a', 'i']
        This would be the cost to substitute `a` with `i`: Like `bat` to `bit` or the reverse.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `swap` {#costmapdefreplace-swap}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to swap two adjacent substrings found in the map.
        Example: Map['e', 'i']
        This represents the cost to change `ei` to `ie` or the reverse.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>



## CostMapDefSwap

| Field | Type | Description |
| --- | --- | --- |
| [description](#costmapdefswap-description) | `string` | A description to describe the purpose of the map. | 
| [insDel](#costmapdefswap-insdel) | `number` | The cost to insert/delete one of the substrings in the map. Note: insert/delete costs are symmetrical. | 
| [map](#costmapdefswap-map) | `string` | The set of substrings to map, these are generally single character strings. | 
| [penalty](#costmapdefswap-penalty) | `number` | Add a penalty to the final cost. | 
| [replace](#costmapdefswap-replace) | `number` | The cost to replace of of the substrings in the map with another substring in the map. | 
| [swap](#costmapdefswap-swap) | `number` | The cost to swap two adjacent substrings found in the map. | 


### CostMapDefSwap Fields


---

#### `description` {#costmapdefswap-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        A description to describe the purpose of the map.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `insDel` {#costmapdefswap-insdel}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to insert/delete one of the substrings in the map. Note: insert/delete costs are symmetrical.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `map` {#costmapdefswap-map}


<dl>
    
    <dt>Description</dt>
    <dd>
        The set of substrings to map, these are generally single character strings.
        
        Multiple sets can be defined by using a `|` to separate them.
        
        Example: `"eéê|aåá"` contains two different sets.
        
        To add a multi-character substring use `()`.
        
        Example: `"f(ph)(gh)"` results in the following set: `f`, `ph`, `gh`.
        
        - To match the beginning of a word, use `^`: `"(^I)""`.
        - To match the end of a word, use `$`: `"(e$)(ing$)"`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `penalty` {#costmapdefswap-penalty}


<dl>
    
    <dt>Description</dt>
    <dd>
        Add a penalty to the final cost.
        This is used to discourage certain suggestions.
        
        Example:
        ```yaml
        # Match adding/removing `-` to the end of a word.
        map: "$(-$)"
        replace: 50
        penalty: 100
        ```
        
        This makes adding a `-` to the end of a word more expensive.
        
        Think of it as taking the toll way for speed but getting the bill later.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `replace` {#costmapdefswap-replace}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to replace of of the substrings in the map with another substring in the map.
        Example: Map['a', 'i']
        This would be the cost to substitute `a` with `i`: Like `bat` to `bit` or the reverse.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `swap` {#costmapdefswap-swap}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to swap two adjacent substrings found in the map.
        Example: Map['e', 'i']
        This represents the cost to change `ei` to `ie` or the reverse.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>





---

## CustomDictionaryPath {#customdictionarypath}


<dl>
    
    <dt>Description</dt>
    <dd>
        A File System Path to a dictionary file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `FsDictionaryPath`
    </dd>
</dl>





---

## CustomDictionaryScope {#customdictionaryscope}


<dl>
    
    <dt>Description</dt>
    <dd>
        Specifies the scope of a dictionary.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## DictionaryDefinition {#dictionarydefinition}


<dl>
    
    <dt>Type</dt>
    <dd>
        `DictionaryDefinitionPreferred`<br />`DictionaryDefinitionCustom`<br />`DictionaryDefinitionAugmented`<br />`DictionaryDefinitionInline`<br />`DictionaryDefinitionAlternate`
    </dd>
</dl>



## DictionaryDefinitionAlternate

| Field | Type | Description |
| --- | --- | --- |
| [description](#dictionarydefinitionalternate-description) | `string` | Optional description. | 
| [file](#dictionarydefinitionalternate-file) | `DictionaryPath` | Path to the file, only for legacy dictionary definitions. | 
| [name](#dictionarydefinitionalternate-name) | `DictionaryId` | This is the name of a dictionary. | 
| [noSuggest](#dictionarydefinitionalternate-nosuggest) | `boolean` | Indicate that suggestions should not come from this dictionary. | 
| [repMap](#dictionarydefinitionalternate-repmap) | `ReplaceMap` | Replacement pairs. | 
| [type](#dictionarydefinitionalternate-type) | `DictionaryFileTypes` | Type of file: | 
| [useCompounds](#dictionarydefinitionalternate-usecompounds) | `boolean` | Use Compounds. | 


### DictionaryDefinitionAlternate Fields


---

#### `description` {#dictionarydefinitionalternate-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `file` {#dictionarydefinitionalternate-file}


<dl>
    
    <dt>Description</dt>
    <dd>
        Path to the file, only for legacy dictionary definitions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryPath`
    </dd>
</dl>




---

#### `name` {#dictionarydefinitionalternate-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>




---

#### `noSuggest` {#dictionarydefinitionalternate-nosuggest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that suggestions should not come from this dictionary.
        Words in this dictionary are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        this dictionary, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `repMap` {#dictionarydefinitionalternate-repmap}


<dl>
    
    <dt>Description</dt>
    <dd>
        Replacement pairs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReplaceMap`
    </dd>
</dl>




---

#### `type` {#dictionarydefinitionalternate-type}


<dl>
    
    <dt>Description</dt>
    <dd>
        Type of file:
        - S - single word per line,
        - W - each line can contain one or more words separated by space,
        - C - each line is treated like code (Camel Case is allowed).
        
        Default is S.
        
        C is the slowest to load due to the need to split each line based upon code splitting rules.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryFileTypes`
    </dd>
</dl>




---

#### `useCompounds` {#dictionarydefinitionalternate-usecompounds}


<dl>
    
    <dt>Description</dt>
    <dd>
        Use Compounds.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>



## DictionaryDefinitionAugmented

| Field | Type | Description |
| --- | --- | --- |
| [description](#dictionarydefinitionaugmented-description) | `string` | Optional description. | 
| [dictionaryInformation](#dictionarydefinitionaugmented-dictionaryinformation) | `DictionaryInformation` |  | 
| [name](#dictionarydefinitionaugmented-name) | `DictionaryId` | This is the name of a dictionary. | 
| [noSuggest](#dictionarydefinitionaugmented-nosuggest) | `boolean` | Indicate that suggestions should not come from this dictionary. | 
| [path](#dictionarydefinitionaugmented-path) | `DictionaryPath` | Path to the file. | 
| [repMap](#dictionarydefinitionaugmented-repmap) | `ReplaceMap` | Replacement pairs. | 
| [type](#dictionarydefinitionaugmented-type) | `DictionaryFileTypes` | Type of file: | 
| [useCompounds](#dictionarydefinitionaugmented-usecompounds) | `boolean` | Use Compounds. | 


### DictionaryDefinitionAugmented Fields


---

#### `description` {#dictionarydefinitionaugmented-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `dictionaryInformation` {#dictionarydefinitionaugmented-dictionaryinformation}


<dl>
    
    <dt>Type</dt>
    <dd>
        `DictionaryInformation`
    </dd>
</dl>




---

#### `name` {#dictionarydefinitionaugmented-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>




---

#### `noSuggest` {#dictionarydefinitionaugmented-nosuggest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that suggestions should not come from this dictionary.
        Words in this dictionary are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        this dictionary, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `path` {#dictionarydefinitionaugmented-path}


<dl>
    
    <dt>Description</dt>
    <dd>
        Path to the file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryPath`
    </dd>
</dl>




---

#### `repMap` {#dictionarydefinitionaugmented-repmap}


<dl>
    
    <dt>Description</dt>
    <dd>
        Replacement pairs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReplaceMap`
    </dd>
</dl>




---

#### `type` {#dictionarydefinitionaugmented-type}


<dl>
    
    <dt>Description</dt>
    <dd>
        Type of file:
        - S - single word per line,
        - W - each line can contain one or more words separated by space,
        - C - each line is treated like code (Camel Case is allowed).
        
        Default is S.
        
        C is the slowest to load due to the need to split each line based upon code splitting rules.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryFileTypes`
    </dd>
</dl>




---

#### `useCompounds` {#dictionarydefinitionaugmented-usecompounds}


<dl>
    
    <dt>Description</dt>
    <dd>
        Use Compounds.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>



## DictionaryDefinitionCustom

| Field | Type | Description |
| --- | --- | --- |
| [addWords](#dictionarydefinitioncustom-addwords) | `boolean` | When `true`, let's the spell checker know that words can be added to this dictionary. | 
| [description](#dictionarydefinitioncustom-description) | `string` | Optional description. | 
| [name](#dictionarydefinitioncustom-name) | `DictionaryId` | This is the name of a dictionary. | 
| [noSuggest](#dictionarydefinitioncustom-nosuggest) | `boolean` | Indicate that suggestions should not come from this dictionary. | 
| [path](#dictionarydefinitioncustom-path) | `CustomDictionaryPath` | Path to custom dictionary text file. | 
| [repMap](#dictionarydefinitioncustom-repmap) | `ReplaceMap` | Replacement pairs. | 
| [scope](#dictionarydefinitioncustom-scope) | `CustomDictionaryScope`<br />`CustomDictionaryScope[]` | Defines the scope for when words will be added to the dictionary. | 
| [type](#dictionarydefinitioncustom-type) | `DictionaryFileTypes` | Type of file: | 
| [useCompounds](#dictionarydefinitioncustom-usecompounds) | `boolean` | Use Compounds. | 


### DictionaryDefinitionCustom Fields


---

#### `addWords` {#dictionarydefinitioncustom-addwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        When `true`, let's the spell checker know that words can be added to this dictionary.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `description` {#dictionarydefinitioncustom-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `name` {#dictionarydefinitioncustom-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>




---

#### `noSuggest` {#dictionarydefinitioncustom-nosuggest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that suggestions should not come from this dictionary.
        Words in this dictionary are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        this dictionary, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `path` {#dictionarydefinitioncustom-path}


<dl>
    
    <dt>Description</dt>
    <dd>
        Path to custom dictionary text file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CustomDictionaryPath`
    </dd>
</dl>




---

#### `repMap` {#dictionarydefinitioncustom-repmap}


<dl>
    
    <dt>Description</dt>
    <dd>
        Replacement pairs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReplaceMap`
    </dd>
</dl>




---

#### `scope` {#dictionarydefinitioncustom-scope}


<dl>
    
    <dt>Description</dt>
    <dd>
        Defines the scope for when words will be added to the dictionary.
        
        Scope values: `user`, `workspace`, `folder`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CustomDictionaryScope`<br />`CustomDictionaryScope[]`
    </dd>
</dl>




---

#### `type` {#dictionarydefinitioncustom-type}


<dl>
    
    <dt>Description</dt>
    <dd>
        Type of file:
        - S - single word per line,
        - W - each line can contain one or more words separated by space,
        - C - each line is treated like code (Camel Case is allowed).
        
        Default is S.
        
        C is the slowest to load due to the need to split each line based upon code splitting rules.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryFileTypes`
    </dd>
</dl>




---

#### `useCompounds` {#dictionarydefinitioncustom-usecompounds}


<dl>
    
    <dt>Description</dt>
    <dd>
        Use Compounds.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>





---

## DictionaryDefinitionInline {#dictionarydefinitioninline}


<dl>
    
    <dt>Description</dt>
    <dd>
        Inline Dictionary Definitions
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryDefinitionInlineWords`<br />`DictionaryDefinitionInlineIgnoreWords`<br />`DictionaryDefinitionInlineFlagWords`
    </dd>
</dl>



## DictionaryDefinitionInlineFlagWords

| Field | Type | Description |
| --- | --- | --- |
| [description](#dictionarydefinitioninlineflagwords-description) | `string` | Optional description. | 
| [flagWords](#dictionarydefinitioninlineflagwords-flagwords) | `string[]` | List of words to always be considered incorrect. Words found in `flagWords` override `words`. | 
| [ignoreWords](#dictionarydefinitioninlineflagwords-ignorewords) | `string[]` | List of words to be ignored. An ignored word will not show up as an error, even if it is | 
| [name](#dictionarydefinitioninlineflagwords-name) | `DictionaryId` | This is the name of a dictionary. | 
| [noSuggest](#dictionarydefinitioninlineflagwords-nosuggest) | `boolean` | Indicate that suggestions should not come from this dictionary. | 
| [repMap](#dictionarydefinitioninlineflagwords-repmap) | `ReplaceMap` | Replacement pairs. | 
| [suggestWords](#dictionarydefinitioninlineflagwords-suggestwords) | `string[]` | A list of suggested replacements for words. | 
| [type](#dictionarydefinitioninlineflagwords-type) | `DictionaryFileTypes` | Type of file: | 
| [useCompounds](#dictionarydefinitioninlineflagwords-usecompounds) | `boolean` | Use Compounds. | 
| [words](#dictionarydefinitioninlineflagwords-words) | `string[]` | List of words to be considered correct. | 


### DictionaryDefinitionInlineFlagWords Fields


---

#### `description` {#dictionarydefinitioninlineflagwords-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `flagWords` {#dictionarydefinitioninlineflagwords-flagwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to always be considered incorrect. Words found in `flagWords` override `words`.
        
        Format of `flagWords`
        - single word entry - `word`
        - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
        
        Example:
        ```ts
        "flagWords": [
          "color: colour",
          "incase: in case, encase",
          "canot->cannot",
          "cancelled->canceled"
        ]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `ignoreWords` {#dictionarydefinitioninlineflagwords-ignorewords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be ignored. An ignored word will not show up as an error, even if it is
        also in the `flagWords`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `name` {#dictionarydefinitioninlineflagwords-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>




---

#### `noSuggest` {#dictionarydefinitioninlineflagwords-nosuggest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that suggestions should not come from this dictionary.
        Words in this dictionary are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        this dictionary, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `repMap` {#dictionarydefinitioninlineflagwords-repmap}


<dl>
    
    <dt>Description</dt>
    <dd>
        Replacement pairs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReplaceMap`
    </dd>
</dl>




---

#### `suggestWords` {#dictionarydefinitioninlineflagwords-suggestwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        A list of suggested replacements for words.
        Suggested words provide a way to make preferred suggestions on word replacements.
        To hint at a preferred change, but not to require it.
        
        Format of `suggestWords`
        - Single suggestion (possible auto fix)
            - `word: suggestion`
            - `word->suggestion`
        - Multiple suggestions (not auto fixable)
           - `word: first, second, third`
           - `word->first, second, third`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `type` {#dictionarydefinitioninlineflagwords-type}


<dl>
    
    <dt>Description</dt>
    <dd>
        Type of file:
        - S - single word per line,
        - W - each line can contain one or more words separated by space,
        - C - each line is treated like code (Camel Case is allowed).
        
        Default is S.
        
        C is the slowest to load due to the need to split each line based upon code splitting rules.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryFileTypes`
    </dd>
</dl>




---

#### `useCompounds` {#dictionarydefinitioninlineflagwords-usecompounds}


<dl>
    
    <dt>Description</dt>
    <dd>
        Use Compounds.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `words` {#dictionarydefinitioninlineflagwords-words}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be considered correct.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>



## DictionaryDefinitionInlineIgnoreWords

| Field | Type | Description |
| --- | --- | --- |
| [description](#dictionarydefinitioninlineignorewords-description) | `string` | Optional description. | 
| [flagWords](#dictionarydefinitioninlineignorewords-flagwords) | `string[]` | List of words to always be considered incorrect. Words found in `flagWords` override `words`. | 
| [ignoreWords](#dictionarydefinitioninlineignorewords-ignorewords) | `string[]` | List of words to be ignored. An ignored word will not show up as an error, even if it is | 
| [name](#dictionarydefinitioninlineignorewords-name) | `DictionaryId` | This is the name of a dictionary. | 
| [noSuggest](#dictionarydefinitioninlineignorewords-nosuggest) | `boolean` | Indicate that suggestions should not come from this dictionary. | 
| [repMap](#dictionarydefinitioninlineignorewords-repmap) | `ReplaceMap` | Replacement pairs. | 
| [suggestWords](#dictionarydefinitioninlineignorewords-suggestwords) | `string[]` | A list of suggested replacements for words. | 
| [type](#dictionarydefinitioninlineignorewords-type) | `DictionaryFileTypes` | Type of file: | 
| [useCompounds](#dictionarydefinitioninlineignorewords-usecompounds) | `boolean` | Use Compounds. | 
| [words](#dictionarydefinitioninlineignorewords-words) | `string[]` | List of words to be considered correct. | 


### DictionaryDefinitionInlineIgnoreWords Fields


---

#### `description` {#dictionarydefinitioninlineignorewords-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `flagWords` {#dictionarydefinitioninlineignorewords-flagwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to always be considered incorrect. Words found in `flagWords` override `words`.
        
        Format of `flagWords`
        - single word entry - `word`
        - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
        
        Example:
        ```ts
        "flagWords": [
          "color: colour",
          "incase: in case, encase",
          "canot->cannot",
          "cancelled->canceled"
        ]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `ignoreWords` {#dictionarydefinitioninlineignorewords-ignorewords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be ignored. An ignored word will not show up as an error, even if it is
        also in the `flagWords`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `name` {#dictionarydefinitioninlineignorewords-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>




---

#### `noSuggest` {#dictionarydefinitioninlineignorewords-nosuggest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that suggestions should not come from this dictionary.
        Words in this dictionary are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        this dictionary, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `repMap` {#dictionarydefinitioninlineignorewords-repmap}


<dl>
    
    <dt>Description</dt>
    <dd>
        Replacement pairs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReplaceMap`
    </dd>
</dl>




---

#### `suggestWords` {#dictionarydefinitioninlineignorewords-suggestwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        A list of suggested replacements for words.
        Suggested words provide a way to make preferred suggestions on word replacements.
        To hint at a preferred change, but not to require it.
        
        Format of `suggestWords`
        - Single suggestion (possible auto fix)
            - `word: suggestion`
            - `word->suggestion`
        - Multiple suggestions (not auto fixable)
           - `word: first, second, third`
           - `word->first, second, third`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `type` {#dictionarydefinitioninlineignorewords-type}


<dl>
    
    <dt>Description</dt>
    <dd>
        Type of file:
        - S - single word per line,
        - W - each line can contain one or more words separated by space,
        - C - each line is treated like code (Camel Case is allowed).
        
        Default is S.
        
        C is the slowest to load due to the need to split each line based upon code splitting rules.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryFileTypes`
    </dd>
</dl>




---

#### `useCompounds` {#dictionarydefinitioninlineignorewords-usecompounds}


<dl>
    
    <dt>Description</dt>
    <dd>
        Use Compounds.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `words` {#dictionarydefinitioninlineignorewords-words}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be considered correct.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>



## DictionaryDefinitionInlineWords

| Field | Type | Description |
| --- | --- | --- |
| [description](#dictionarydefinitioninlinewords-description) | `string` | Optional description. | 
| [flagWords](#dictionarydefinitioninlinewords-flagwords) | `string[]` | List of words to always be considered incorrect. Words found in `flagWords` override `words`. | 
| [ignoreWords](#dictionarydefinitioninlinewords-ignorewords) | `string[]` | List of words to be ignored. An ignored word will not show up as an error, even if it is | 
| [name](#dictionarydefinitioninlinewords-name) | `DictionaryId` | This is the name of a dictionary. | 
| [noSuggest](#dictionarydefinitioninlinewords-nosuggest) | `boolean` | Indicate that suggestions should not come from this dictionary. | 
| [repMap](#dictionarydefinitioninlinewords-repmap) | `ReplaceMap` | Replacement pairs. | 
| [suggestWords](#dictionarydefinitioninlinewords-suggestwords) | `string[]` | A list of suggested replacements for words. | 
| [type](#dictionarydefinitioninlinewords-type) | `DictionaryFileTypes` | Type of file: | 
| [useCompounds](#dictionarydefinitioninlinewords-usecompounds) | `boolean` | Use Compounds. | 
| [words](#dictionarydefinitioninlinewords-words) | `string[]` | List of words to be considered correct. | 


### DictionaryDefinitionInlineWords Fields


---

#### `description` {#dictionarydefinitioninlinewords-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `flagWords` {#dictionarydefinitioninlinewords-flagwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to always be considered incorrect. Words found in `flagWords` override `words`.
        
        Format of `flagWords`
        - single word entry - `word`
        - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
        
        Example:
        ```ts
        "flagWords": [
          "color: colour",
          "incase: in case, encase",
          "canot->cannot",
          "cancelled->canceled"
        ]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `ignoreWords` {#dictionarydefinitioninlinewords-ignorewords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be ignored. An ignored word will not show up as an error, even if it is
        also in the `flagWords`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `name` {#dictionarydefinitioninlinewords-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>




---

#### `noSuggest` {#dictionarydefinitioninlinewords-nosuggest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that suggestions should not come from this dictionary.
        Words in this dictionary are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        this dictionary, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `repMap` {#dictionarydefinitioninlinewords-repmap}


<dl>
    
    <dt>Description</dt>
    <dd>
        Replacement pairs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReplaceMap`
    </dd>
</dl>




---

#### `suggestWords` {#dictionarydefinitioninlinewords-suggestwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        A list of suggested replacements for words.
        Suggested words provide a way to make preferred suggestions on word replacements.
        To hint at a preferred change, but not to require it.
        
        Format of `suggestWords`
        - Single suggestion (possible auto fix)
            - `word: suggestion`
            - `word->suggestion`
        - Multiple suggestions (not auto fixable)
           - `word: first, second, third`
           - `word->first, second, third`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `type` {#dictionarydefinitioninlinewords-type}


<dl>
    
    <dt>Description</dt>
    <dd>
        Type of file:
        - S - single word per line,
        - W - each line can contain one or more words separated by space,
        - C - each line is treated like code (Camel Case is allowed).
        
        Default is S.
        
        C is the slowest to load due to the need to split each line based upon code splitting rules.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryFileTypes`
    </dd>
</dl>




---

#### `useCompounds` {#dictionarydefinitioninlinewords-usecompounds}


<dl>
    
    <dt>Description</dt>
    <dd>
        Use Compounds.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `words` {#dictionarydefinitioninlinewords-words}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be considered correct.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>



## DictionaryDefinitionPreferred

| Field | Type | Description |
| --- | --- | --- |
| [description](#dictionarydefinitionpreferred-description) | `string` | Optional description. | 
| [name](#dictionarydefinitionpreferred-name) | `DictionaryId` | This is the name of a dictionary. | 
| [noSuggest](#dictionarydefinitionpreferred-nosuggest) | `boolean` | Indicate that suggestions should not come from this dictionary. | 
| [path](#dictionarydefinitionpreferred-path) | `DictionaryPath` | Path to the file. | 
| [repMap](#dictionarydefinitionpreferred-repmap) | `ReplaceMap` | Replacement pairs. | 
| [type](#dictionarydefinitionpreferred-type) | `DictionaryFileTypes` | Type of file: | 
| [useCompounds](#dictionarydefinitionpreferred-usecompounds) | `boolean` | Use Compounds. | 


### DictionaryDefinitionPreferred Fields


---

#### `description` {#dictionarydefinitionpreferred-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `name` {#dictionarydefinitionpreferred-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>




---

#### `noSuggest` {#dictionarydefinitionpreferred-nosuggest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Indicate that suggestions should not come from this dictionary.
        Words in this dictionary are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        this dictionary, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `path` {#dictionarydefinitionpreferred-path}


<dl>
    
    <dt>Description</dt>
    <dd>
        Path to the file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryPath`
    </dd>
</dl>




---

#### `repMap` {#dictionarydefinitionpreferred-repmap}


<dl>
    
    <dt>Description</dt>
    <dd>
        Replacement pairs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReplaceMap`
    </dd>
</dl>




---

#### `type` {#dictionarydefinitionpreferred-type}


<dl>
    
    <dt>Description</dt>
    <dd>
        Type of file:
        - S - single word per line,
        - W - each line can contain one or more words separated by space,
        - C - each line is treated like code (Camel Case is allowed).
        
        Default is S.
        
        C is the slowest to load due to the need to split each line based upon code splitting rules.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryFileTypes`
    </dd>
</dl>




---

#### `useCompounds` {#dictionarydefinitionpreferred-usecompounds}


<dl>
    
    <dt>Description</dt>
    <dd>
        Use Compounds.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>





---

## DictionaryFileTypes {#dictionaryfiletypes}


<dl>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## DictionaryId {#dictionaryid}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the name of a dictionary.
        
        Name Format:
        - Must contain at least 1 number or letter.
        - Spaces are allowed.
        - Leading and trailing space will be removed.
        - Names ARE case-sensitive.
        - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>



## DictionaryInformation

| Field | Type | Description |
| --- | --- | --- |
| [accents](#dictionaryinformation-accents) | `CharacterSet`<br />`CharacterSetCosts[]` | The accent characters. | 
| [adjustments](#dictionaryinformation-adjustments) | `PatternAdjustment[]` | A collection of patterns to test against the suggested words. | 
| [alphabet](#dictionaryinformation-alphabet) | `CharacterSet`<br />`CharacterSetCosts[]` | The alphabet to use. | 
| [costs](#dictionaryinformation-costs) | `EditCosts` | Define edit costs. | 
| [hunspellInformation](#dictionaryinformation-hunspellinformation) | `HunspellInformation` | Used by dictionary authors | 
| [ignore](#dictionaryinformation-ignore) | `CharacterSet` | An optional set of characters that can possibly be removed from a word before | 
| [locale](#dictionaryinformation-locale) | `string` | The locale of the dictionary. | 
| [suggestionEditCosts](#dictionaryinformation-suggestioneditcosts) | `SuggestionCostsDefs` | Used in making suggestions. The lower the value, the more likely the suggestion | 


### DictionaryInformation Fields


---

#### `accents` {#dictionaryinformation-accents}


<dl>
    
    <dt>Description</dt>
    <dd>
        The accent characters.
        
        Default: `"\u0300-\u0341"`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CharacterSet`<br />`CharacterSetCosts[]`
    </dd>
</dl>




---

#### `adjustments` {#dictionaryinformation-adjustments}


<dl>
    
    <dt>Description</dt>
    <dd>
        A collection of patterns to test against the suggested words.
        If the word matches the pattern, then the penalty is applied.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `PatternAdjustment[]`
    </dd>
</dl>




---

#### `alphabet` {#dictionaryinformation-alphabet}


<dl>
    
    <dt>Description</dt>
    <dd>
        The alphabet to use.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CharacterSet`<br />`CharacterSetCosts[]`
    </dd>
</dl>




---

#### `costs` {#dictionaryinformation-costs}


<dl>
    
    <dt>Description</dt>
    <dd>
        Define edit costs.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `EditCosts`
    </dd>
</dl>




---

#### `hunspellInformation` {#dictionaryinformation-hunspellinformation}


<dl>
    
    <dt>Description</dt>
    <dd>
        Used by dictionary authors
    </dd>
    
    <dt>Type</dt>
    <dd>
        `HunspellInformation`
    </dd>
</dl>




---

#### `ignore` {#dictionaryinformation-ignore}


<dl>
    
    <dt>Description</dt>
    <dd>
        An optional set of characters that can possibly be removed from a word before
        checking it.
        
        This is useful in languages like Arabic where Harakat accents are optional.
        
        Note: All matching characters are removed or none. Partial removal is not supported.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CharacterSet`
    </dd>
</dl>




---

#### `locale` {#dictionaryinformation-locale}


<dl>
    
    <dt>Description</dt>
    <dd>
        The locale of the dictionary.
        Example: `nl,nl-be`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `suggestionEditCosts` {#dictionaryinformation-suggestioneditcosts}


<dl>
    
    <dt>Description</dt>
    <dd>
        Used in making suggestions. The lower the value, the more likely the suggestion
        will be near the top of the suggestion list.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `SuggestionCostsDefs`
    </dd>
</dl>





---

## DictionaryNegRef {#dictionarynegref}


<dl>
    
    <dt>Description</dt>
    <dd>
        This a negative reference to a named dictionary.
        
        It is used to exclude or include a dictionary by name.
        
        The reference starts with 1 or more `!`.
        - `!<dictionary_name>` - Used to exclude the dictionary matching `<dictionary_name>`.
        - `!!<dictionary_name>` - Used to re-include a dictionary matching `<dictionary_name>`.
           Overrides `!<dictionary_name>`.
        - `!!!<dictionary_name>` - Used to exclude a dictionary matching `<dictionary_name>`.
           Overrides `!!<dictionary_name>`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## DictionaryPath {#dictionarypath}


<dl>
    
    <dt>Description</dt>
    <dd>
        A File System Path to a dictionary file.
        Pattern: `^.*\.(?:txt|trie|dic)(?:\.gz)?$`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## DictionaryRef {#dictionaryref}


<dl>
    
    <dt>Description</dt>
    <dd>
        This a reference to a named dictionary.
        It is expected to match the name of a dictionary.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryId`
    </dd>
</dl>





---

## DictionaryReference {#dictionaryreference}


<dl>
    
    <dt>Description</dt>
    <dd>
        Reference to a dictionary by name.
        One of:
        -  [DictionaryRef](#dictionaryref) 
        -  [DictionaryNegRef](#dictionarynegref)
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryRef`<br />`DictionaryNegRef`
    </dd>
</dl>



## EditCosts

| Field | Type | Description |
| --- | --- | --- |
| [accentCosts](#editcosts-accentcosts) | `number` | The cost to add / remove an accent | 
| [baseCost](#editcosts-basecost) | `number` | This is the base cost for making an edit. | 
| [capsCosts](#editcosts-capscosts) | `number` | The cost to change capitalization. | 
| [firstLetterPenalty](#editcosts-firstletterpenalty) | `number` | The extra cost incurred for changing the first letter of a word. | 
| [nonAlphabetCosts](#editcosts-nonalphabetcosts) | `number` | This is the cost for characters not in the alphabet. | 


### EditCosts Fields


---

#### `accentCosts` {#editcosts-accentcosts}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to add / remove an accent
        This should be very cheap, it helps with fixing accent issues.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `baseCost` {#editcosts-basecost}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the base cost for making an edit.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `capsCosts` {#editcosts-capscosts}


<dl>
    
    <dt>Description</dt>
    <dd>
        The cost to change capitalization.
        This should be very cheap, it helps with fixing capitalization issues.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `firstLetterPenalty` {#editcosts-firstletterpenalty}


<dl>
    
    <dt>Description</dt>
    <dd>
        The extra cost incurred for changing the first letter of a word.
        This value should be less than `100 - baseCost`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `nonAlphabetCosts` {#editcosts-nonalphabetcosts}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is the cost for characters not in the alphabet.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>





---

## FSPathResolvable {#fspathresolvable}


<dl>
    
    <dt>Description</dt>
    <dd>
        A File System Path.
        
        Special Properties:
        - `${cwd}` prefix - will be replaced with the current working directory.
        - Relative paths are relative to the configuration file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `FsPath`
    </dd>
</dl>





---

## FeatureEnableOnly {#featureenableonly}


<dl>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>



## Features

| Field | Type | Description |
| --- | --- | --- |
| [weighted-suggestions](#features-weighted-suggestions) | `FeatureEnableOnly` | Enable/disable using weighted suggestions. | 


### Features Fields


---

#### `weighted-suggestions` {#features-weighted-suggestions}


<dl>
    
    <dt>Description</dt>
    <dd>
        Enable/disable using weighted suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `FeatureEnableOnly`
    </dd>
</dl>





---

## FsDictionaryPath {#fsdictionarypath}


<dl>
    
    <dt>Description</dt>
    <dd>
        A File System Path. Relative paths are relative to the configuration file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## FsPath {#fspath}


<dl>
    
    <dt>Description</dt>
    <dd>
        A File System Path. Relative paths are relative to the configuration file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## Glob {#glob}


<dl>
    
    <dt>Description</dt>
    <dd>
        These are glob expressions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `SimpleGlob`
    </dd>
</dl>



## HunspellInformation

| Field | Type | Description |
| --- | --- | --- |
| [aff](#hunspellinformation-aff) | `string` | Selected Hunspell AFF content. | 
| [costs](#hunspellinformation-costs) | `object` | The costs to apply when using the hunspell settings | 


### HunspellInformation Fields


---

#### `aff` {#hunspellinformation-aff}


<dl>
    
    <dt>Description</dt>
    <dd>
        Selected Hunspell AFF content.
        The content must be UTF-8
        
        Sections:
        - TRY
        - MAP
        - REP
        - KEY
        - ICONV
        - OCONV
        
        Example:
        ```hunspell
        # Comment
        TRY aeistlunkodmrvpgjhäõbüoöfcwzxðqþ`
        MAP aàâäAÀÂÄ
        MAP eéèêëEÉÈÊË
        MAP iîïyIÎÏY
        MAP oôöOÔÖ
        MAP (IJ)(Ĳ)
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `costs` {#hunspellinformation-costs}


<dl>
    
    <dt>Description</dt>
    <dd>
        The costs to apply when using the hunspell settings
    </dd>
    
    <dt>Type</dt>
    <dd>
        `object`
    </dd>
</dl>





---

## LanguageId {#languageid}


<dl>
    
    <dt>Type</dt>
    <dd>
        `LanguageIdSingle`<br />`LanguageIdMultiple`<br />`LanguageIdMultipleNeg`
    </dd>
</dl>





---

## LanguageIdMultiple {#languageidmultiple}


<dl>
    
    <dt>Description</dt>
    <dd>
        This can be 'typescript,cpp,json,literal haskell', etc.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## LanguageIdMultipleNeg {#languageidmultipleneg}


<dl>
    
    <dt>Description</dt>
    <dd>
        This can be 'typescript,cpp,json,literal haskell', etc.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## LanguageIdSingle {#languageidsingle}


<dl>
    
    <dt>Description</dt>
    <dd>
        This can be '*', 'typescript', 'cpp', 'json', etc.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>



## LanguageSetting

| Field | Type | Description |
| --- | --- | --- |
| [allowCompoundWords](#languagesetting-allowcompoundwords) | `boolean` | True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details. | 
| [caseSensitive](#languagesetting-casesensitive) | `boolean` | Determines if words must match case and accent rules. | 
| [description](#languagesetting-description) | `string` | Optional description of configuration. | 
| [dictionaries](#languagesetting-dictionaries) | `DictionaryReference[]` | Optional list of dictionaries to use. Each entry should match the name of the dictionary. | 
| [dictionaryDefinitions](#languagesetting-dictionarydefinitions) | `DictionaryDefinition[]` | Define additional available dictionaries. | 
| [enabled](#languagesetting-enabled) | `boolean` | Is the spell checker enabled. | 
| [flagWords](#languagesetting-flagwords) | `string[]` | List of words to always be considered incorrect. Words found in `flagWords` override `words`. | 
| [id](#languagesetting-id) | `string` | Optional identifier. | 
| [ignoreRegExpList](#languagesetting-ignoreregexplist) | `RegExpPatternList` | List of regular expression patterns or pattern names to exclude from spell checking. | 
| [ignoreWords](#languagesetting-ignorewords) | `string[]` | List of words to be ignored. An ignored word will not show up as an error, even if it is | 
| [includeRegExpList](#languagesetting-includeregexplist) | `RegExpPatternList` | List of regular expression patterns or defined pattern names to match for spell checking. | 
| [languageId](#languagesetting-languageid) | `MatchingFileType` | The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages. | 
| [local](#languagesetting-local) | `LocaleId`<br />`LocaleId[]` | Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales. | 
| [locale](#languagesetting-locale) | `LocaleId`<br />`LocaleId[]` | The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales. | 
| [name](#languagesetting-name) | `string` | Optional name of configuration. | 
| [noSuggestDictionaries](#languagesetting-nosuggestdictionaries) | `DictionaryReference[]` | Optional list of dictionaries that will not be used for suggestions. | 
| [patterns](#languagesetting-patterns) | `RegExpPatternDefinition[]` | Defines a list of patterns that can be used with the `ignoreRegExpList` and | 
| [suggestWords](#languagesetting-suggestwords) | `string[]` | A list of suggested replacements for words. | 
| [words](#languagesetting-words) | `string[]` | List of words to be considered correct. | 


### LanguageSetting Fields


---

#### `allowCompoundWords` {#languagesetting-allowcompoundwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `caseSensitive` {#languagesetting-casesensitive}


<dl>
    
    <dt>Description</dt>
    <dd>
        Determines if words must match case and accent rules.
        
        - `false` - Case is ignored and accents can be missing on the entire word.
          Incorrect accents or partially missing accents will be marked as incorrect.
        - `true` - Case and accents are enforced.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `description` {#languagesetting-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description of configuration.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `dictionaries` {#languagesetting-dictionaries}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional list of dictionaries to use. Each entry should match the name of the dictionary.
        
        To remove a dictionary from the list, add `!` before the name.
        
        For example, `!typescript` will turn off the dictionary with the name `typescript`.
        
        See the [Dictionaries](https://cspell.org/docs/dictionaries/)
        and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryReference[]`
    </dd>
</dl>




---

#### `dictionaryDefinitions` {#languagesetting-dictionarydefinitions}


<dl>
    
    <dt>Description</dt>
    <dd>
        Define additional available dictionaries.
        
        For example, you can use the following to add a custom dictionary:
        
        ```json
        "dictionaryDefinitions": [
          { "name": "custom-words", "path": "./custom-words.txt"}
        ],
        "dictionaries": ["custom-words"]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryDefinition[]`
    </dd>
</dl>




---

#### `enabled` {#languagesetting-enabled}


<dl>
    
    <dt>Description</dt>
    <dd>
        Is the spell checker enabled.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `flagWords` {#languagesetting-flagwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to always be considered incorrect. Words found in `flagWords` override `words`.
        
        Format of `flagWords`
        - single word entry - `word`
        - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
        
        Example:
        ```ts
        "flagWords": [
          "color: colour",
          "incase: in case, encase",
          "canot->cannot",
          "cancelled->canceled"
        ]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `id` {#languagesetting-id}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional identifier.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `ignoreRegExpList` {#languagesetting-ignoreregexplist}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of regular expression patterns or pattern names to exclude from spell checking.
        
        Example: `["href"]` - to exclude html href pattern.
        
        Regular expressions use JavaScript regular expression syntax.
        
        Example: to ignore ALL-CAPS words
        
        JSON
        ```json
        "ignoreRegExpList": ["/\\b[A-Z]+\\b/g"]
        ```
        
        YAML
        ```yaml
        ignoreRegExpList:
          - >-
           /\b[A-Z]+\b/g
        ```
        
        By default, several patterns are excluded. See
        [Configuration](https://cspell.org/configuration/patterns) for more details.
        
        While you can create your own patterns, you can also leverage several patterns that are
        [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternList`
    </dd>
</dl>




---

#### `ignoreWords` {#languagesetting-ignorewords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be ignored. An ignored word will not show up as an error, even if it is
        also in the `flagWords`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `includeRegExpList` {#languagesetting-includeregexplist}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of regular expression patterns or defined pattern names to match for spell checking.
        
        If this property is defined, only text matching the included patterns will be checked.
        
        While you can create your own patterns, you can also leverage several patterns that are
        [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternList`
    </dd>
</dl>




---

#### `languageId` {#languagesetting-languageid}


<dl>
    
    <dt>Description</dt>
    <dd>
        The language id.  Ex: "typescript", "html", or "php".  "*" -- will match all languages.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `MatchingFileType`
    </dd>
</dl>




---

#### `local` {#languagesetting-local}


<dl>
    
    <dt>Description</dt>
    <dd>
        Deprecated - The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LocaleId`<br />`LocaleId[]`
    </dd>
</dl>




---

#### `locale` {#languagesetting-locale}


<dl>
    
    <dt>Description</dt>
    <dd>
        The locale filter, matches against the language. This can be a comma separated list. "*" will match all locales.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LocaleId`<br />`LocaleId[]`
    </dd>
</dl>




---

#### `name` {#languagesetting-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional name of configuration.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `noSuggestDictionaries` {#languagesetting-nosuggestdictionaries}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional list of dictionaries that will not be used for suggestions.
        Words in these dictionaries are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        one of these dictionaries, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryReference[]`
    </dd>
</dl>




---

#### `patterns` {#languagesetting-patterns}


<dl>
    
    <dt>Description</dt>
    <dd>
        Defines a list of patterns that can be used with the `ignoreRegExpList` and
        `includeRegExpList` options.
        
        For example:
        
        ```javascript
        "ignoreRegExpList": ["comments"],
        "patterns": [
          {
            "name": "comment-single-line",
            "pattern": "/#.*/g"
          },
          {
            "name": "comment-multi-line",
            "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
          },
          // You can also combine multiple named patterns into one single named pattern
          {
            "name": "comments",
            "pattern": ["comment-single-line", "comment-multi-line"]
          }
        ]
        ```
        Defines a list of patterns that can be used with the `ignoreRegExpList` and
        `includeRegExpList` options.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternDefinition[]`
    </dd>
</dl>




---

#### `suggestWords` {#languagesetting-suggestwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        A list of suggested replacements for words.
        Suggested words provide a way to make preferred suggestions on word replacements.
        To hint at a preferred change, but not to require it.
        
        Format of `suggestWords`
        - Single suggestion (possible auto fix)
            - `word: suggestion`
            - `word->suggestion`
        - Multiple suggestions (not auto fixable)
           - `word: first, second, third`
           - `word->first, second, third`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `words` {#languagesetting-words}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be considered correct.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>





---

## LocaleId {#localeid}


<dl>
    
    <dt>Description</dt>
    <dd>
        This is a written language locale like: 'en', 'en-GB', 'fr', 'es', 'de', etc.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## MatchingFileType {#matchingfiletype}


<dl>
    
    <dt>Type</dt>
    <dd>
        `LanguageId`<br />`LanguageId[]`
    </dd>
</dl>



## OverrideSettings

| Field | Type | Description |
| --- | --- | --- |
| [allowCompoundWords](#overridesettings-allowcompoundwords) | `boolean` | True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details. | 
| [caseSensitive](#overridesettings-casesensitive) | `boolean` | Determines if words must match case and accent rules. | 
| [description](#overridesettings-description) | `string` | Optional description of configuration. | 
| [dictionaries](#overridesettings-dictionaries) | `DictionaryReference[]` | Optional list of dictionaries to use. Each entry should match the name of the dictionary. | 
| [dictionaryDefinitions](#overridesettings-dictionarydefinitions) | `DictionaryDefinition[]` | Define additional available dictionaries. | 
| [enableFiletypes](#overridesettings-enablefiletypes) | `LanguageIdSingle[]` | Enable / Disable checking file types (languageIds). | 
| [enabled](#overridesettings-enabled) | `boolean` | Is the spell checker enabled. | 
| [enabledFileTypes](#overridesettings-enabledfiletypes) | `object` | Enable / Disable checking file types (languageIds). | 
| [enabledLanguageIds](#overridesettings-enabledlanguageids) | `LanguageIdSingle[]` | Specify a list of file types to spell check. It is better to use  [Settings.enabledFileTypes](#settings-enabledfiletypes)  to Enable / Disable checking files types. | 
| [filename](#overridesettings-filename) | `Glob`<br />`Glob[]` | Glob pattern or patterns to match against. | 
| [flagWords](#overridesettings-flagwords) | `string[]` | List of words to always be considered incorrect. Words found in `flagWords` override `words`. | 
| [id](#overridesettings-id) | `string` | Optional identifier. | 
| [ignoreRegExpList](#overridesettings-ignoreregexplist) | `RegExpPatternList` | List of regular expression patterns or pattern names to exclude from spell checking. | 
| [ignoreWords](#overridesettings-ignorewords) | `string[]` | List of words to be ignored. An ignored word will not show up as an error, even if it is | 
| [includeRegExpList](#overridesettings-includeregexplist) | `RegExpPatternList` | List of regular expression patterns or defined pattern names to match for spell checking. | 
| [language](#overridesettings-language) | `LocaleId` | Sets the locale. | 
| [languageId](#overridesettings-languageid) | `MatchingFileType` | Sets the programming language id to match file type. | 
| [languageSettings](#overridesettings-languagesettings) | `LanguageSetting[]` | Additional settings for individual languages. | 
| [loadDefaultConfiguration](#overridesettings-loaddefaultconfiguration) | `boolean` | By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false` | 
| [maxDuplicateProblems](#overridesettings-maxduplicateproblems) | `number` | The maximum number of times the same word can be flagged as an error in a file. | 
| [maxNumberOfProblems](#overridesettings-maxnumberofproblems) | `number` | The maximum number of problems to report in a file. | 
| [minWordLength](#overridesettings-minwordlength) | `number` | The minimum length of a word before checking it against a dictionary. | 
| [name](#overridesettings-name) | `string` | Optional name of configuration. | 
| [noSuggestDictionaries](#overridesettings-nosuggestdictionaries) | `DictionaryReference[]` | Optional list of dictionaries that will not be used for suggestions. | 
| [numSuggestions](#overridesettings-numsuggestions) | `number` | Number of suggestions to make. | 
| [patterns](#overridesettings-patterns) | `RegExpPatternDefinition[]` | Defines a list of patterns that can be used with the `ignoreRegExpList` and | 
| [pnpFiles](#overridesettings-pnpfiles) | `string[]` | The PnP files to search for. Note: `.mjs` files are not currently supported. | 
| [suggestWords](#overridesettings-suggestwords) | `string[]` | A list of suggested replacements for words. | 
| [suggestionNumChanges](#overridesettings-suggestionnumchanges) | `number` | The maximum number of changes allowed on a word to be considered a suggestions. | 
| [suggestionsTimeout](#overridesettings-suggestionstimeout) | `number` | The maximum amount of time in milliseconds to generate suggestions for a word. | 
| [usePnP](#overridesettings-usepnp) | `boolean` | Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading | 
| [words](#overridesettings-words) | `string[]` | List of words to be considered correct. | 


### OverrideSettings Fields


---

#### `allowCompoundWords` {#overridesettings-allowcompoundwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        True to enable compound word checking. See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `caseSensitive` {#overridesettings-casesensitive}


<dl>
    
    <dt>Description</dt>
    <dd>
        Determines if words must match case and accent rules.
        
        - `false` - Case is ignored and accents can be missing on the entire word.
          Incorrect accents or partially missing accents will be marked as incorrect.
        - `true` - Case and accents are enforced.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `description` {#overridesettings-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional description of configuration.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `dictionaries` {#overridesettings-dictionaries}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional list of dictionaries to use. Each entry should match the name of the dictionary.
        
        To remove a dictionary from the list, add `!` before the name.
        
        For example, `!typescript` will turn off the dictionary with the name `typescript`.
        
        See the [Dictionaries](https://cspell.org/docs/dictionaries/)
        and [Custom Dictionaries](https://cspell.org/docs/dictionaries-custom/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryReference[]`
    </dd>
</dl>




---

#### `dictionaryDefinitions` {#overridesettings-dictionarydefinitions}


<dl>
    
    <dt>Description</dt>
    <dd>
        Define additional available dictionaries.
        
        For example, you can use the following to add a custom dictionary:
        
        ```json
        "dictionaryDefinitions": [
          { "name": "custom-words", "path": "./custom-words.txt"}
        ],
        "dictionaries": ["custom-words"]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryDefinition[]`
    </dd>
</dl>




---

#### `enableFiletypes` {#overridesettings-enablefiletypes}


<dl>
    
    <dt>Description</dt>
    <dd>
        Enable / Disable checking file types (languageIds).
        
        These are in additional to the file types specified by  [Settings.enabledLanguageIds](#settings-enabledlanguageids) .
        To disable a language, prefix with `!` as in `!json`,
        
        
        **Example: individual file types**
        
        ```
        jsonc       // enable checking for jsonc
        !json       // disable checking for json
        kotlin      // enable checking for kotlin
        ```
        
        **Example: enable all file types**
        
        ```
        *           // enable checking for all file types
        !json       // except for json
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LanguageIdSingle[]`
    </dd>
</dl>




---

#### `enabled` {#overridesettings-enabled}


<dl>
    
    <dt>Description</dt>
    <dd>
        Is the spell checker enabled.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `enabledFileTypes` {#overridesettings-enabledfiletypes}


<dl>
    
    <dt>Description</dt>
    <dd>
        Enable / Disable checking file types (languageIds).
        
        This setting replaces:  [Settings.enabledLanguageIds](#settings-enabledlanguageids)  and  [Settings.enableFiletypes](#settings-enablefiletypes) .
        
        A Value of:
        - `true` - enable checking for the file type
        - `false` - disable checking for the file type
        
        A file type of `*` is a wildcard that enables all file types.
        
        **Example: enable all file types**
        
        | File Type | Enabled | Comment |
        | --------- | ------- | ------- |
        | `*`       | `true`  | Enable all file types. |
        | `json`    | `false` | Disable checking for json files. |
    </dd>
    
    <dt>Type</dt>
    <dd>
        `object`
    </dd>
</dl>




---

#### `enabledLanguageIds` {#overridesettings-enabledlanguageids}


<dl>
    
    <dt>Description</dt>
    <dd>
        Specify a list of file types to spell check. It is better to use  [Settings.enabledFileTypes](#settings-enabledfiletypes)  to Enable / Disable checking files types.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LanguageIdSingle[]`
    </dd>
</dl>




---

#### `filename` {#overridesettings-filename}


<dl>
    
    <dt>Description</dt>
    <dd>
        Glob pattern or patterns to match against.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Glob`<br />`Glob[]`
    </dd>
</dl>




---

#### `flagWords` {#overridesettings-flagwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to always be considered incorrect. Words found in `flagWords` override `words`.
        
        Format of `flagWords`
        - single word entry - `word`
        - with suggestions - `word:suggestion` or `word->suggestion, suggestions`
        
        Example:
        ```ts
        "flagWords": [
          "color: colour",
          "incase: in case, encase",
          "canot->cannot",
          "cancelled->canceled"
        ]
        ```
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `id` {#overridesettings-id}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional identifier.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `ignoreRegExpList` {#overridesettings-ignoreregexplist}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of regular expression patterns or pattern names to exclude from spell checking.
        
        Example: `["href"]` - to exclude html href pattern.
        
        Regular expressions use JavaScript regular expression syntax.
        
        Example: to ignore ALL-CAPS words
        
        JSON
        ```json
        "ignoreRegExpList": ["/\\b[A-Z]+\\b/g"]
        ```
        
        YAML
        ```yaml
        ignoreRegExpList:
          - >-
           /\b[A-Z]+\b/g
        ```
        
        By default, several patterns are excluded. See
        [Configuration](https://cspell.org/configuration/patterns) for more details.
        
        While you can create your own patterns, you can also leverage several patterns that are
        [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternList`
    </dd>
</dl>




---

#### `ignoreWords` {#overridesettings-ignorewords}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be ignored. An ignored word will not show up as an error, even if it is
        also in the `flagWords`.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `includeRegExpList` {#overridesettings-includeregexplist}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of regular expression patterns or defined pattern names to match for spell checking.
        
        If this property is defined, only text matching the included patterns will be checked.
        
        While you can create your own patterns, you can also leverage several patterns that are
        [built-in to CSpell](https://cspell.org/types/cspell-types/types/PredefinedPatterns.html).
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternList`
    </dd>
</dl>




---

#### `language` {#overridesettings-language}


<dl>
    
    <dt>Description</dt>
    <dd>
        Sets the locale.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LocaleId`
    </dd>
</dl>




---

#### `languageId` {#overridesettings-languageid}


<dl>
    
    <dt>Description</dt>
    <dd>
        Sets the programming language id to match file type.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `MatchingFileType`
    </dd>
</dl>




---

#### `languageSettings` {#overridesettings-languagesettings}


<dl>
    
    <dt>Description</dt>
    <dd>
        Additional settings for individual languages.
        
        See [Language Settings](https://cspell.org/configuration/language-settings/) for more details.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `LanguageSetting[]`
    </dd>
</dl>




---

#### `loadDefaultConfiguration` {#overridesettings-loaddefaultconfiguration}


<dl>
    
    <dt>Description</dt>
    <dd>
        By default, the bundled dictionary configurations are loaded. Explicitly setting this to `false`
        will prevent ALL default configuration from being loaded.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `maxDuplicateProblems` {#overridesettings-maxduplicateproblems}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum number of times the same word can be flagged as an error in a file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `maxNumberOfProblems` {#overridesettings-maxnumberofproblems}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum number of problems to report in a file.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `minWordLength` {#overridesettings-minwordlength}


<dl>
    
    <dt>Description</dt>
    <dd>
        The minimum length of a word before checking it against a dictionary.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `name` {#overridesettings-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional name of configuration.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `noSuggestDictionaries` {#overridesettings-nosuggestdictionaries}


<dl>
    
    <dt>Description</dt>
    <dd>
        Optional list of dictionaries that will not be used for suggestions.
        Words in these dictionaries are considered correct, but will not be
        used when making spell correction suggestions.
        
        Note: if a word is suggested by another dictionary, but found in
        one of these dictionaries, it will be removed from the set of
        possible suggestions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `DictionaryReference[]`
    </dd>
</dl>




---

#### `numSuggestions` {#overridesettings-numsuggestions}


<dl>
    
    <dt>Description</dt>
    <dd>
        Number of suggestions to make.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `patterns` {#overridesettings-patterns}


<dl>
    
    <dt>Description</dt>
    <dd>
        Defines a list of patterns that can be used with the `ignoreRegExpList` and
        `includeRegExpList` options.
        
        For example:
        
        ```javascript
        "ignoreRegExpList": ["comments"],
        "patterns": [
          {
            "name": "comment-single-line",
            "pattern": "/#.*/g"
          },
          {
            "name": "comment-multi-line",
            "pattern": "/(?:\\/\\*[\\s\\S]*?\\*\\/)/g"
          },
          // You can also combine multiple named patterns into one single named pattern
          {
            "name": "comments",
            "pattern": ["comment-single-line", "comment-multi-line"]
          }
        ]
        ```
        Defines a list of patterns that can be used with the `ignoreRegExpList` and
        `includeRegExpList` options.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `RegExpPatternDefinition[]`
    </dd>
</dl>




---

#### `pnpFiles` {#overridesettings-pnpfiles}


<dl>
    
    <dt>Description</dt>
    <dd>
        The PnP files to search for. Note: `.mjs` files are not currently supported.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `suggestWords` {#overridesettings-suggestwords}


<dl>
    
    <dt>Description</dt>
    <dd>
        A list of suggested replacements for words.
        Suggested words provide a way to make preferred suggestions on word replacements.
        To hint at a preferred change, but not to require it.
        
        Format of `suggestWords`
        - Single suggestion (possible auto fix)
            - `word: suggestion`
            - `word->suggestion`
        - Multiple suggestions (not auto fixable)
           - `word: first, second, third`
           - `word->first, second, third`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>




---

#### `suggestionNumChanges` {#overridesettings-suggestionnumchanges}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum number of changes allowed on a word to be considered a suggestions.
        
        For example, appending an `s` onto `example` -> `examples` is considered 1 change.
        
        Range: between 1 and 5.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `suggestionsTimeout` {#overridesettings-suggestionstimeout}


<dl>
    
    <dt>Description</dt>
    <dd>
        The maximum amount of time in milliseconds to generate suggestions for a word.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `usePnP` {#overridesettings-usepnp}


<dl>
    
    <dt>Description</dt>
    <dd>
        Packages managers like Yarn 2 use a `.pnp.cjs` file to assist in loading
        packages stored in the repository.
        
        When true, the spell checker will search up the directory structure for the existence
        of a PnP file and load it.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `boolean`
    </dd>
</dl>




---

#### `words` {#overridesettings-words}


<dl>
    
    <dt>Description</dt>
    <dd>
        List of words to be considered correct.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>





---

## Pattern {#pattern}


<dl>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>



## PatternAdjustment

| Field | Type | Description |
| --- | --- | --- |
| [id](#patternadjustment-id) | `string` | Id of the Adjustment, i.e. `short-compound` | 
| [penalty](#patternadjustment-penalty) | `number` | The amount of penalty to apply. | 
| [regexp](#patternadjustment-regexp) | `string` | RegExp pattern to match | 


### PatternAdjustment Fields


---

#### `id` {#patternadjustment-id}


<dl>
    
    <dt>Description</dt>
    <dd>
        Id of the Adjustment, i.e. `short-compound`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `penalty` {#patternadjustment-penalty}


<dl>
    
    <dt>Description</dt>
    <dd>
        The amount of penalty to apply.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `number`
    </dd>
</dl>




---

#### `regexp` {#patternadjustment-regexp}


<dl>
    
    <dt>Description</dt>
    <dd>
        RegExp pattern to match
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## PatternId {#patternid}


<dl>
    
    <dt>Description</dt>
    <dd>
        This matches the name in a pattern definition.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## PatternRef {#patternref}


<dl>
    
    <dt>Description</dt>
    <dd>
        A PatternRef is a Pattern or PatternId.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Pattern`<br />`PatternId`<br />`PredefinedPatterns`
    </dd>
</dl>





---

## PredefinedPatterns {#predefinedpatterns}


<dl>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>



## RegExpPatternDefinition

| Field | Type | Description |
| --- | --- | --- |
| [description](#regexppatterndefinition-description) | `string` | Description of the pattern. | 
| [name](#regexppatterndefinition-name) | `PatternId` | Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList. | 
| [pattern](#regexppatterndefinition-pattern) | `Pattern`<br />`Pattern[]` | RegExp pattern or array of RegExp patterns. | 


### RegExpPatternDefinition Fields


---

#### `description` {#regexppatterndefinition-description}


<dl>
    
    <dt>Description</dt>
    <dd>
        Description of the pattern.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>




---

#### `name` {#regexppatterndefinition-name}


<dl>
    
    <dt>Description</dt>
    <dd>
        Pattern name, used as an identifier in ignoreRegExpList and includeRegExpList.
        It is possible to redefine one of the predefined patterns to override its value.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `PatternId`
    </dd>
</dl>




---

#### `pattern` {#regexppatterndefinition-pattern}


<dl>
    
    <dt>Description</dt>
    <dd>
        RegExp pattern or array of RegExp patterns.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Pattern`<br />`Pattern[]`
    </dd>
</dl>





---

## RegExpPatternList {#regexppatternlist}


<dl>
    
    <dt>Description</dt>
    <dd>
        A list of pattern names or regular expressions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `PatternRef[]`
    </dd>
</dl>





---

## ReplaceEntry {#replaceentry}


<dl>
    
    <dt>Type</dt>
    <dd>
        `string[]`
    </dd>
</dl>





---

## ReplaceMap {#replacemap}


<dl>
    
    <dt>Type</dt>
    <dd>
        `ReplaceEntry[]`
    </dd>
</dl>





---

## ReporterModuleName {#reportermodulename}


<dl>
    
    <dt>Description</dt>
    <dd>
        The module or path to the the reporter to load.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## ReporterOptions {#reporteroptions}


<dl>
    
    <dt>Description</dt>
    <dd>
        Options to send to the reporter. These are defined by the reporter.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `Serializable`
    </dd>
</dl>





---

## ReporterSettings {#reportersettings}


<dl>
    
    <dt>Description</dt>
    <dd>
        Declare a reporter to use.
        
        `default` - is a special name for the default cli reporter.
        
        Examples:
        - `"default"` - to use the default reporter
        - `"@cspell/cspell-json-reporter"` - use the cspell JSON reporter.
        - `["@cspell/cspell-json-reporter", { "outFile": "out.json" }]`
    </dd>
    
    <dt>Type</dt>
    <dd>
        `ReporterModuleName`<br />`ReporterModuleName[]`<br />`Unknown[]`
    </dd>
</dl>





---

## Serializable {#serializable}


<dl>
    
    <dt>Type</dt>
    <dd>
        `number`<br />`string`<br />`boolean`<br />`null`<br />`object`
    </dd>
</dl>





---

## SimpleGlob {#simpleglob}


<dl>
    
    <dt>Description</dt>
    <dd>
        Simple Glob string, the root will be globRoot.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## SuggestionCostMapDef {#suggestioncostmapdef}


<dl>
    
    <dt>Description</dt>
    <dd>
        A WeightedMapDef enables setting weights for edits between related characters and substrings.
        
        Multiple groups can be defined using a `|`.
        A multi-character substring is defined using `()`.
        
        For example, in some languages, some letters sound alike.
        
        ```yaml
          map: 'sc(sh)(sch)(ss)|t(tt)' # two groups.
          replace: 50    # Make it 1/2 the cost of a normal edit to replace a `t` with `tt`.
        ```
        
        The following could be used to make inserting, removing, or replacing vowels cheaper.
        ```yaml
          map: 'aeiouy'
          insDel: 50     # Make it is cheaper to insert or delete a vowel.
          replace: 45    # It is even cheaper to replace one with another.
        ```
        
        Note: the default edit distance is 100.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `CostMapDefReplace`<br />`CostMapDefInsDel`<br />`CostMapDefSwap`
    </dd>
</dl>





---

## SuggestionCostsDefs {#suggestioncostsdefs}


<dl>
    
    <dt>Type</dt>
    <dd>
        `SuggestionCostMapDef[]`
    </dd>
</dl>





---

## Version {#version}


<dl>
    
    <dt>Type</dt>
    <dd>
        `VersionLatest`<br />`VersionLegacy`
    </dd>
</dl>





---

## VersionLatest {#versionlatest}


<dl>
    
    <dt>Description</dt>
    <dd>
        Configuration File Version.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>





---

## VersionLegacy {#versionlegacy}


<dl>
    
    <dt>Description</dt>
    <dd>
        Legacy Configuration File Versions.
    </dd>
    
    <dt>Type</dt>
    <dd>
        `string`
    </dd>
</dl>

