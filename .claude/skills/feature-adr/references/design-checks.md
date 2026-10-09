# Design checks

What to check a design against, and where cspell's hard-to-undo decisions hide. Check these yourself: they aren't
questions to ask the user one by one. Bring something up only when it could change the sketch or is hard to undo once
it ships.

## Stakeholders

In this repo, a feature usually affects some of:

- people running the cspell command-line tool, locally and in CI;
- people writing cspell config, including shared configs other projects `import`;
- projects that use `cspell-lib` and the other published packages;
- the other front ends that read the same config: the ESLint plugin, the VS Code extension, cspell-action;
- dictionary authors in cspell-dicts;
- maintainers of this repo.

## cspell's fixed rules

What cspell already fixes, and the sketch has to fit. Many questions are settled by pointing back at these. Check each
one in the code rather than assuming it, and note the ones that matter in the Context of the ADR they shape.

- **Config resolution:** config files, `import`, then matching `overrides`, then matching `languageSettings`, then
  in-document directives (see `docs/glossary.md`, "Config resolution").
- **Merging:** single values are last-wins; lists and objects combine only if `_merge` in
  `packages/cspell-lib/src/lib/Settings/CSpellSettingsServer.ts` says so.
- **CLI versus config:** a CLI flag wins over the config file (`cfg.options.x ?? configInfo.config.x`).
- **Where an option can be set:** decided by the interface in `CSpellSettingsDef.ts` (see
  `docs/config-and-cli.md`).
- **Trust:** JavaScript config files and plugins aren't loaded in untrusted locations (`WorkspaceTrustSettings`).

## Principles

Read `docs/design-principles.md` and check the sketch against it:

- **Keep false positives low.** Does any option flag more words by default?
- **Existing configs keep working.** Does any option change a default or the meaning of an existing value?
- **Same config, same result.** Would the CLI and the library, the ESLint plugin, or the extension disagree?
- **A command changes only what the user named.** Does any option write somewhere the user didn't ask for?
- **Cost scales with the files checked.** Does any option add per-file or per-word work?

If the feature needs a new principle, agree on it first, record it as ADR `0001`, and add it to
`docs/design-principles.md` when it holds beyond this feature.

## Where hard-to-undo decisions hide

These become public as soon as the feature ships. Look here for inflection points.

### Config options

For a new or changed option (see `docs/config-and-cli.md`):

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

## Wrapping a topic into a decision

Not every answer needs its own ADR. Bundle answers from the same group when they only make sense read together (an
option's name, type, and default). Split them when they can change independently later (an option's default and how
it merges across config files).
