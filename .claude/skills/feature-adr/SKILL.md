---
name: feature-adr
description: 'Design or check a cspell change before building it, through a short interview: capture a large feature at a high level to finish later, or check a small feature or fix for side effects. Records weighed decisions as ADRs under docs/ADRs/<feature>/. Use when the user asks to design, spec, or check a change, asks for an ADR or a design doc, or when config-option or cli-option hands over an open decision. Also updates a merged design or archives a shipped one. Not for refactors, dependency updates, or fully specified changes.'
---

# feature-adr

Runs the design process in `docs/ADRs/README.md` as a short interview. Read that README and `docs/ADRs/template.md`
first: they hold the process. This skill adds only how to run it.

Aim for a good design quickly, not a perfect one. The user writes the code. If the interview drifts into detail, step
back to the sketch.

## Workflow

1. **State the mode and start.** Say in one line which of the README's "Two ways to use it" fits, and begin. Switch in
   one line whenever the change turns out bigger or smaller than it looked. A check before building follows
   [Check mode](#check-mode) instead of steps 2–6.

2. **Set up a branch.** Propose a short kebab-case slug, such as `ignore-regex-per-language`, and use it unless the user
   objects. It names the folder and the branch. Set up the branch and worktree before writing anything, so the design
   never sits as uncommitted changes in the user's checkout. Check for an earlier session's work first:

   ```sh
   git worktree list
   git branch --list adr/<feature>
   ```

   If neither exists, create both from an up-to-date `origin/main`. This is local and reversible, so no need to ask:

   ```sh
   git fetch origin main
   git worktree add -b adr/<feature> .claude/worktrees/adr-<feature> origin/main
   ```

   - If the branch exists without a worktree, attach it (without `-b`).
   - If the session was given a branch to work on (a cloud session, for example), use it and skip the worktree.
   - Open a draft `docs:` PR once the sketch is committed (step 3), and tell the user. It makes outside review easier
     and leaves a trail. Push each later commit to it.

3. **Why and sketch,** as in the README's "Start with why" and "Sketch the design".
   - Ask for the why and the goal. If the first answer is a solution ("we need a new option") rather than a reason,
     ask "why?" until the reason is clear.
   - Fill in Stakeholders and Out of scope yourself when they aren't obvious, from `references/design-checks.md` and
     the conversation. Ask only when you're unsure.
   - Before the sketch, read `docs/design-principles.md`, `docs/glossary.md`, `docs/ADRs/glossary.md`, and
     `references/design-checks.md`. Check the design against the design checks yourself; they aren't questions to
     ask. Look in `rfc/` and closed issues for earlier proposals, and link a matching RFC.
   - Propose the sketch in a few lines and agree on it. Add the feature's row to the Features table, with the status
     `Designing`, and commit it with the feature's `README.md`.

4. **Settle the inflection points** one at a time, as in the README's step 3. Before each question, know how it
   connects to the sketch.
   - **The test.** Discuss a question only if its answer could change the sketch, or is hard to undo once it ships.
     For anything else, state your default in one line and wait for a quick yes or a correction. When you aren't sure
     which kind a question is, ask.
   - **How to ask.** Options labelled (a), (b), …, each with what the user writes or sees: the config snippet or the
     command line, and what cspell reports. Put your recommendation first and say why. Check facts in the code first,
     and bring the result. If an answer covers only part of the question, ask about the rest.
   - **Research.** When a question turns on facts outside the repo, offer to research it. Keep it short, and bring a
     summary with sources back to the question.
   - **Tangents and side remarks.** Note each in a line under Open questions and move on. Don't come back to it during
     the design.
   - **Commits.** Commit each short ADR with its row in the feature's `README.md`, one commit per ADR change, for
     example `docs: ignore-regex-per-language ADR 0002, overrides replace the list`. Check the existing files first,
     in case this resumes an earlier session. Keep the glossaries current, as in the README's step 5.

5. **Stop when the code is the easier answer,** as in the README's step 4. Say so in a line, and stop. The user writes
   the code: don't start building unless asked. Offer to look at a change's implications, review the code, or clean up
   afterward. If the code lands on the design's branch, retitle the PR `feat:` or `fix:`.

6. **Finalize** when the user says the design is final, or ready to capture, as in the README's "Finalize before
   merge".
   - Record a standing rule from a side remark where it applies: `docs/design-principles.md`, or another doc in
     `docs/`. Propose an issue only for a real problem someone would act on, and let the user decide.
   - Start a subagent that is given only the paths of the feature's `README.md` and its ADRs. Ask it to say what gets
     built, why, and how the decisions fit together, and to list gaps, contradictions, and anything it had to guess.
     For a captured design, also ask whether it could pick the design up.
   - Show the user the subagent's report, and fix what they agree with.

7. **Change or archive** when asked, as in the README's "Changing a merged design" and "Archiving". To archive, work
   on an `adr-archive/<feature>` branch, as in step 2:
   - Note the last commit on `main` that has the full ADRs, for the permalink.
   - Search the repo for links into the feature's folder. Fix any that point at a single ADR instead of its
     `README.md`.
   - Move anything still in force to its long-term home before deleting a file.
   - Open a PR, so the user reviews the summary before the detail leaves the tree.

## Check mode

For a small feature or fix. Keep it to a few minutes of the user's time.

1. Work on the branch the change is built on. If there isn't one yet, set one up as in step 2, named for the change.
   No feature folder.
2. Agree on the why in a sentence or two, and the sketch in a few lines.
3. Read `references/design-checks.md`, and check the change against it. Report every side effect you find, with what
   it would change for users. Settle anything that could change the sketch, using step 4's test and way of asking.
4. Create a short feature folder only when the README's "Two ways to use it" calls for one: a hard-to-undo decision
   with more than one reasonable option, weighed. Say so, and follow steps 3–6 for it on the same branch, without the
   worktree or the draft `docs:` PR.
5. Stop as in step 5. As you stop, draft the design notes for the PR and give them to the user: a Technical Details
   block when users would care, written for them as `docs/pull-requests.md` describes, or a PR comment when only
   reviewers would.

There's no fresh-reader check without a feature folder: the PR review covers it.

## Notes

- If the request turns out to be fully specified, say so and stop.
- If the feature is large enough for public discussion with users, suggest an RFC in `rfc/` first. ADRs record the
  decisions either way.
- ADRs are for people. They never point to `AGENTS.md` or `CLAUDE.md`.
