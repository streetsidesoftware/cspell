# CSpell Onboarding and Project Maintenance

The onboarding experience for CSpell is a bit lacking. There is a bit of documentation, which is mostly sufficient for new projects / code bases,
but adding CSpell to a large existing project or monorepo can be a struggle.

Related Issues:

- [Command: init - to create a cspell.json file · Issue #3 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/3)
- [How to install a language dictionary in collaborative projects? · Issue #3741 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/3741)
- [Allow environment variable use in dictionary definitions · Issue #924 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/924)
- [French words are not being spellchecked correctly · Issue #2055 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/2055)
- [Feature: Support Known Spelling Issues (WIP) · Issue #1297 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/1297)

### Target Audience

Not everyone who uses CSpell is a programmer. This means that documentation and onboarding walk-throughs should not expect extensive technical knowledge. Links to source code should be avoided when it isn't necessary.

## Maintaining Word Lists and Custom Dictionaries

Related issues:

- [Dealing with Orphaned Words in the .cspell.json File · Issue #2536 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/2536)
- [Command: doctor to check config health · Issue #432 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/432)
- [New `add` words command option · Issue #1317 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/1317)
- [Option to report unused suppressed words/inline suppressions · Issue #808 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/808)
- ["cspell add" command · Issue #2782 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/2782)
- [Find/validate custom words in config which are unused · Issue #2158 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/2158)
-

## Analytics

During the onboarding phase and maintenance phases, collecting data about word counts could help.

Possible data

- the word
- number of occurrences.
- number of files in appeared.
- median occurrence count per file. We want to know if a word is broadly used, or mostly just in one or two files.
- type of files (TypeScript, Markdown, etc.)
- which dictionary or word list.

### Detecting unused words

We need to distinguish between compiled/packaged dictionaries and custom dictionaries.

- Most compiled/packaged dictionaries are marked as readonly.

Detecting unused words is possible.

## Challenges

- Updating configuration files
  - `.js` and `.cjs` files will be impossible.
- Formatting - we should make a best attempt to preserve configuration file formatting, but should not take on the responsibility. This is better left to tools like prettier.
-
