# Config search: working notes

Status: in progress

Working notes for [the design](./README.md). They aren't kept current once the feature is finished. The code is the
source of truth.

## To do

- [x] Work through the search for each file: which folders a named config replaces, and how the search skips them.
- [x] Work through `--stop-config-search-at`: inclusive in both searches, and with `--config`, replacing the default
      stops at or below its folder.
- [x] Settle the rest of the whole-feature questions in the [design questions](../../design-questions.md).
- [ ] Match stops by their real folder, so different spellings of the same folder match.
- [ ] Update the docs: the overrides page, the "Checking Each File" section of the globs page, and the help text of
      `--config` and `--stop-config-search-at`. The help text regenerates the `--help` snapshots, the cspell README,
      and the website's help page.
- [ ] Add app tests for the scenarios below.

## Open questions

- None right now.

## Notes

### Release

The new default is on in a v10 release, as a feature (`feat:`). It's a behavior change that might disrupt some setups,
and patches should be light. There's an easy enough workaround, so it doesn't need a major version.

- The release note says what changes with `--config` and who sees it, and gives the two ways to keep the old
  behavior. An example shows the configs one command loads, before and after.
- PR #9640 ships first, as `fix:`.
- No name is provisional. There's no new option or flag, and `StopAtLocation` is settled.
- The generated Properties page doesn't change. cspell-action's `config` input text still holds.

### Today

- The startup search is `readConfig` in `packages/cspell/src/util/configFileHelper.ts`. It reads `--config`, then
  `CSPELL_CONFIG_PATH`, and otherwise calls `searchForConfig(root, { stopSearchAt })`.
- The search for each file is `searchForDocumentConfig` in
  `packages/cspell-lib/src/lib/textValidation/docValidator.ts`. `cspell check` passes the named config as
  `configFile`, which replaces this search. `cspell lint` doesn't.
- `cspell check` uses one config per file: the named one, or the nearest one found from the file. It never merges a
  startup config with a deeper one, so it differs from `cspell lint` with and without `--config`. It stays out of this
  change.
- The ESLint plugin's `configFile` option works the same way: `DocumentValidator` loads it in place of the search for
  each file.
- The walk is `findUpFromUrl` in `packages/cspell-io/src/VirtualFS/findUpFromUrl.ts`. Its stops are inclusive: a folder
  is searched before the stop test.
- `DirConfigScanner` in `configSearch.ts` returns the first file in the fixed `searchPlaces` order from
  `configLocations.ts`, so a folder always gives the same config.
