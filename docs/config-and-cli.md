# Config options and CLI flags

How to add or change a cspell configuration option or a command-line flag. Both are public as soon as they ship: people
write them into config files, scripts, and CI. So existing values keep working (see
[Design principles](./design-principles.md#existing-configs-keep-working)).

If the design has more than one reasonable answer, such as the name, the shape, the default, or where the option
applies, decide it first with an [ADR](./ADRs/README.md).

## Config options

Config options are TypeScript types with doc comments in `packages/cspell-types/src/CSpellSettingsDef.ts`. The JSON
schema and the website's [Properties](https://cspell.org/configuration/properties/) page are generated from them.

### 1. Pick where it can be set

The interface you add the property to decides where users can set it:

| Interface             | Where it can be set                                                                |
| --------------------- | ---------------------------------------------------------------------------------- |
| `BaseSetting`         | the top level, `overrides`, and `languageSettings`                                 |
| `Settings`            | the top level and `overrides`                                                      |
| `FileSettings`        | the top level of a config file only                                                |
| `CommandLineSettings` | the top level only; for options the CLI also takes, such as `cache` and `failFast` |

### 2. Define it

Add the property with a doc comment. The doc comment is user documentation: it becomes the description in
`cspell.schema.json`, the editor hover, and the Properties page. Follow
[Writing for users](../CONTRIBUTING.md#writing-for-users).

- Say what the option does and when to change it. Show an example if it helps.
- Tags used in this file:
  - `@default` for the default value
  - `@since <version>` for the release that adds it
  - `@deprecated true` and `@deprecationMessage` when replacing it
  - `@experimental` while it may still change
- A glob or `/* */` in a doc comment needs a zero-width space between `*` and `/`. See
  [Invisible characters](../CONTRIBUTING.md#invisible-characters).

### 3. Register it

The build fails until the new key is added to each of these, because they're typed to cover every key:

- `ConfigFields` in `packages/cspell-types/src/configFields.ts`
- `mergeDefinitionFunctions` in `packages/cspell-types/src/merge.ts`
- the handlers in `packages/cspell-lib/src/lib/Settings/sanitizeSettings.ts`

This one isn't checked:

- **How it merges across config files:** `_merge` in `packages/cspell-lib/src/lib/Settings/CSpellSettingsServer.ts`.
  By default the last config file wins. An array or object that should combine across files and imports needs its own
  line there.

### 4. Use it and test it

Read the setting where it's needed, usually in `cspell-lib`. Add tests next to the code.

### 5. Regenerate

```sh
pnpm run build
pnpm test
```

- The build regenerates both `cspell.schema.json` files and `packages/cspell-types/api/index.d.mts`, and
  `packages/cspell-lib/api/api.d.ts` if the change reaches its API. Commit them.
- `pnpm test` ends with `test-schema`, which fails if the schema is out of date.
- Don't edit `website/docs/Configuration/auto_properties.md`. The Build Docs workflow regenerates it after merge.
- If the option needs more than its description, update or add a hand-written page in `website/docs/Configuration/`.

### Changing an option

- **A default or a meaning** is a breaking change. Use `feat!:` or `fix!:`, and say how to keep the old behavior.
- **Renaming:** add the new option, keep reading the old one, and deprecate the old one.
- **Deprecating:** add `@deprecated true` and a `@deprecationMessage` that names the replacement. Keep reading it.
- **Removing** is a breaking change: `feat!:` or `fix!:`.

## CLI flags

The CLI is `packages/cspell`. Its commands are defined with commander in `packages/cspell/src/command*.ts`:
`commandLint.ts` for `cspell lint`, `commandTrace.ts` for `cspell trace`, and so on. The option types are in
`packages/cspell/src/options.ts`.

### 1. Check for a matching config option

Many flags set or override a config option, such as `--cache`, `--no-gitignore`, and `--fail-fast`. If the flag needs
one that doesn't exist yet, add the config option first (see [Config options](#config-options)).

The flag wins over the config file:
`cfg.options.gitignore ?? configInfo.config.useGitignore ?? false` in `packages/cspell/src/lint/lint.ts` is the pattern.

### 2. Define it

- Add the option to the command in `command*.ts`, with help text.
  - The help text is user documentation: `--help`, the package README, and the website show it.
  - A `--no-` flag negates a boolean.
  - Hide an option that users shouldn't reach for with `.hideHelp()`.
- Add it to the matching options type in `options.ts`.
- Pass it through to where it's used: `packages/cspell/src/lint/` for `lint`, and on to `cspell-lib` if needed.

### 3. Test it

- Add cases to `packages/cspell/src/app.test.ts`, which runs the CLI with arguments.
- The `--help` output is snapshotted there. Update snapshots with `pnpm run test:update-snapshots`, and review the diff.

### 4. Documentation

- `packages/cspell/README.md` shows `cspell lint --help` from `packages/cspell/static/help-lint.txt`. The Update README
  workflow regenerates it after every merge to `main`. To preview it in the PR, run `pnpm run build:readme`.
- The website's `cspell lint --help` page (`website/src/components/help-lint.md`) is regenerated by the Build Docs
  workflow. That workflow runs on its own only when `cspell-types` changes, so after merging a CLI change, run it by
  hand: `gh workflow run update-docs.yml`.
- If the flag needs explaining, update the website page that covers it.

### Changing a flag

- Renaming: keep the old name working as a hidden option, as `--local` (now `--locale`) and `--files` (an alias of
  `--file`) are.
- Changing what a flag does, or removing one, is a breaking change: `feat!:` or `fix!:`.

## The PR

- **Title:**
  - `feat:` for a new option or flag users can use
  - `fix:` for a changed default, a rename, or a deprecation
  - add `!` if a setup that works today would break
- **Body:** a `## Summary` for users, and for `feat:` a `## Feature` section with a config or command-line example. See
  [Pull requests](./pull-requests.md).
