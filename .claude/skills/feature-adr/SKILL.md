---
name: feature-adr
description: 'Design a cspell feature or change (a new or changed config option, CLI flag or command, public API, or checking behavior) through a short interview that settles the overall design first, in one of two ways: capture a large feature at a high level to finish later, or check a small feature or bug fix before building it, to make sure it works as expected and to catch side effects. Records decisions as ADRs under docs/ADRs/<feature>/ when they are worth keeping, and otherwise drafts design notes for the PR. Use this whenever the user wants to design, spec out, or plan a change, is unsure how an edge case should behave, wants to check a fix for side effects, or asks for an ADR, a design doc, or to "figure out the details" of something, even without saying "ADR". Also use it to update a merged ADR when the design changes, or to archive a shipped feature''s ADRs into a short summary. Do not use it for refactors, dependency updates, or changes whose behavior is already fully specified.'
---

# feature-adr

The goal is a well-designed feature. ADRs are a tool for getting there, not a deliverable. Aim for a good design
quickly, not a perfect one: settle the overall shape first, spend time only on the details that could change it, and
stop when the rest is easier to answer by writing the code. The user writes the code. If the interview drifts into
detail, step back to the sketch.

Runs the ADR process in `docs/ADRs/README.md` as a short interview. Read that README and `docs/ADRs/template.md`
first: they define the two ways to use it, the layout, statuses, finalizing, changing a merged design, archiving, the
relationship to `rfc/`, and the link rules. This skill adds how to run the interview and when to commit.

Much of what a feature decides becomes public the moment it ships, and is hard to take back: option and flag names,
defaults, how an option merges across config files, what gets flagged, and public API. The interview surfaces those
decisions while they're still cheap to change. Everything else can be settled in the code.

## Workflow

