---
parent: Configuration
---

# Language Settings

The `languageSettings` option allow configuration to be based upon the programming language. There are two selector fields: `locale` and `languageId`.

- `languageId` defines which programming languages to match against.
  A value of `"python,javascript"` will match against _python_ and _javascript_ files. To match against ALL programming languages,
  use `"*"`.

- `locale` defines which spoken languages to match against. A value of `"en-GB,nl"` will match against British English or Dutch.
  A value of `"*"` will match all spoken languages.

- Most configuration values allowed in a `cspell.json` file can be defined or redefined within the `languageSettings`. For example:

```javascript
    "languageSettings": [
        {
            // VS Code languageId (i.e. typescript, java, go, cpp, javascript, markdown, latex)
            // * will match against any file type.
            "languageId": "c,cpp",
            // Language locale. i.e. en-US, de-AT, or ru. * will match all locales.
            // Multiple locales can be specified like: "en, en-US" to match both English and English US.
            "locale": "*",
            // To exclude patterns, add them to "ignoreRegExpList".
            "ignoreRegExpList": [
                "/#include.*/"
            ],
            // List of dictionaries to enable by name in `dictionaryDefinitions`.
            "dictionaries": ["cpp"],
            // Dictionary definitions can also be supplied here. They are only used iff "languageId" and "locale" match.
            "dictionaryDefinitions": []
        }
    ]
```
