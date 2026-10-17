---
title: 'Using CSpell with Coding Agents'
sidebar_label: Coding Agents
---

# Using CSpell with Coding Agents

Coding agents, such as Claude Code, GitHub Copilot, or Cursor, can run CSpell the same way you do. This page lists the commands that work well for an agent, and ends with instructions you can paste into your project's agent file.

Every command here reads your project's CSpell configuration, so the agent gets the same results as your editor and CI.

## Check files

Check the files the agent changed:

```sh
npx cspell --no-progress src/user.ts src/api.ts
```

Or check every file changed since the last commit, leaving out deleted files:

```sh
git diff --name-only --diff-filter=d HEAD | npx cspell --no-progress --no-must-find-files --file-list stdin
```

Each issue is one line, with the file, line, column, the unknown word, and a fix when CSpell is confident about one. The last line is a summary:

```text
src/user.ts:1:7 - Unknown word (recieve) fix: (receive)
src/user.ts:1:14 - Unknown word (Mesage) fix: (Message)
CSpell: Files checked: 2, Issues found: 2 in 1 file.
```

CSpell exits with code `1` when it finds issues.

Keep the summary line. When there are no issues, it is the only way to tell "checked and clean" from "nothing was checked."

### Files excluded by the configuration

Files that the configuration excludes, for example with `ignorePaths`, are skipped without a message. The summary counts them:

```text
CSpell: Files checked: 0, skipped: 1, Issues found: 0 in 0 files.
```

This is usually what you want: excluded files are often test fixtures or generated files. To check an excluded file anyway, use `--force-check` with `--file` or `--file-list`:

```sh
npx cspell --no-progress --force-check --file gen/schema.ts
```

The `--force-check` flag doesn't work with `stdin://`.

This output is compact, which keeps an agent's context small. Two alternatives:

- Add `--words-only --unique` to get just the list of unknown words, each word once.
- Add `--reporter @cspell/cspell-json-reporter` for JSON, which includes the position, the line, and suggestions for every issue. It is much longer, so use it when a script reads the result rather than the agent.

## Check text before writing it

An agent can check a new name or a paragraph before it writes it into a file. Pipe the text to CSpell, and give the path the text is meant for after `stdin://`. The path sets the file type and the configuration, so the check matches what CSpell will report once the text is in that file. The file doesn't need to exist.

```sh
echo 'function fetchUserNmae() {}' | npx cspell --no-progress --show-suggestions stdin://src/user.ts
```

```text
src/user.ts:1:19 - Unknown word (Nmae) Suggestions: [name*, Name, Nae, mae, Mae]
CSpell: Files checked: 1, Issues found: 1 in 1 file.
```

This catches a misspelled identifier before it spreads through the code.

## Understand a word

To see why a word is or isn't accepted, use `trace`. It lists the dictionaries that contain the word, and shows when a dictionary of common misspellings knows the right spelling:

```sh
npx cspell trace --only-found recieve
```

```text
Word               F Dictionary           Dictionary Location
recieve->(receive) - en-common-misspelli* node_modules/@cspell/dict-en-common-misspellings/dict/dict-en.json
```

To get suggestions for a word, use `suggest`:

```sh
npx cspell suggest recieve
```

## Fix or accept a word

When CSpell reports a word, the agent should decide in this order:

1. **Fix the spelling.** Most reported words are real mistakes.
1. **Add real project vocabulary to the project's custom dictionary.** Product names, domain terms, and abbreviations the project uses belong in a word list. Look in the CSpell configuration for the dictionary marked `addWords: true`, or for the `words` list. See [Custom Dictionaries](./dictionaries/custom-dictionaries.md).
1. **Ignore one-off words in place.** For a word that only makes sense in one file, add a `cspell:ignore` comment to that file:

   ```ts
   // cspell:ignore xyzzy
   ```

Agents should not:

- correct spelling in test fixtures, snapshots, or other data that is misspelled on purpose
- add a word to a dictionary just to make a check pass

## Instructions for your agent

Agents read instructions from a file in your project, such as `AGENTS.md`, `CLAUDE.md`, or `.github/copilot-instructions.md`. Paste this into it, and change the paths to fit your project:

```markdown
## Spelling

- Check changed files: `npx cspell --no-progress <files>`. The summary line says how many files were checked and skipped.
- Check a new identifier or text before writing it: `echo '<text>' | npx cspell --no-progress --show-suggestions stdin://<target-file>`
- Explain a word: `npx cspell trace --only-found <word>`
- Fix real misspellings. Add project vocabulary to the custom dictionary in the CSpell config (the one with `addWords: true`). For one-off words, use a `cspell:ignore` comment in that file.
- Do not correct spelling in test fixtures or snapshots, and do not add words to a dictionary just to make a check pass.
```

<!--- cspell:ignore recieve Mesage Nmae xyzzy misspelli --->