- Draft PR [#9640](https://github.com/streetsidesoftware/cspell/pull/9640) makes `--stop-config-search-at` apply to the
  search for each file, inclusive, and keys the search cache by the stop set. It adds `stopConfigSearchAt` to
  `DocumentValidatorOptions` and `SpellCheckFileOptions`, both public.

### Exclusive stops

The `StopSearchAt` type also accepts a `StopAtLocation`, alone or in the array:

```ts
interface StopAtLocation {
  url: URL;
  exclusive?: boolean;
}
```

- A plain URL or string is inclusive, and so is a `StopAtLocation` without `exclusive: true`. "Inclusive unless marked"
  is one rule for both forms.
- When `exclusive` is `true`, the search stops at that folder without looking in it.
- `cspell lint` passes the flag's folders as inclusive. With `--config`, it also passes the root and the named config's
  folder as exclusive, except the ones at or below a given stop. The set is worked out once at startup, and the walk
  stops at the first stop it meets. Both kinds go through `stopConfigSearchAt` in the two per-file calls.
- The flag can be given more than once (`collect` in `commandLint.ts`), so a file may sit under none of the given stops.
  It keeps the default.
- An exclusive folder goes in the walk's stop set, and the scan predicate in `ConfigSearch` skips it, so `cspell-io`
  doesn't change. The search cache key includes the kind.
- `StopAtLocation` is a new public type in `packages/cspell-lib/api/api.d.ts`.
- PR #9640 can merge as it is. Its field keeps the `StopSearchAt` type, and the wider type comes with the feature PR.

### Defaults and edge cases

- `CSPELL_CONFIG_PATH` gets the same default as `--config`.
- A config in `.config/` or `.vscode/` belongs to the folder above.
- Without `--config`, replacing the root's config changes nothing: the startup search already found the nearest config
  at or above the root.
- Imports don't replace the config of their folder. Imports from configs found per file would make results depend on
  the order files are checked, and `import` is for sharing settings.
- When the stop folder has no config, the walk still stops there. A config further up needs that folder named.
- A file outside the root never reaches the root on its walk, so configs above it still load. Left as is.

### Scenarios

Today was measured with a 10.5 build. Each config flagged its own word, so the reported words showed which configs were
merged. "A + B" means B is merged on top of A.

1. Simple project. `cspell.json`, `src/a.md`. From `.`, `cspell "**/*.md"`.
   - Today and proposed: `cspell.json`.
2. Nested config. `cspell.json`, `i18n/de/cspell.json`, `i18n/de/README.md`. From `.`, `cspell "**/*.md"`, with or
   without `--config cspell.json`.
   - Today and proposed: `cspell.json` + `i18n/de/cspell.json`.
3. Run from a subfolder. `cspell.json`, `pkg/a/README.md`. From `pkg/a`, `cspell "*.md"`.
   - Today and proposed: `cspell.json`.
4. Config above the project. `cspell.json`, `proj/README.md`, `proj/src/a.md`. From `proj`, `cspell "**/*.md"`.
   - Today and proposed: `cspell.json`.
   - Proposed with `--stop-config-search-at .`: no config.
5. Named config beside `cspell.json`. `cspell.json`, `cspell.custom.json`, `README.md`. From `.`,
   `cspell --config cspell.custom.json "*.md"`.
   - Today: `cspell.custom.json` + `cspell.json`.
   - Proposed: `cspell.custom.json`.
6. Named config in the current directory, `cspell.json` above. `cspell.json`, `pkg/a/cspell.custom.yaml`,
   `pkg/a/README.md`. From `pkg/a`, `cspell --config cspell.custom.yaml "*.md"`.
   - Today: `cspell.custom.yaml` + `cspell.json`.
   - Proposed: `cspell.custom.yaml`.
   - Proposed with `--stop-config-search-at .`: `cspell.custom.yaml`. There's no config at `.`.
   - Proposed with `--stop-config-search-at ../..`: same as today.
7. Named config in a subfolder. `cspell.json`, `ci/cspell.ci.json`, `src/a.md`, `pkg/cspell.json`, `pkg/b.md`. From
   `.`, `cspell --config ci/cspell.ci.json "**/*.md"`.
   - Today: `src/a.md` gets `ci/cspell.ci.json` + `cspell.json`. `pkg/b.md` gets `ci/cspell.ci.json` +
     `pkg/cspell.json`.
   - Proposed: `src/a.md` gets `ci/cspell.ci.json`. `pkg/b.md` is unchanged.
8. Named config above the root. `cspell.json`, `pkg/a/cspell.json`, `pkg/a/README.md`. From `pkg/a`,
   `cspell --config ../../cspell.json "*.md"`.
   - Today: `cspell.json` + `pkg/a/cspell.json`.
   - Proposed: `cspell.json`.
   - Proposed with `--stop-config-search-at .`: same as today.
9. Named config outside the project. `configs/cspell.json`, `proj/cspell.json`, `proj/README.md`. From `proj`,
   `cspell --config ../configs/cspell.json "*.md"`.
   - Today: `configs/cspell.json` + `proj/cspell.json`.
   - Proposed: `configs/cspell.json`.
10. Two configs in one folder. `pkg/cspell.json`, `pkg/cspell.config.yaml`, `pkg/a.md`. From `.`.
    - Today and proposed, `cspell "**/*.md"`: `pkg/cspell.json`. It comes first in `searchPlaces`.
    - Today, `cspell --config pkg/cspell.config.yaml "**/*.md"`: `pkg/cspell.config.yaml` + `pkg/cspell.json`.
    - Proposed, same command: `pkg/cspell.config.yaml`.
11. File outside the root. `cspell.json`, `pkg/a/cspell.custom.yaml`, `pkg/b/b.md`. From `pkg/a`,
    `cspell --config cspell.custom.yaml ../b/b.md`.
    - Today and proposed: `cspell.custom.yaml` + `cspell.json`.
12. No config search. `cspell.json`, `cspell.custom.json`, `src/a.md`. From `.`,
    `cspell --config cspell.custom.json --no-config-search "**/*.md"`.
    - Today and proposed: `cspell.custom.json`.
13. A stop below the root. `cspell.json`, `cspell.ci.json`, `packages/a/cspell.json`, `packages/a/x.md`, `src/x.md`.
    From `.`, `cspell --config cspell.ci.json --stop-config-search-at packages/a "**/*.md"`.
    - Today: `packages/a/x.md` gets `cspell.ci.json` + `packages/a/cspell.json`. `src/x.md` gets `cspell.ci.json` +
      `cspell.json`.
    - Proposed: `packages/a/x.md` is unchanged. `src/x.md` gets `cspell.ci.json`.

In scenario 4, `cspell.json` sits in the parent folder of `proj`, outside the project.
