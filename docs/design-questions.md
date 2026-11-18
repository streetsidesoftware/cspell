# Design questions

The questions a [design](./feature-design.md) covers, and where cspell's hard-to-undo decisions hide. There are three
kinds:

- **[Overview questions](#overview-questions)** shape the approach. Work through them while exploring approaches and
  deciding the overview.
- **[Detail questions](#detail-questions)** shape each part. Work through them part by part, once the overview is
  agreed.
- **[Whole-feature questions](#whole-feature-questions)** cover the feature as one change. Work through them once,
  after the last part, or before you stop designing to build.

All the overview groups apply to every feature. Most features touch two or three groups of detail questions. Spend time
on a question when its answer could change the overview or would be hard to undo once it ships. Settle the rest with a
proposed default, such as "the other options do Y", and write it in the working notes. Answers about the code, such as
which tests cover a part, go there too. When checking a small change, note every side effect you find.

## Overview questions

### Why and who

Always first.

- Why are we doing this? What problem prompted it? Is there an issue?
- Why now: a bug report, a feature request, a limit hit while building something else?
- If the first answer is a solution ("we need an option"), ask why until the reason is clear.
- Who is affected, and how? Usually some of:
  - people running the cspell command-line tool, locally and in CI;
  - people writing cspell config, including shared configs other projects `import`;
  - projects that use `cspell-lib` and the other published packages;
  - the other front ends that read the same config: the ESLint plugin, the VS Code extension, cspell-action;
  - dictionary authors in cspell-dicts;
  - maintainers of this repo.
- What does success look like, as something a user can do or a config they can write, that they can't today?
- What's out of scope?

### cspell's fixed rules

What cspell already fixes. Every approach has to fit them, and many questions are settled by pointing back at them. At
the overview level, check the ones that could rule out an approach, rather than assuming them. The rest come up with
their part. Note the ones that matter next to the decision they shape, in terms a user knows rather than code names.

- **Config resolution:** config files, `import`, then matching `overrides`, then matching `languageSettings`, then
  in-document directives (see "Config resolution" in the [glossary](./glossary.md)).
- **Merging:** single values are last-wins; lists and objects combine only if `_merge` in
  `packages/cspell-lib/src/lib/Settings/CSpellSettingsServer.ts` says so.
- **CLI versus config:** a CLI flag wins over the config file (`cfg.options.x ?? configInfo.config.x`).
- **Where an option can be set:** decided by the interface in `CSpellSettingsDef.ts` (see
  [Config options and CLI flags](./config-and-cli.md)).
- **Trust:** JavaScript config files and plugins aren't loaded in untrusted locations (`WorkspaceTrustSettings`).

### Principles

Check each approach against the [design principles](./design-principles.md):

- **Keep false positives low.** Does it flag more words by default?
- **Existing configs keep working.** Does it change a default or the meaning of an existing value?
- **Same config, same result.** Would the CLI and the library, the ESLint plugin, or the extension disagree?
- **A command changes only what the user named.** Does it write somewhere the user didn't ask for?
- **Cost scales with the files checked.** Does it add per-file or per-word work?

If the feature needs a new principle, agree on it before the decisions that depend on it.

### The approach

- **What users see.** What does a user write, in the config or on the command line, and what does cspell do in return?
  Is it a config option, a CLI command or flag, a change to what gets flagged, or a change to a published API?
- **Where it belongs.** Which packages does it touch? Does it belong in cspell, in cspell-dicts, or in one of the
  front ends?
- **What it writes.** Does it write anything, such as a config file or a dictionary? Who chooses where?
- **Existing users.** Does it change a default, what gets flagged, or the meaning of an existing option or flag?
- **Hard to undo.** Which choices become public as soon as it ships: an option's name or shape, a flag, what gets
  flagged, a published API? Name them here. The exact names and shapes are settled with their part.

## Detail questions

### Config options

For a new or changed option (see [Config options and CLI flags](./config-and-cli.md)):

- **Name.** Does it collide with, shadow, or read as a synonym of an existing option? Check `cspell.schema.json` and
  https://cspell.org/configuration/properties/. Names are public as soon as they ship.
- **Type and shape.** A boolean now often becomes an enum later. Would an object or enum leave room to grow? Don't
  over-engineer an option that's really binary.
- **Default.** Prefer quiet and accurate. Does the default change anything for existing configs?
- **Where it can be set.** Top level only, `overrides`, or `languageSettings`? If more than one, what happens when they
  disagree?
- **Merging.** Across config files and `import`, does it replace or combine?
- **Sharing.** Should a shared config be able to set it through `import`, or is it inherently local?
- **Replacing an option.** Is an old option deprecated? How do the two coexist, and what does the deprecation message
  say?
- **Doc comment.** The doc comment is the user documentation: what does it say, and what example does it show?

### CLI commands and flags

- **Name and short form.** Does the flag fit the existing groups (config resolution, file selection, reporting)? Does
  a short form conflict with an existing one?
- **Matching config option.** Does the flag need one, so CI and editors can set the same thing? Which wins when both
  are set?
- **Negation.** Is a `--no-` form needed?
- **Output.** What do `--help` and the reporter output say? Is the output machine-read, for example with `--reporter`
  or JSON?
- **Exit codes.** Does it change when cspell exits non-zero?

### Checking behavior, files, and dictionaries

- **What gets flagged.** Does it flag more or fewer words? Which existing results change?
- **File selection.** Does it interact with `files`, `ignorePaths`, `.gitignore`, or glob-based `overrides`? Glob
  order is a recurring source of bugs: check explicitly how it composes with existing include and exclude globs.
- **Dictionaries.** Does it affect loading, enabling, or suggestions? Does it apply before or after dictionary checks?
  New word lists belong in cspell-dicts, not in this repo.
- **Parsers and plugins.** Does it depend on how a document is split into text?
- **In-document directives.** Should a `cspell:` comment be able to change it?

### Public API

For a change to a published package's API, such as `cspell-lib` or `cspell-types`:

- Which packages expose it, and through which `exports` entry point?
- Is it additive, or does it change an existing signature or behavior?
- What does its doc comment say on hover?

### Performance and platforms

- Could it run per file, per word, or per line on a large repo? Is the cost bounded, cached, or opt-in?
- Paths: does it work with Windows paths, and with case-insensitive file systems?
- Does it work with the cache (`--cache`)?

### Testing

- Which tests cover it, and in which package?
- Does it need a fixture, an `app.test.ts` case, or a sample in `test-packages/`?

## Whole-feature questions

### Release surface

- Is it `feat:` or `fix:`, and is it breaking? What does the release note say, for someone using cspell? See
  [Pull requests](./pull-requests.md).
- Which docs change: the website, a package README, the generated Properties page?
- Is any name still provisional? Each needs a decision, or an issue saying when it must be decided.
