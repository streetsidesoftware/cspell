---
name: feature-design
description: 'Design a cspell feature before and while building it, through a short interview that writes a single design file under docs/designs/, or check a small change for side effects before it is built. Use when the user asks to design, spec, or think through a feature, asks for a design doc, or accepts a suggestion from config-option, cli-option, or a reviewer to design first. Also use when the user asks to check a change for side effects. Never start it unprompted: when a change makes a public, hard-to-undo choice with more than one reasonable answer, suggest it in one line and let the user decide. Not for refactors, dependency updates, or fully specified changes.'
---

# feature-design

Runs the process in `docs/designs/README.md` as a short interview. Read that README first: it holds the process. This
skill adds only how to run it.

Aim for a good design quickly, not a perfect one. Whoever builds the feature writes the code. If the interview drifts
into detail, step back to the sketch.

## Design a feature

1. **Set up a branch.** Propose a short kebab-case slug, such as `ignore-regex-per-language`, and use it unless the user
   objects. It names the file and the branch. Set up the branch and worktree before writing anything, so the design
   never sits as uncommitted changes in the user's checkout. Check for an earlier session's work first:

   ```sh
   git worktree list
   git branch --list <feature>
   ls docs/designs/
   ```

   If none exists, create the branch and worktree from an up-to-date `origin/main`. This is local and reversible, so
   no need to ask:

   ```sh
   git fetch origin main
   git worktree add -b <feature> .claude/worktrees/<feature> origin/main
   ```

   - If the branch exists without a worktree, attach it (without `-b`).
   - If the session was given a branch to work on (a cloud session, for example), use it and skip the worktree.
   - Don't push or open a PR unless asked. Offer one when the user wants feedback before building.

2. **Draft the why.** Start from the problem as the user states it. Look up the facts first: the issue, the code, a
   reproduction. Then propose the why in one or two lines: who is affected, and what they can't do today or what goes
   wrong. Let the user correct it. If the draft still reads like a solution ("we need an option"), ask "why does that
   matter?" and redraft. Repeat, as in the five whys, until it reaches the reason.

3. **Sketch.** Read `docs/design-principles.md`, `docs/glossary.md`, and `references/design-checks.md`. Look in `rfc/`
   and closed issues for earlier proposals, and link a matching RFC. Propose the sketch in a few lines and agree on it.
   Write `docs/designs/<feature>.md` with the README's skeleton, and commit it.

   Check the sketch against the design checks yourself. They aren't questions to ask. Bring up a finding only when it
   could change the sketch or is hard to undo once it ships.

4. **Settle the inflection points** one at a time. Before each question, know how it connects to the sketch.
   - **The test.** Discuss a question only if its answer could change the sketch, or is hard to undo once it ships.
     For anything else, state your default in one line and wait for a quick yes or a correction. When you aren't sure
     which kind a question is, ask.
   - **How to ask.** Options labelled (a), (b), …, each with what the user writes or sees: the config snippet or the
     command line, and what cspell reports. Put your recommendation first and say why. Check facts in the code first,
     and bring the result. If an answer covers only part of the question, ask about the rest.
   - **Research.** When a question turns on facts outside the repo, offer to research it. Keep it short, and bring a
     summary with sources back to the question.
   - **Tangents and side remarks.** Note each in a line under Open questions and move on. A remark that sounds like a
     rule beyond this feature goes there too.
   - **Record.** Update the Design section as each point is settled, with the alternatives turned down. Commit when it's
     useful, not per decision.

5. **Stop when the code is the easier answer.** Say so in a line, and stop. Don't start building unless asked. Offer to
   look at a change's implications, review the code, or clean up afterward. During implementation, update the file when
   the code shows something the design missed.

6. **Trim before merge,** when the user says the design is done, as in the README's "Before merge".
   - Write the `tl;dr`, add the snapshot line, cut the Design section to what the code can't say, and collapse a folder
     to its `README.md`.
   - List the open questions, and settle or drop each with the user. Propose an issue only for a real problem someone
     would act on.
   - List side remarks that might be standing rules, and let the user pick which go into `docs/design-principles.md` or
     another doc. A rule that could affect other designs gets its own `docs:` PR.
   - Start a subagent that is given only the path of the trimmed file. Ask it to say what the feature does, why, and why
     it's shaped that way, and to list anything it had to guess or found contradictory. Show the user its report, and
     fix what they agree with.
   - If the code is on the same branch, check that the PR is titled `feat:` or `fix:` and its body is written for the
     release notes.

## Check a change

For a small feature or fix, when the user asks to check it before or while building. No design file, no interview, and
a few minutes of the user's time.

1. State the change and its why in a sentence or two, from the conversation, the issue, and the code.
2. Check it against `references/design-checks.md`. List every side effect you find, with what it would change for
   users.
3. Raise anything that could change the approach or is hard to undo, as in step 4's test. If a hard-to-undo choice with
   more than one reasonable answer turns up, suggest designing it, in one line.
4. When users would notice the change, draft a Technical Details block for the PR, written for them as
   `docs/pull-requests.md` describes.

## Notes

- If the request turns out to be fully specified, say so and stop.
- If the feature is large enough for public discussion with users, suggest an RFC in `rfc/` first.
- Designs are for people. They never point to `AGENTS.md` or `CLAUDE.md`.
