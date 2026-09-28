# Code style

Prettier and ESLint handle formatting and import order. The compiler settings that catch people out are in
[Build and packaging](./build-and-packaging.md#compiler-settings-that-catch-people-out).

## Comments

Keep the mental cost of reading the code low. The code is the source of truth. A few accurate comments are better than
many long ones that drift out of date.

- Don't explain what the code does when the code already shows it. Explain why, only when it isn't obvious.
- A comment should never take longer to read than the code it describes.
- Don't discuss rejected alternatives, and give a reason once, not in every place it applies.
- Avoid a one-line comment with several clauses. Use a short multi-line list instead.
- Avoid a paragraph full of `code` references. Split it into sentences or a list.
- Keep comment lines to 140 characters or fewer.
- Tests: the test name states the intent. Comment only on setup that isn't obvious.
- Leave existing comments alone unless you are changing that function, or you are asked to.

Two kinds of doc comment are documentation for users:

- **The public API of every published package**: each class, function, method, type, and constant that its
  `package.json` `exports` expose. Other projects use these packages, and the doc comment is what their editor shows
  on hover. Write one line on what it does, plus what isn't obvious from the name and type: units, defaults, errors,
  side effects. Use `@param` and `@returns` when they add something.
- **Config options** in `packages/cspell-types/src/CSpellSettingsDef.ts` and the other `cspell-types` config types.
  They become the JSON schema descriptions and the website's Properties page, so they can be as long as they need to
  be. See [Config options](./config-and-cli.md#2-define-it).

Internal code follows the rules above: a doc comment only when it adds something.

## Invisible characters

Write invisible and non-printing characters as escape sequences (`\u00a0`, `\u200b`, `\u2028`), including in strings,
regular expressions, and `case` labels. A literal invisible character can't be seen in a review, and editors can
silently change it.

The one exception is a zero-width space inside a doc comment. A doc comment can't use escapes, and some text in it
would otherwise end the comment early, such as a glob like `**/*.ts` or an example `/* ... */`. Put a zero-width space
between `*` and `/` to keep them apart. The file then needs `/* eslint-disable no-irregular-whitespace */`. See
`packages/cspell-types/src/CSpellSettingsDef.ts`. The schema build and the website generator remove these zero-width
spaces, so users never see them.

Test data (`fixtures/`, samples) may contain literal invisible characters on purpose.
