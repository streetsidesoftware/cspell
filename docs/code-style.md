# Code style

Prettier and ESLint handle formatting and import order. The compiler settings that catch people out are in
[Build and packaging](./build-and-packaging.md#compiler-settings-that-catch-people-out).

## Comments

See [Writing comments](./writing-comments.md).

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
