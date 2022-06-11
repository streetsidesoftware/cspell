# RFC Parsing files before spell checking

In its current form, the spell checker doesn't understand the context of what it is spell checking.

This RFC proposes to use a parser to add context.

In its simplest form, a parser will ingest the document and output an iterable list of transformed text with the associated context.

The parser is responsible for two things:

1. Transform the document text
1. Annotate the transformed text with context (scope).

# Transformation

Parsers transform the document text to prepare it for spell checking. This is a solution for the following issues:

- [Markdown > ignore formatting when spell checking Markdown · Issue #2672 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/2672)
- [Latex special character codes · Issue #361 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/361)
- [Feat: Only check spelling at declaration · Issue #87 · streetsidesoftware/vscode-spell-checker](https://github.com/streetsidesoftware/vscode-spell-checker/issues/87)
- [Add general setting to restrict the scope to comments and strings only · Issue #116 · streetsidesoftware/vscode-spell-checker](https://github.com/streetsidesoftware/vscode-spell-checker/issues/116)
- [Checker should have option to check code comments and strings only. · Issue #150 · streetsidesoftware/vscode-spell-checker](https://github.com/streetsidesoftware/vscode-spell-checker/issues/150)

By providing the context / scope of the transformed text, powerful configurations become possible, see [Context and Scope](#context-and-scope).
In addition, parsers will enable the spell checker to work on a wider range of documents than the existing spell checker, possibly unlocking PDF and other proprietary formats. Jupyter Notebooks are another perfect example of a file format that could benefit from a parser.

The parser extracts and if necessary transforms text from the document into parsed segments to be checked.

Parsed text has the following format: See [`types.ts`](./src/types.ts)

```ts
interface ParsedText {
  /**
   * The text extracted and possibly transformed
   */
  text: string;
  /**
   * [start, end] - offsets of the text
   */
  range: [start: number, end: number];
  /**
   * The source map is used to support text transformations.
   *
   * See: {@link SourceMap}
   */
  map?: SourceMap;
  /**
   * Used to delegate parsing the contents of `text` to another parser.
   */
  delegate?: DelegateInfo;
}
```

## Source Maps

A SourceMap is used to map a piece of transformed text back to its original text.
This is necessary in order to report the correct location of a spelling issue.

An empty source map indicates that it was a 1:1 transformation.
The values in a source map are number pairs (even, odd) relative to the beginning of each
string segment.

- even - offset in the source text
- odd - offset in the transformed text

Offsets start a 0

Example:

- Original text: `Grand Caf\u00e9 Bj\u00f8rvika`
- Transformed text: `Grand Café Bjørvika`
- Map: [9, 9, 15, 10, 18, 13, 24, 14]

**Map Explained:**

| offset | original    | offset | transformed |
| ------ | ----------- | ------ | ----------- |
| 0-9    | `Grand Caf` | 0-9    | `Grand Caf` |
| 9-15   | `\u00e9`    | 9-10   | `é`         |
| 15-18  | ` Bj`       | 10-13  | ` Bj`       |
| 18-24  | `\u00f8`    | 13-14  | `ø`         |
| 24-29  | `rvika`     | 14-19  | `rvika`     |

Notice that the starting `0, 0` and ending `29, 19` pairs were not necessary.

<!--- cspell:ignore Bjørvika rvika --->

# Context and Scope

Parsers provide context by adding scope to the text they transform. This is similar to the scope added by colorizer parsers.
The scope is used by the spell checker to select appropriate configuration.

Scope is a list of strings from local to global:

**Example Scopes**

- `'text.transformed string.quoted.single.ts meta.var.expr.ts source.ts'` - as a string separated by spaces
- `'text'`
- `'markup.bold.markdown meta.paragraph.markdown text.html.markdown'`
- `'entity.name.section.markdown heading.1.markdown markup.heading.markdown text.html.markdown'`

In a CSS selector like fashion, scope is used to apply matching configuration. This is a very powerful option. It allows the end user to apply different configuration based upon the context. For example, in an i18n translation file, the translations keys use the code splitter and English, while to strings would be case sensitive and use the word splitter.

This also addresses the following types of common requests:

- To check only comments
- To check only strings
- To check only code
- To check code in English and template strings in another language.

```yaml
documentSettings:
  - when:
      # Source code should ignore case and use the code splitter
      scope: source, code
    use:
      splitter: code # the text will be divided based upon code splitting rules
      caseSensitive: false
  - when:
      scope: text
    use:
      splitter: word
      caseSensitive: true
  - when:
      scope: text.transformed
    use:
      splitter: word # the text will be divided upon word boundaries
  - when:
      scope: text.transformed.word
    use:
      splitter: none # the text will not be divided into words before searching the dictionary.
  - when:
      # Match against TypeScript and JSON double quote strings.
      scope: source.ts string.quoted.double, string.quoted.double.json
    use:
      locale: 'es' # enable Spanish on strings
      caseSensitive: true
```

# Delegation

Some document types, like Markdown, contain sections that are best left to another parser. It should be possible to delegate that responsibility. For example, when Markdown encounters a JavaScript code block, it returns the code block indicating that it needs further processing including `.js` as a possible file extension and file type of `javascript`.

# Parsers as Plug-ins

This RFC proposes that parsers are added as a plug-in with their own possible configuration. This allows for the spell checker to be easily extended to support new file types while also allowing 3rd parties to offer custom parsers overriding the built-in ones.

# Parser Configuration

Each parser should have a default configuration as well as the ability (if appropriate) to be configurable.

For example, the Markdown could have a setting to strip formatting as asked for in [#2672 - treat `**R**peat` as `Repeat`](<(https://github.com/streetsidesoftware/cspell/issues/2672)>). Code parsers could have settings to ignore imports and variable declarations.
