# Interview guide

A menu of the decision points that recur in this repo, grouped by theme. Most features touch two or three groups. Ask
one question, resolve it, write it down (as an ADR if it's a real judgment call, or in another ADR's Context if it's a
detail), then move on. Skip a group that obviously doesn't apply without asking the user to confirm.

Where a question has an obvious, low-stakes default given the rest of the repo, propose it up front ("I'd default to X
because the other options do Y. Any reason to differ here?"). That's still an ADR if the user could reasonably have
picked differently; it just makes the interview faster.

## 0. Why, stakeholders, and the goal (always first)

- Why are we doing this? What problem or pain prompted it? Is there an issue or an RFC?
- Why now: a bug report, a feature request, a limit hit while building something else?
- If the first answer is a solution ("we need a new option") rather than a reason, try the five whys. Stop as soon as
  the reason is clear.
- Who are the stakeholders, and how is each affected? In this repo that's usually:
  - people running the cspell command-line tool, locally and in CI;
  - people writing cspell config, including shared configs other projects `import`;
  - projects that use `cspell-lib` and the other published packages;
  - the other front ends that read the same config: the ESLint plugin, the VS Code extension, cspell-action;
  - dictionary authors in cspell-dicts;
  - maintainers of this repo.
- What does success look like, as something a user can do or a config they can write, that they can't today?
- What's deliberately out of scope?

Record the answers in the feature's `README.md` before the first decision.

## 1. cspell's fixed rules

Before any option, list what cspell already fixes and the feature has to fit. Write them in the first ADR's Context.
Many later questions are settled by pointing back at them. Check each one in the code rather than assuming it.

- **Config resolution:** config files, `import`, then matching `overrides`, then matching `languageSettings`, then
  in-document directives (see `docs/glossary.md`, "Config resolution").
- **Merging:** single values are last-wins; lists and objects combine only if `_merge` in
  `packages/cspell-lib/src/lib/Settings/CSpellSettingsServer.ts` says so.
- **CLI versus config:** a CLI flag wins over the config file (`cfg.options.x ?? configInfo.config.x`).
- **Where an option can be set:** decided by the interface in `CSpellSettingsDef.ts` (see
  `docs/config-and-cli.md`).
- **Trust:** JavaScript config files and plugins aren't loaded in untrusted locations (`WorkspaceTrustSettings`).

## 2. Principles

Read `docs/design-principles.md` and weigh every option against it:

- **Keep false positives low.** Does any option flag more words by default?
- **Existing configs keep working.** Does any option change a default or the meaning of an existing value?
- **Same config, same result.** Would the CLI and the library, the ESLint plugin, or the extension disagree?
- **A command changes only what the user named.** Does any option write somewhere the user didn't ask for?
- **Cost scales with the files checked.** Does any option add per-file or per-word work?

If the feature needs a new principle, agree on it first, record it as ADR `0001`, and add it to
`docs/design-principles.md` when it holds beyond this feature.

## 3. Config options

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
- **Documentation.** The doc comment is the user documentation: what does it say, and what example does it show?

## 4. CLI commands and flags

- **Name and short form.** Does the flag fit the existing groups (config resolution, file selection, reporting)? Does
  a short form conflict with an existing one?
- **Matching config option.** Does the flag need one, so CI and editors can set the same thing? Which wins when both
  are set?
- **Negation.** Is a `--no-` form needed?
- **Output.** What do `--help` and the reporter output say? Is the output machine-read, for example with `--reporter`
  or JSON?
- **Exit codes.** Does it change when cspell exits non-zero?

## 5. Checking behavior, files, and dictionaries

- **What gets flagged.** Does it flag more or fewer words? Which existing results change?
- **File selection.** Does it interact with `files`, `ignorePaths`, `.gitignore`, or glob-based `overrides`? Glob
  order is a recurring source of bugs: ask explicitly how it composes with existing include and exclude globs.
- **Dictionaries.** Does it affect loading, enabling, or suggestions? Does it apply before or after dictionary checks?
  New word lists belong in cspell-dicts, not in this repo.
- **Parsers and plugins.** Does it depend on how a document is split into text?
- **In-document directives.** Should a `cspell:` comment be able to change it?

## 6. Public API

For a change to a published package's API, such as `cspell-lib` or `cspell-types`:

- Which packages expose it, and through which `exports` entry point?
- Is it additive, or does it change an existing signature or behavior?
- What does its doc comment say on hover?

## 7. Performance and platforms

- Could it run per file, per word, or per line on a large repo? Is the cost bounded, cached, or opt-in?
- Paths: does it work on Windows, and with case-insensitive file systems?
- Does it work with the cache (`--cache`)?

## 8. Testing and release surface

- Which unit tests cover it, and in which package? Does it need an `app.test.ts` case, a fixture, or a sample in
  `test-packages/`?
- Is it `feat:` or `fix:`, and is it breaking? What will the release note say, for someone using cspell?
- Which docs change: the website, a package README, the generated Properties page?
- Is any name still provisional? List it in the feature index, with when it must be decided.

## Wrapping a topic into a decision

Not every answer needs its own ADR. Bundle answers from the same group when they only make sense read together (an
option's name, type, and default). Split them when they can change independently later (an option's default and how
it merges across config files).
