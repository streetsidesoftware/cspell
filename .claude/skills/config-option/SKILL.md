---
name: config-option
description: 'Add or change a cspell configuration option (a property in cspell.json / cspell.config.yaml, defined in packages/cspell-types) end to end: a new option, a changed default or type, a rename, a deprecation, or a removal. Runs a short design checklist, hands over to feature-adr when a decision is open, then defines the option with its user-facing doc comment, registers it, wires it into cspell-lib, adds tests, regenerates the schema and API files, and drafts the PR title and description. Use this whenever the user asks to add, change, rename, deprecate, or remove a config option or setting, or to make something configurable in cspell config, even if they do not say "skill". For a command-line flag, use cli-option (which calls back here if the flag needs a config option).'
---

# config-option

Adds or changes a config option following `docs/config-and-cli.md`, "Config options". Read that section first: it is
the procedure. This skill adds the design checklist, the order of work, and the PR drafts.

An option is public as soon as it ships. Its name, type, default, and where it can be set end up in people's config
files and shared configs. So the design comes first, and existing configs keep working (`docs/design-principles.md`).

## Workflow

### 1. Identify the change

Ask what the user wants, if it isn't clear, and name the kind of change: add, change a default, change a type, rename,
deprecate, or remove. Read the matching part of `docs/config-and-cli.md`, and `docs/design-principles.md`.

For a removal, confirm it's meant for a major release: removing an option is a breaking change.

### 2. Run the design checklist

Ask one question at a time. Check facts in the code before asking (existing names, similar options, how the value is
read and merged today), and bring them to the question. Give options labelled (a), (b), …, each with the config a user
would write, and your recommendation first.

For a new option:

- **Name:** consistent with related options, and not a synonym of an existing one. Check `cspell.schema.json`.
- **Type and shape:** would an enum or object leave room to grow better than a boolean?
- **Default:** quiet and accurate. Does it change anything for existing configs?
- **Where it can be set:** which interface in `CSpellSettingsDef.ts` (the table in `docs/config-and-cli.md`).
- **Merging:** across config files and `import`, does it replace or combine?
- **CLI:** does it need a matching flag? If so, run `cli-option` after this.
- **Description:** what the option does and when to change it, with an example if it helps.

For a change:

- **What changes for users,** and how they keep the old behavior.
- **Compatibility:** how existing values keep working.
- **The replacement,** for a deprecation: the new option, or the reason there is none.

**Hand over to feature-adr** when an answer has more than one reasonable option with lasting effects, for example a
name other options will follow, a new object shape, a default that changes what gets flagged, or new merge behavior.
Say so, and offer to run the `feature-adr` skill. Continue here once the design is decided.

Record the answers. They go into the PR description in step 5.

### 3. Implement

Follow the doc's steps. Don't skip one:

- Define or change the property and its doc comment in `CSpellSettingsDef.ts`. The doc comment is user documentation:
  follow `CONTRIBUTING.md`'s "Writing for users". Add `@since` with the next version, and `@default` if it has one.
  For a glob or `/* */` in the comment, follow "Invisible characters".
- Register it in `configFields.ts`, `merge.ts`, and `sanitizeSettings.ts`. The build fails until all three have it.
- If it's an array or object that should combine across config files, add it to `_merge` in
  `packages/cspell-lib/src/lib/Settings/CSpellSettingsServer.ts`. Nothing checks this for you.
- Wire it into the code that uses it. For a rename, read the old option too, and let the new one win.
- Add tests next to the code. For a rename, cover old only, new only, and both.

Never edit generated files by hand. Regenerate them:

```sh
pnpm run build
```

### 4. Verify

While iterating, `pnpm --filter <package>... run build` and `pnpm --filter <package> test` are enough. Before
finishing, build the whole repo and update all snapshots:

```sh
pnpm run build
pnpm run test:update-snapshots
pnpm test
pnpm run lint
pnpm run check-spelling
```

- `pnpm test` ends with `test-schema`, which fails if the schema is stale.
- Check the diff: the option in both `cspell.schema.json` files, and in `packages/cspell-types/api/index.d.mts`.
  Nothing else generated should change, except `packages/cspell-lib/api/api.d.ts` if the change reaches its API.
- Don't edit `website/docs/Configuration/auto_properties.md`: the Build Docs workflow regenerates it after merge.
  If the option needs more than its description, update the hand-written page in `website/docs/Configuration/`.
- `pnpm run lint` writes fixes. Check the diff afterwards.

### 5. Draft the PR title and description

An option change is read by people who use cspell, so it goes in the release notes. Follow `CONTRIBUTING.md`'s "Pull
requests", and `docs/config-and-cli.md`'s "The PR".

- **Title:** `feat:` for a new option, `fix:` for a changed default, a rename, or a deprecation. Add `!` when a config
  that works today would break. Say what changed for users.
- **Description:** a `## Summary`, and for `feat:` a `## Feature` section with a config example and the design answers
  from step 2 that shape how to use it. No tool attribution.

Show the drafts to the user. Don't commit, push, or open a PR until they say so.

## Notes

- If the request turns out to need no option at all, say so and stop.
- If the option only matters to one front end, ask whether it belongs in cspell config at all
  (`docs/design-principles.md`, "Same config, same result").
