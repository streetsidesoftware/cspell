# Contributing

Thanks for considering a contribution to cspell! Bug reports, fixes, new features, and documentation improvements are
all welcome.

## What's in this repo

cspell is a spell checker for code. This monorepo holds:

- the `cspell` command-line tool, and the libraries it's built on, such as `cspell-lib`, published to npm from
  `packages/`
- the website, https://cspell.org, which is the user documentation, in `website/`

The dictionaries themselves live in [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts). To add or
remove words in a dictionary, go there.

## Quick start

```sh
corepack enable
pnpm ibt
```

`pnpm ibt` installs, builds, and tests. For the Node.js version, working on one package, and the checks to run before a
pull request, see [Development](./docs/development.md).

## Good to know

- **Keep false positives low, and existing configs working.** See [Design principles](./docs/design-principles.md).
- **Generated files** are regenerated, never edited. See
  [Generated files](./docs/build-and-packaging.md#generated-files).
- **PR titles and bodies are published verbatim** in the release notes, for people who use cspell. See
  [Pull requests](./docs/pull-requests.md).

## Docs for contributors

- [Development](./docs/development.md): setting up, checks before a pull request, spelling
- [Build and packaging](./docs/build-and-packaging.md): workspace layout, tooling, commands, generated files, CI
- [Pull requests](./docs/pull-requests.md): the title's type, the body, and what goes in the release notes
- [Code style](./docs/code-style.md): comments, doc comments, invisible characters
- [Writing for users](./docs/writing-for-users.md): READMEs, the website, doc comments, and published PRs
- [Config options and CLI flags](./docs/config-and-cli.md): adding or changing one
- [Design principles](./docs/design-principles.md)
- [Designing a feature](./docs/designs/README.md): thinking a feature through before and while you build it
- [Releasing](./docs/releasing.md): release-drafter, the Prepare Release PR, prerelease mode, fixing an entry
- [Glossary](./docs/glossary.md)

## Links

- Coverage: [Coveralls](https://coveralls.io/github/streetsidesoftware/cspell) and
  [Codecov](https://app.codecov.io/gh/streetsidesoftware/cspell)
- Packages most used by other projects: [cspell](https://www.npmjs.com/package/cspell),
  [cspell-lib](https://www.npmjs.com/package/cspell-lib), and
  [cspell-trie-lib](https://www.npmjs.com/package/cspell-trie-lib)
