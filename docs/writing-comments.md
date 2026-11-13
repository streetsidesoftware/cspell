# Writing comments

How to write comments and doc comments in cspell's packages.

Keep the mental cost of reading the code low. The code is the source of truth. A few accurate comments are better than
many long ones that drift out of date.

Who reads a comment decides how to write it:

- [Public comments](#public-comments) are documentation for [users](./glossary.md#users). Users read them in their
  editor's hover, while editing a config file, and on the website.
- [Internal comments](#internal-comments) are for maintainers. They read them in the source.

[Public or internal](#public-or-internal) tells the two apart. [Voice](#voice) and [Every comment](#every-comment) apply
to both.

Apply these rules to the comments you write or change. Leave existing comments alone unless you are changing that
function, or you are asked to. Bring a package's other comments in line in a PR of their own.

## Public or internal

A comment is public when users can read it without opening cspell's source. Two kinds are public:

- **Config options.** The config types in `packages/cspell-types/src/`, the `cspell-tools` config in
  `packages/cspell-tools/src/config/config.ts`, and the ESLint plugin's options in
  `packages/cspell-eslint-plugin/src/common/options.cts`. Their doc comments become the descriptions in a JSON schema,
  which editors show while someone edits a config file. The `cspell-types` ones also make up the website's Properties
  page.
- **The public API.** Everything a package's `package.json` `exports` reach, whether or not the package is published
  today: each function, class, type and constant exported from its entry files, and every member of those types. Other
  projects build on these packages, and the doc comment is what their editor shows on hover.

Everything else is internal:

- code a package's entry files don't export, even when it has the `export` keyword
- tests and scripts
- a package whose name starts with `@internal/`

To check, follow the package's `exports` to its entry file. For `cspell-types`, `cspell-lib` and `cspell-trie-lib`, the
committed [`api/` files](./build-and-packaging.md#the-api-files) list the public API.

Cases that need care:

- An internal type that appears in a public signature becomes public. Write its comments for users, or keep it out of
  the signature.
- An exported namespace, such as `cspell-lib`'s `Text`, makes every member public.
- A deprecated export is public until it's removed.
- When a function moves into or out of the public API, rewrite its comment for its new reader.

## Voice

| Comment on                                                             | Voice                                       | Example                                           |
| ---------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------- |
| A function or method                                                   | Imperative                                  | "Read a file and check its spelling."             |
| A property that holds a function                                       | Imperative                                  | "Return the words to suggest."                    |
| A function type                                                        | Third person, present tense                 | "Returns `true` when the file should be skipped." |
| Any other class, interface, type or property, a constant or a variable | Noun phrase, or third person, present tense | "The locale to use for suggestions."              |

In the last row, a noun phrase suits most comments, and a verb suits booleans.

## Every comment

- A comment clears something up. It covers the "what" and, only when it isn't obvious, the "why".
- Write short sentences, one idea each, as many as the comment needs. Don't squeeze several facts into one long line.
- Don't open with a verb that adds nothing. "Holds the locale." says no more than "The locale.", and "Describes a
  dictionary." no more than "A dictionary."
- Use a list when a comment covers several cases. Don't write a one-line comment with several clauses.
- Give a boolean a list when its values do different things, with a line for `undefined` when that behaves differently
  too. A boolean that only turns one effect on gets a sentence that says what `true` does.
- Don't write a paragraph full of `code` references. Split it into sentences or a list.
- Leave out alternatives you rejected.
- Keep comment lines to 140 characters or fewer.
- In tests, the test name states the intent. Comment only on setup that isn't obvious.

Write invisible characters as escape sequences. The one exception is a zero-width space in a doc comment. See
[Invisible characters](./code-style.md#invisible-characters).

## Internal comments

An internal comment is for a maintainer. It lets them call or change the code correctly without reading the body.

The name, the parameter names, the types and the comment work together. The comment carries only what the others can't:

- To call the function: the contract the types don't show, such as what an `undefined` result means.
- To change it: the reason behind anything that looks arbitrary, so nobody "fixes" something deliberate.

Leave out:

- what the code already says
- what a well-named identifier already says
- a step-by-step of how the body works
- history, which belongs in the commit message

A comment never takes longer to read than the code it describes. Give a reason once, not in every place it applies.

Most internal code needs no doc comment. Add one only when it carries something from the list above. Internal terms are
fine here, and so is a `@param` when one argument needs explaining.

A name and its comment don't restate what the file and the code around them make clear. A comment that's hard to write
can mean the name is wrong. Fix the name first.

To check a comment, cover the body and read only the signature and the comment. Could you call the function correctly?
Would you leave its deliberate parts alone?

When a function changes:

- After a rename, reread its comment.
- When it moves away from its context, such as to another file or away from its only caller, read its name and comment
  as a reader there would. Add what the old context used to supply.

## Public comments

### Who reads it

The reader uses cspell. They might be writing a config file, or calling a package from their own code. They read the
comment in a hover or on the website, which both render it as Markdown.

- Describe what the reader gets. Never describe how cspell does it.
- Help the reader choose. When something else fits a case better, point to it: "For text already in memory, use
  {@link spellCheckDocument}."
- Use the words a user would use, not cspell's internal terms.
- Each comment stands alone. Repeat a rule that applies instead of pointing to another comment for it.
- Don't start a sentence with a code span; lead with a word. A `@param` description, like a list item, may start with
  code.

### What gets a comment

- Every exported function, method and property gets a summary, and details where they're needed.
- An exported class, interface or type gets a summary only when it says something its name and members can't: what it's
  for when the name doesn't say, what its values mean, or a rule its users must follow. Don't summarize its members or
  name the functions that use it, since both change.
- Every config option gets a summary, and details where they're needed.
- A renamed re-export gets no comment. The hover shows the original's.

### The summary

The summary is the first line: one sentence on a line of its own, followed by a blank line. It says what it does or what
it is, in the [voice](#voice) above.

- Say what it does from the reader's side: "Read a file and check its spelling."
- Keep advice out of it. "Use it in CI" tells the reader when to use something, not what it does.
- Leave rules, exceptions and edge cases for the details.
- The website's table of options shows only a config option's first line, so the summary must make sense without the
  details.

### The details

The paragraphs after the summary answer what a user would ask next: what it accepts, what it gives back, when it fails,
and what to use instead.

- One topic per paragraph or list. Every sentence in a paragraph is about that paragraph's subject.
- Markdown joins consecutive lines into one paragraph. Separate ideas need a blank line between them, or a list.
- Use a list when there are several parallel rules or cases.
- Say what isn't allowed, and point to what allows it.
- Say what makes it fail, and whether it throws or reports the problem in its result.
- Give units and defaults the type doesn't show.
- Drop a sentence that answers nothing the reader would ask.

### Tags

- `@default` on a line of its own for a default: `@default true`. Quote a string: `@default "utf-8"`.
- `@param` only where the name and type don't say enough. `@returns` only when it adds something.
- No `@throws`. It goes stale and misleads. Say what makes it fail in the details instead.
- Name another exported function or type with `{@link name}`, so the hover links to it.
- `@example` when the summary and the types don't show how to call it. An example shows the call, then its result as
  `//` comments, and uses only what it documents, plus anything it can't do without.

Config options have tags of their own, such as `@since` and `@deprecated`. See
[Define it](./config-and-cli.md#2-define-it).

### Config options

A config option's comment is the most-read comment in cspell. It can be as long as the option needs.

- Say what the option does, and when someone would change it.
- Show an example in a `json` code block when the setting's shape isn't obvious.
- Link to a website page for a topic too long for the comment.

### Changing a public comment

When behavior changes, or a fact needs adding:

1. Reread the whole comment: the summary, the details, every `@param` and every example. Then reread the code behind
   that behavior.
2. Find where the new fact belongs: the summary, a details paragraph, a list, a `@param`, or an example. Rewrite that
   place so the fact fits, instead of appending it to the nearest sentence.
3. Update every example whose result changed.
4. After renaming a parameter or an option, search the package's README, the website and the other doc comments for the
   old name.

When a summary gains a case, rewrite the sentence for all its cases.

### Final check

Read each changed comment as the hover or the website shows it, top to bottom.

- Does every sentence answer something a user would ask?
- Is each sentence in the right place: summary, details, `@param` or example?
- Does anything describe cspell's internals where the result is what matters?

## Examples

### A public function

Before: says what the name already says, and leaves out what the reader needs. Which config is used? What happens to a
binary file or an unreadable one? Does it throw?

```ts
/**
 * Spell Check a file
 * @param file - absolute path to file to read and check.
 * @param options - options to control checking
 * @param settingsOrConfigFile - default settings to use.
 */
export function spellCheckFile(
  file: string | Uri | URL,
  options: SpellCheckFileOptions,
  settingsOrConfigFile: CSpellUserSettings | ICSpellConfigFile
): Promise<SpellCheckFileResult>;
```

After: one paragraph each for the settings, the result, and the alternative. The `@param` lines that said nothing are
gone.

```ts
/**
 * Read a file and check its spelling.
 *
 * The config file for the file is found by searching up from its folder, and merged over the settings you pass. To
 * use a given config file, set `configFile` in the options. To skip the search, set `noConfigSearch`.
 *
 * The result's `checked` is `false` when the file wasn't checked: it's binary, its config excludes it, or loading it
 * or its config failed. Problems are reported in the result's `errors`, not thrown.
 *
 * For text already in memory, use {@link spellCheckDocument}.
 *
 * @param file - an absolute path, a `file:` URL, or a URI.
 * @example
 * const result = await spellCheckFile('/repo/README.md', {}, {});
 * result.issues.map((issue) => issue.text);
 * // The words cspell didn't recognize, such as ['recieve'].
 */
```

### A public property

Before: tells the reader what the authors want, not what the option does.

```ts
/**
 * By default we want to use the default configuration, but there are cases
 * where someone might not want that.
 * @default true
 */
includeDefaultConfig?: boolean;
```

After: one sentence that says what `true` does.

```ts
/**
 * Starts from cspell's default settings and the global settings, with the settings you pass on top.
 *
 * @default true
 */
includeDefaultConfig?: boolean;
```

### A config option

Before: the website's table of options shows "True to enable compound word checking." A user who doesn't know what
compound word checking is learns nothing.

```ts
/**
 * True to enable compound word checking.
 *
 * @default false
 */
allowCompoundWords?: boolean;
```

After: says what the option accepts, with an example, and the cost of enabling it.

```ts
/**
 * Accepts words made by joining dictionary words, such as `errormessage`.
 *
 * It also accepts misspellings that happen to split into dictionary words.
 *
 * @default false
 */
allowCompoundWords?: boolean;
```

Good as it is: a boolean whose two values do different things gets a list.

```ts
/**
 * Determines if words must match case and accent rules.
 *
 * See [Case Sensitivity](https://cspell.org/docs/case-sensitive/) for more details.
 *
 * - `false` - Case is ignored and accents can be missing on the entire word.
 *   Incorrect accents or partially missing accents will be marked as incorrect.
 * - `true` - Case and accents are enforced.
 *
 * @default false
 */
caseSensitive?: boolean;
```

### An internal function

Before: the summary hides the contract in "so that directory searches work", `root` is explained as "root", and the
`@returns` line doesn't parse.

```ts
/**
 * If a 'glob' is a path to a directory, then append `**` so that
 * directory searches work.
 * @param glob - a glob, file, or directory
 * @param root - root to use.
 * @returns `**` is appended directories.
 */
async function adjustPossibleDirectory(glob: Glob, root: string): Promise<Glob>;
```

After: the contract, with the cases that return the glob unchanged, and why they do.

```ts
/**
 * Turn a glob that names an existing directory into one that matches every file in it.
 * - A pattern with glob characters, or a URL, is returned as is, without asking the file system.
 * - A path that can't be read is returned as is, so the file search can still report it.
 * @param root - the folder a relative glob starts from, unless the glob has a root of its own.
 */
async function adjustPossibleDirectory(glob: Glob, root: string): Promise<Glob>;
```

Good as it is: what it does, why some locales disappear, and what `undefined` means.

```ts
/**
 * Normalize a locale for use with `Intl` and `toLocaleLowerCase`. Locales that `Intl` rejects are dropped.
 * @param locale - a locale or a list of locales, for example `en,tr_TR`.
 * @returns the valid locales, or `undefined` if there are none.
 */
export function normalizeLocaleForIntl(locale: LocaleId | LocaleId[] | undefined): string | string[] | undefined;
```

<!---
    cspell:ignore errormessage recieve
-->
