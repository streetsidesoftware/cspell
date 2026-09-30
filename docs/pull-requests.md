# Pull requests

Release notes are built from merged PRs. Each entry is the PR **title**, followed by the PR **body**, verbatim. They
are read by [users](./glossary.md#users), who want to know how a change affects them. How the notes are built is in
[Releasing](./releasing.md).

Think of the body of a published PR as a press release: what changed, and why it matters to the people who use cspell.
Details only reviewers need go in a PR comment.

## Title

Use a [Conventional Commits](https://www.conventionalcommits.org/) prefix. The prefix sets the label, and the label
decides whether the PR is in the release notes, under which section, and the version bump. Pick it by whether someone
using cspell would notice the change.

In the release notes:

- `feat:`: something users can do that they couldn't before, such as a new option, flag, or file type.
- `fix:`: any other change users would notice: a bug fix, a changed behavior, a speed-up, a removal.
- `feat!:` / `fix!:`: either of the above, when it breaks existing setups. A scope works too: `fix(cspell-lib)!:`. Any
  type with `!` is listed under **BREAKING**, except `chore!:`, `ci!:`, `test!:`, `docs!:`, and `website!:`.
- `revert:` or GitHub's `Revert "…"`: undoes a merged `feat:` or `fix:` change. Listed under Fixes. A revert of anything
  else is left out.

Left out of the release notes:

- `docs:`: README files and this repo's docs, including `docs/` and `CONTRIBUTING.md`.
- `website:`: changes to the content of the website. Website dependency and tooling updates are `chore:`.
- `refactor:`: internal restructuring with no change users would notice.
- `dev:`: any other code change users wouldn't notice, such as a change to a feature that hasn't been released yet.
- `test:`: tests only.
- `perf:`: adding performance tests. A change users would notice as faster is `feat:` or `fix:`.
- `ci:`: GitHub Actions and workflows.
- `chore:`: tooling, dev dependencies, the coding-agent setup, and other repository maintenance. Not code changes: those
  are `dev:` or `refactor:`.

A title with any other prefix gets no label, and is left out. The labels, sections, and version bumps are in
[Titles, labels, and sections](./releasing.md#titles-labels-and-sections).

Bot PRs pick their own type, for example `fix: Workflow Bot -- Update Dictionaries (main)`. Don't lower it: new
dictionaries change what users see.

Write the rest of a published title for users: what changed for them, not how the code changed.

## Description

Keep it short. Prefer bullet points to prose. A sentence with more than one or two `code` spans is hard to read: break
it into a list.

Start with `## Summary`: one or two sentences that stand on their own: what changed and why.

### A PR in the release notes

For `feat:`, `fix:`, and `revert:`, write for users deciding whether the change affects them.

- Say which option, flag, command, or behavior changed, in their terms.
- For `feat:`, add a `## Feature` section: what users can now do, with a config or command-line example.
- Keep internal details out of the main text. How the change works can go in a closing
  [Technical Details](#technical-details) block.
- Leave the names of internal methods, classes, and variables out of the whole body, Technical Details included.
  Package names, such as `cspell-lib`, are fine: users install them.
- When changing an API is the point of the PR, name what changed in the main text. For example, a new option in
  `CSpellSettings` is called out by name. An API change made along the way goes in Technical Details.
- A measurement is one or two lines: the number, and what it was measured on. No tables, and nothing about how it was
  measured: that goes in a PR comment. When speed is the point of the PR, celebrate it: show how much faster it is.

### Technical Details

A published PR can end with one collapsed block that explains how the change was achieved, for
[maintainers](./glossary.md#maintainers-and-contributors) and curious [users](./glossary.md#users). It's optional.

- Keep it readable by someone who uses cspell but has never read its code: "How It's Made", not a code review.
- Terms from cspell's user documentation, such as ignore patterns or `languageSettings`, are fine. Explain any other
  term in plain words, or leave it out.
- Prefer what happens, and in what order, to how the code does it. For example: "Don't work out which parts of a
  document to check until it's known that the document will be checked."
- Use exactly this summary text, and keep the block last. The blank line after `</summary>` is needed for the Markdown
  inside to render.

```markdown
<details>
<summary>Technical Details</summary>

- …

</details>
```

### A PR left out of the release notes

Write for reviewers. Group the changes by theme, not by file, and say why each matters. Put extra detail in collapsed
`<details>` blocks, as bullet points.

### Every PR

- No test plan section: CI covers that.
- No tool attribution, such as "Generated with ...". The release notes strip it, but leave it out anyway.
- No HTML comments (`<!-- -->`). They are hidden on GitHub but published with the body. A PR whose body has one is
  labelled `Warning: Hidden Comments`, and its check fails until the comment is removed. To check a body before you
  post it, run `node ./scripts/detect-html-comments.mts <file>`. A comment inside a fenced code block is fine; one in
  inline code is still reported.
- After pushing more commits, check that the description still matches.

Don't restate the diff, narrate how you got to the change, or write a section per commit.

## Fixing a merged PR

If a PR merged with the wrong title, label, or body, see
[Fixing a release notes entry](./releasing.md#fixing-a-release-notes-entry).