1. **Pick the mode.** Say in one line which way fits, and let the user confirm or switch:
   - **Capture for later:** a large feature, designed at a high level while the ideas are fresh, to be finished later.
   - **Check before building:** a small feature or fix, checked to make sure it works as expected and to catch side
     effects.

   Switch modes in one line if the change turns out bigger or smaller than it looked. Check mode follows
   [Check mode](#check-mode) instead of steps 2–8, unless it finds a decision that's hard to undo.

2. **Name the feature and set up a branch.**
   - Ask for a short kebab-case slug if the user hasn't given one (for example `ignore-regex-per-language`).
     It names the folder and the branch. Confirm it before creating files.
   - Set up the branch and worktree before writing anything, so the design never sits as uncommitted changes in the
     user's checkout. Check for existing ones first, in case this continues an earlier session:

     ```sh
     git worktree list
     git branch --list adr/<feature>
     ```

     If neither exists, create both from an up-to-date `origin/main`:

     ```sh
     git fetch origin main
     git worktree add -b adr/<feature> .claude/worktrees/adr-<feature> origin/main
     ```

   - If the branch exists without a worktree, attach it (without `-b`).
   - If the session was given a branch to work on (a cloud session, for example), use that branch and skip the
     worktree.
   - Creating the worktree is local and reversible, so no need to ask first.
   - Open a draft `docs:` PR once the sketch is committed (step 5), and tell the user. It makes outside review easier
     and leaves a trail. Push each later commit to it.

3. **Start with why.** Add the feature's row to the Features table, with the status `Designing`, and create its
   `README.md` from `docs/ADRs/template.md`. Then ask, and write the answers in it:
   - What problem prompted this, and why now? If the first answer is a solution ("we need a new option") rather than a
     reason, ask "why?" until the reason is clear.
   - Who are the stakeholders, and how is each affected?
   - What does success look like, and what's out of scope?

4. **Prepare the sketch.**
   - Read `docs/design-principles.md`, `docs/glossary.md`, and `docs/ADRs/glossary.md`, and reuse existing terms.
   - Read `references/design-checks.md`. It lists what cspell already fixes, the principles, and where its
     hard-to-undo decisions hide. Check the design against it yourself; it isn't a list of questions to ask.
   - Check `rfc/` and closed issues for earlier proposals on the same idea. Link a matching RFC from the feature's
     `README.md`.

5. **Sketch the design.** Propose the shape of the solution in a few lines, agree on it, and write it in the README's
   Design section. Commit the feature's `README.md` with its Features row. Keep the sketch provisional: when a later
   detail shows a better shape, go back and change the sketch rather than solving around it.

6. **Settle the inflection points,** one at a time. Keep the goal in view: before each question, know how it connects
   to the sketch.
   - **The test.** A question gets discussed only if its answer could change the sketch, or is hard to undo once it
     ships (names, defaults, merging, what gets flagged, public API). For anything else, state your default in one
     line and wait for a quick yes or a correction. When you aren't sure which kind a question is, ask.
   - **How to ask.** Options labelled (a), (b), …, each with what the user writes or sees: the config snippet or the
     command line, and what cspell reports. Put your recommendation first and say why. Check facts in the code first,
     and bring the result. If an answer covers only part of the question, ask about the rest.
   - **Research.** When a question turns on facts outside the repo, such as how other tools handle it, a library's
     behavior, or a standard, offer to research it. Keep it short, and bring a summary with sources back to the
     question. What shaped a decision goes in that ADR's Context. In capture mode, findings worth keeping for later go
     in the feature's `README.md`.
   - **Tangents and side remarks.** Keep them short. Note one in a line under Open questions and move on. Don't come
     back to it during the design. A side remark that sounds like a standing rule is recorded where it belongs at
     finalize.

   Write each ADR short as it's decided: the goal it serves, the Decision, and a line or two on what shaped it. Commit
   it together with its row in the feature's `README.md`, one commit per ADR change, for example
   `docs: ignore-regex-per-language ADR 0002, overrides replace the list`. Check the existing files first, in case this
   resumes an earlier session. Restructure the ADRs whenever they stop reading as one line from the Why. Keep the
   glossaries current as terms come up, by the README's rules.

7. **Stop when the code is the easier answer.** When the remaining questions are easier to answer by writing the
   code, say so in a line, note each one under Open questions, and stop. The user writes the code. Don't start building
   unless asked. Offer to look at a change's implications, review the code, or clean up afterward. When a question would
   be answered faster by a quick experiment than by discussion, suggest one. When the code shows something the design
   missed, come back and update the sketch and the ADRs. If the code lands on the design's branch, retitle the PR
   `feat:` or `fix:`.

8. **Finalize** when the user says the design is final:
   - Rewrite the ADRs as the README's "Finalize before merge" describes, filling in the sections they need. Update the
     index and glossary links, and commit on the same branch.
   - Settle or drop each open question in a line. Record a standing rule from a side remark where it applies:
     `docs/design-principles.md`, or another doc in `docs/`. Propose an issue only for a real problem someone would
     act on, and let the user decide.
   - Start a subagent that is given only the paths of the feature's `README.md` and its ADRs. Ask it to say what gets
     built, why, and how the decisions fit together, and to list gaps, contradictions, and anything it had to guess.
   - Show the user the subagent's report, and fix what they agree with.
   - **Capture mode:** the open questions stay, each with what it depends on. The ADRs stay `Proposed`, and the
     feature stays `Designing`. Ask the subagent whether it could pick the design up.

9. **Change or archive** when asked, or when step 10 finds a feature due:
   - **Change:** follow the README's "Changing a merged design".
   - **Archive:** work on an `adr-archive/<feature>` branch, as in step 2. Follow the README's "Archiving".
     - Note the last commit on `main` that has the full ADRs, for the permalink.
     - Search the repo for links into the feature's folder (docs, code comments, other ADRs). Links should already
       point to the feature's `README.md`. Fix any that point at a single ADR.
     - Move anything still in force to its long-term home before deleting a file.
     - Open a PR, so the user reviews the summary before the detail leaves the tree.

10. **Check for features due for archiving** at the end. If a feature in the Features table shipped three or more
    months ago and isn't archived, offer in one line to archive it.

## Check mode

For a small feature or fix. Keep it to a few minutes of the user's time.

1. Work on the branch the change is built on. No feature folder.
2. Agree on the why in a sentence or two, and the sketch in a few lines.
3. Read `references/design-checks.md`, and check the change against it. Report every side effect you find, with what
   it would change for users. Settle anything that could change the sketch, the same way as step 6.
4. If a decision is hard to undo once it ships (a name, a default, what gets flagged, public API), create a short
   feature folder for it on the same branch, and say so. Follow steps 3–8 for it, but skip the worktree and the
   draft `docs:` PR: the folder goes in the change's own PR.
5. Stop when the rest is easier to answer in code, as in step 7. As you stop, draft the design notes for the PR and
   give them to the user: a Technical Details block when users would care, written for them as
   `docs/pull-requests.md` describes, or a PR comment when only reviewers would.

There's no fresh-reader check without a feature folder: the PR review covers it.

## Notes

- If the request turns out to be fully specified, say so and stop.
- If the feature is large enough for public discussion with users, suggest an RFC in `rfc/` first. ADRs record the
  decisions either way.
- ADRs are for people. They never point to `AGENTS.md` or `CLAUDE.md`.
