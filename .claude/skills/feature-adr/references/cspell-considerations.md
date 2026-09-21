# cspell-specific angles to probe

A checklist of the ways new cspell behavior tends to hide unexamined edge cases.
Not every feature touches every category — use this to pick which questions are
worth asking, not as a script to read verbatim to the user. Skip a category
silently if it obviously doesn't apply; don't ask the user to confirm that it
doesn't.

## Configuration surface

- **Where does the setting live?** Top-level config, `overrides`, `languageSettings`,
  or all three? If more than one, what happens when they disagree?
- **Inheritance and merge behavior.** CSpell merges layered config files, then
  applies matching `overrides`, then matching `languageSettings` (last one wins
  within each stage). Does the new setting merge (arrays/objects combine),
  override (last writer wins), or does that need to be a decision in itself?
- **Interaction with `import`.** If a project imports a shared config, should the
  new setting be importable/shareable, or is it inherently local?
- **Config vs. CLI flag.** If there's a CLI flag for the same thing, which wins
  when both are set? Precedent in this codebase: CLI flags generally override
  config, but confirm rather than assume for the specific case.
- **Schema and types.** A new config key means a `cspell-types` change, which per
  `AGENTS.md` requires `pnpm run update-schema` and a `website/docs` mention — flag
  this as a handoff note even though this skill doesn't run the build itself.

## Naming and shape

- Does the name collide with, shadow, or read as a synonym of an existing option?
  (Check `website/docs/Configuration` and `cspell.schema.json` before assuming a
  name is free.)
- Boolean flag, enum, string, or array? Arrays and enums age better than booleans
  when a feature might grow a third option later — but don't over-engineer a
  setting that's genuinely binary.
- Does the directive need a negation form (`no*` / `disable*`) consistent with
  existing patterns like `noConfigSearch`?

## File discovery and glob interaction

- Does this interact with `files`, `ignorePaths`, or glob-based `overrides`
  matching? Glob precedence and ordering bugs are a recurring source of cspell
  issues — if the feature touches file selection at all, ask explicitly how it
  composes with existing include/exclude globs.
- Does it need to respect `.gitignore` / `.cspellignore` conventions, or is it
  orthogonal to file discovery entirely?

## Dictionaries

- Does the feature interact with dictionary loading, enabling/disabling
  dictionaries, or suggestion generation? If so, does it apply before or after
  dictionary-based checks run?
- Bundled dictionaries are sourced from the separate `cspell-dicts` repo — if the
  feature implies new word lists, that's out of scope for an in-repo ADR and
  should be called out as an external dependency, not designed here.

## CLI surface

- New flag or new subcommand behavior? Where does it sit relative to existing
  flags in `packages/cspell` — is there a natural grouping (checking, reporting,
  config resolution)?
- Does it need a short form? Does it conflict with an existing short flag?
- What does `--help` output and the injected README documentation need to say?
  (Reminder for the implementer: CLI output changes require snapshot updates and
  `pnpm run build:readme`, per `AGENTS.md`.)

## Backward compatibility

- Does this change the meaning of any existing config value, or is it purely
  additive? A changed default is a breaking change; a new opt-in key usually
  isn't.
- If a deprecated predecessor exists (or this deprecates something), what's the
  migration path — silent fallback, warning, or hard error?
- Does this need a major-version bump (`feat!:`/`fix!:` per the PR title
  convention in `AGENTS.md`), or does it fit as a minor/patch change?

## Cross-platform

- Any path handling involved? CI runs on Windows — string-concatenated paths and
  case-sensitive assumptions are common failure points.

## Performance

- Could this run per-file, per-word, or per-line on large repos? If so, is the
  cost bounded, cached, or opt-in?

## Precedent

- Does something like this already exist in `rfc/` (the repo's existing
  narrative RFC process for larger proposals) or in closed issues/PRs? An ADR
  can supersede or narrow an old RFC — check before assuming the feature is
  unprecedented.
