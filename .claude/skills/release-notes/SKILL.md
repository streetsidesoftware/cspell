---
name: release-notes
description: 'Correct a merged PR''s entry in the upcoming cspell release notes when its title, label, or body turned out wrong: a PR merged as `fix:`/`feat:` that should have been `chore:`/`refactor:`, a `fix:` that is really a new capability, a body written for reviewers instead of users, or a "Generated with ..." line. Works by editing the merged PR''s title, labels, and body, then re-running the Release Drafter workflow, which rebuilds the draft release, the CHANGELOG files, and the Prepare Release PR. Use this whenever the user asks to fix, reclassify, hide, or reword a PR''s release notes or changelog entry, or to audit the open "chore: Prepare Release ... (auto-deploy)" PR for entries that do not belong. Trigger even without the words "release notes": "that PR should not have been a fix", "the changelog has internal stuff in it", "can we reclassify #9244" are all candidates. Does not rewrite git history.'
---

# release-notes

Corrects entries in the next release's notes by fixing the merged PRs they come from. Read `docs/releasing.md` first:
it describes how titles become labels and sections, and how the release notes are built. This skill adds the audit and
the order of work.

## Why this works

The Release Drafter workflow rebuilds the draft release on every push to `main`, and whenever it's run by hand. Each
time, it reads every merged PR's current title, body, and labels. So a fix to the merged PR shows up in the draft, the
`CHANGELOG.md` files, and the Prepare Release PR on the next run. Nothing in git history changes.

The label decides the section, not the title. The labeler doesn't run when a PR is renamed, so a new title needs its
label changed by hand.

This only works until the Prepare Release PR that contains the entry is merged. After that, the release is published:
tell the user, and stop.

## Who the release notes are for

People who use the cspell command-line tool, its config, and its packages. They skim for changes that affect them.
Judge every entry by that reader. The rules are in `CONTRIBUTING.md` under "Pull requests".

## Workflow

### 1. Scope: one PR, or an audit

- The user names a PR ("fix #9244's release note") → go to step 3.
- The user asks to review the upcoming release → do step 2 first.

### 2. Audit the upcoming release

Find the open Prepare Release PR and read its body, which contains the release notes:

```sh
gh pr list --head release-draft --json number,title,body
```

For each entry:

- **Would someone using cspell notice it?** If not, it belongs under a type that's left out, such as `chore:` or
  `refactor:`. Reclassifying removes it from the release notes; it doesn't just move it.
- **Is it in the right section?** A Features entry must be a new capability. A change to existing behavior is `fix:`.
  A breaking change needs `!` and the `breaking` label.
- **Is the body written for users?** Flag bodies written for reviewers, test plans, and tool attribution lines.
- **Bot PRs** (`Workflow Bot -- ...`) keep the type they were opened with. Never propose a lower one.

Present the flagged entries with your reasoning and PR numbers, and get the user's confirmation on which to correct
before touching anything. This is a reading of summaries, not a diff review, so a human makes the call.

### 3. Decide the correction

For each PR, decide what changes, using the table in `docs/releasing.md`:

- **Title:** the corrected `type: description`. For a type in the release notes, write the description for users.
  Keep the original wording unless it was also unclear: the goal is the right category, not a rewrite.
- **Labels:** the label the new title would get, replacing the old one. For example, `refactor:` gets `refactor`
  instead of `fix`, and a breaking change also gets `breaking`.
- **Body:** only if it's wrong for its reader. Keep the author's content; remove or rewrite only what doesn't belong.

### 4. Edit the PR

Fetch the current title, body, and labels first:

```sh
gh pr view <N> --json title,body,labels
```

Show the user the new title, the label changes, and a diff of the body, and confirm before applying. Editing a merged
PR is visible to anyone who reads it later.

```sh
gh pr edit <N> --title "<new title>" --add-label <new> --remove-label <old>
gh pr edit <N> --body-file <file>
```

### 5. Rebuild the draft

The fix appears on the next push to `main`. Offer to run the workflow now, and confirm first, since it updates the
Prepare Release PR that others may be watching:

```sh
gh workflow run release-drafter.yml
```

Point the user at the run, and once it finishes, check that the Prepare Release PR's body shows the corrected entry.

## Notes

- Never edit the `release-draft` branch, the Prepare Release PR, the `CHANGELOG.md` files, or `.release.json`: every
  run regenerates them.
- If the same mistake keeps happening, the fix may belong in the rules: `.github/release-drafter.yml` (see
  `docs/releasing.md`, "Changing the rules") or `CONTRIBUTING.md`. Suggest it; don't change it as part of this skill.
