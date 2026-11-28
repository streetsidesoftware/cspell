# Writing for users

These rules apply to everything people who use cspell read:

- `packages/*/README.md`, which are the npm pages, and the root `README.md`
- the website, `website/docs/`
- doc comments on config options and on public APIs: see [Writing comments](./writing-comments.md#public-comments)
- the titles and bodies of PRs that go into the release notes: see [Pull requests](./pull-requests.md)

Those readers are [users](./glossary.md#users): people who run cspell, write its config, or build on its packages.

`website/docs/` is for people who use cspell. `docs/` is for maintainers and contributors. Don't mix them.

- Write for someone using cspell, not for a contributor.
- In README files, use absolute `https://` links: relative links break on npm. Website pages can link to each other
  with relative links.
- Don't start a sentence with a code span. Lead with a word: "Use `ignoreWords` to…".
- Label an example that is a whole file with its filename in bold, directly above the code block, for example
  **`cspell.config.yaml`**.
- Never edit between `@@inject` markers, or the generated website pages. See
  [Generated files](./build-and-packaging.md#generated-files).
- In a Markdown file with deliberate misspellings, list them in a `cspell:ignore` comment at the end of the file.

## Word choice

These also apply to comments, internal ones included, and to the docs in `docs/`.

- For settings and features, write "enable" and "disable", and "enabled" and "disabled". Not "turn on" or "turn off",
  and not "on" or "off".
- When one value takes precedence over another, say what happens to the other one: "overrides", "replaces", or "is used
  instead of". Don't write "wins". For example: "A later definition replaces an earlier one with the same name."
