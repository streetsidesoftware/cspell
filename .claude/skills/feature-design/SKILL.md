---
name: feature-design
description: 'Design a cspell feature before and while building it, through an interview that writes a design under docs/designs/ (one file, or a folder for a large feature), or check a small change for side effects before it is built. Use when the user asks to design, spec, or think through a feature, asks for a design doc, or accepts a suggestion from config-option, cli-option, or a reviewer to design first. Also use when the user asks to check a change for side effects. Never start it unprompted: when a change makes a public, hard-to-undo choice with more than one reasonable answer, suggest it in one line and let the user decide. Not for refactors, dependency updates, or fully specified changes.'
---

# feature-design

The goal is a well-designed feature. The design file is a tool for getting there, and a by-product of the interview.

Runs the process in `docs/designs/README.md` as an interview that drills down into the parts of a feature that matter.
Read that README first: it holds the process. This skill adds only how to run it.

Aim for a good design quickly, not a perfect one. Whoever builds the feature writes the code. If the interview drifts
into detail, step back to the sketch.

## Design a feature

1. **Set up a branch.** Propose a short kebab-case slug, such as `ignore-regex-per-language`, and use it unless the user
   objects. It names the design and the branch. Set up the branch and worktree before writing anything, so the design
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

2. **The why, with the user.** Start from the problem as the user states it. Look up the facts first: the issue, the
   code, a reproduction. Then propose the why in one or two lines: who is affected, and what they can't do today or
   what goes wrong. Let the user correct it. If the draft still reads like a solution ("we need an option"), ask "why
   does that matter?" and redraft. Repeat, as in the five whys, until it reaches the reason. Then ask, one at a time,
   proposing an answer where the facts suggest one:
   - Why now: a bug report, a feature request, a limit hit while building something else?
   - Who is affected, and how? Start from the stakeholders in `docs/designs/checks.md`.
   - What does success look like, as something a user can do or a config they can write, that they can't today?
   - What's out of scope?

3. **Sketch.** Read `docs/design-principles.md`, `docs/glossary.md`, and `docs/designs/checks.md`. Look in `rfc/` and
   closed issues for earlier proposals, and link a matching RFC. Propose the sketch in a few lines, with one example:
   what a user writes (the config or the command line) and what cspell does. Agree on it. Write
   `docs/designs/<feature>.md` with the README's skeleton, and commit it. When a part can be read on its own, move to a
   folder as the README's "Where it lives" describes, and say so in a line.

4. **Walk the design checks with the user,** one question at a time. Go through the relevant groups in
   `docs/designs/checks.md`, and skip a group only when it obviously doesn't apply. Before each question, know how it
   connects to the sketch.
   - **The test** decides how much time a question gets, not whether the user hears it. A question whose answer could
     change the sketch, or would be hard to undo once it ships, gets discussed. For anything else, propose a default in
     one line and wait for a quick yes or a correction. When you aren't sure which kind a question is, ask.
   - **How to ask.** Options labelled (a), (b), …, each with what the user writes or sees: the config snippet or the
     command line, and what cspell reports. Put your recommendation first and say why. Check facts in the code first,
     and bring the result. If an answer covers only part of the question, ask about the rest.
   - **Research.** When a question turns on facts outside the repo, offer to research it. Keep it short, and bring a
     summary with sources back to the question.
   - **Tangents and side remarks.** Note each in a line under Open questions and move on. A remark that sounds like a
     rule beyond this feature goes there too.
   - **Record.** Update the Design section as each point is settled, with the alternatives turned down. Commit when it's
     useful, not per decision. Define new terms as the README's "The file" describes.

5. **Stop when the code is the easier answer.** Say so in a line, and stop. Don't start building unless asked. Offer to
   look at a change's implications, review the code, or clean up afterward. During implementation, update the design
   when the code shows something it missed.

6. **Finish before merge,** when the user says the design is done, as in the README's "Before merge".
   - Write the `tl;dr`, add the snapshot line, and make the Design section describe the feature as built, with
     examples. A reader must understand it without the code. Remove working notes and code-level detail, not the
     explanation. In a folder, finish each file the same way.
   - List the open questions, and settle or drop each with the user. Propose an issue only for a real problem someone
     would act on.
   - List side remarks that might be standing rules, and let the user pick which go into `docs/design-principles.md` or
     another doc. A rule that could affect other designs gets its own `docs:` PR.
   - Start a subagent that is given only the paths of the design, and told not to read the code. Ask it to say what the
     feature does, how it behaves, why, and why it's shaped that way, and to list anything it had to guess or found
     contradictory. Show the user its report, and fix what they agree with.
   - If the code is on the same branch, check that the PR is titled `feat:` or `fix:` and its body is written for the
     release notes.

## Check a change

For a small feature or fix, when the user asks to check it before or while building. No design file, no interview, and
a few minutes of the user's time.

1. State the change and its why in a sentence or two, from the conversation, the issue, and the code.
2. Check it against `docs/designs/checks.md`. List every side effect you find, with what it would change for
   users.
3. Raise anything that could change the approach or is hard to undo, as in step 4's test. If a hard-to-undo choice with
   more than one reasonable answer turns up, suggest designing it, in one line.
4. When users would notice the change, draft a Technical Details block for the PR, written for them as
   `docs/pull-requests.md` describes.

## Notes

- If the request turns out to be fully specified, say so and stop.
- If the feature is large enough for public discussion with users, suggest an RFC in `rfc/` first.
- Designs are for people. They never point to `AGENTS.md` or `CLAUDE.md`.
