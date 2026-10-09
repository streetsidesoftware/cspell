---
name: feature-adr
description: 'Design a cspell feature (a new or changed config option, CLI flag or command, public API, or checking behavior) through a structured interview, recording each decision as an ADR under docs/ADRs/<feature>/ and keeping the glossaries in sync. Use this whenever the user wants to design, spec out, or plan a feature before writing code, is unsure how an edge case should behave, or asks for an ADR, a design doc, or to "figure out the details" of something. Trigger even if the user does not say "ADR" by name: any request to add behavior to cspell that has more than one reasonable interpretation is a candidate. Also use it to update a merged ADR when the design changes, or to archive a shipped feature''s ADRs into a short summary. Do not use it for pure bug fixes, refactors, dependency updates, or changes whose behavior is already fully specified.'
---

# feature-adr

The goal is a well-designed feature. ADRs are a tool for getting there, not a deliverable.

Runs the ADR process in `docs/ADRs/README.md` as an interview. Read that README and `docs/ADRs/template.md` first: they
define the layout, statuses, finalizing, changing a merged design, archiving, the relationship to `rfc/`, and the link
rules. This skill adds how to run the interview and when to commit.

Much of what a feature decides becomes public the moment it ships, and is hard to take back: option and flag names,
defaults, how an option merges across config files, what gets flagged, and public API. The interview surfaces those
decisions while they're still cheap to change.

## Workflow

1. **Check for features due for archiving.** Read the Features table in `docs/ADRs/README.md`. If a feature shipped
   three or more months ago and isn't archived, tell the user and offer to archive it (step 10). Then continue with what
   they asked for.

2. **Establish the feature slug.** Ask for a short kebab-case name if the user hasn't given one (for example
   `ignore-regex-per-language`). It names the folder and the branch. Confirm it before creating files.

3. **Set up a branch and worktree before writing anything,** so the design never sits as uncommitted changes in the
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
   - Open a draft PR once the first ADR is committed, and tell the user. It makes outside review easier and leaves a
     trail. Push each later commit to it.

4. **Prepare.**
   - Add the feature's row to the Features table, and create its `README.md` from `docs/ADRs/template.md`.
   - Read `docs/design-principles.md`, `docs/glossary.md`, and `docs/ADRs/glossary.md`. Weigh every option against
     the principles, and reuse existing terms.
   - Check `rfc/` and closed issues for earlier proposals on the same idea. Link a matching RFC from the feature's
     `README.md`, and cite what's relevant in the first ADR's Context.

5. **Interview, starting with why.** Before any option, ask:
   - What problem prompted this, and why now? Offer the five whys: ask "why?" of each answer until the underlying
     reason is clear.
   - Who are the stakeholders, and how is each affected?
   - What does success look like, and what's out of scope?

   Write the answers in the feature's `README.md`. Then take the decisions one at a time. Read
   `references/interview-guide.md` before the first question: it's a menu of this repo's real decision points; skip
   what doesn't apply.

   How to ask:
   - **One question at a time.** Don't front-load a questionnaire. Move on only when the current one is resolved. If
     an answer covers only part of the question, ask about the rest. "You decide" is an answer: propose a default and
     state it as the decision.
   - **Options labelled (a), (b), …, each with what the user writes or sees.** Show the config snippet or the command
     line, and what cspell reports. Put your recommendation first and say why.
   - **Check facts before asking.** If an option depends on how cspell or the code behaves, find out first and bring
     the result to the question.
   - **Let the user defer.** Record the question under Open questions, and come back to it before closing the loop.
   - **Capture side remarks as rules.** A remark made in passing is often a standing rule. Confirm it, then record it
     where it applies: `docs/design-principles.md`, or another doc in `docs/`.

   A question with only one reasonable answer once you look at the code isn't an ADR. Note it and move on.

6. **Write and commit each ADR as it's decided,** following the README's layout and statuses. Commit it together with
   its row in the feature's `README.md`, one commit per ADR change, for example
   `docs: ignore-regex-per-language ADR 0002, overrides replace the list`. Check the existing files first, in case
   this resumes an earlier session.

   Restructure the ADRs whenever they stop reading as one line from the Why, as the README's "Decide one thing at a
   time" describes. Don't wait for step 9.

7. **Keep the glossaries current as terms come up,** by the README's rules. Link entries to the feature's `README.md`,
   never to a single ADR. Commit glossary edits as they happen.

8. **Close the loop** once the open questions are exhausted:
   - Summarize what was decided, one line per ADR, and point at the feature's `README.md`.
   - Say plainly what was left open.
   - List names still marked provisional. Each needs a decision, or a tracking issue that says when it must be decided.
   - Say what implementing it will require: for a config option or CLI flag, `docs/config-and-cli.md` and the
     `config-option` or `cli-option` skill.
   - Tell the user where the work lives: the branch, and the worktree path if there is one.
   - The skill stops at the design. If a question is easier to answer by trying it, a quick prototype is fine.

9. **Finalize** when the user says the design is final:
   - Rewrite the ADRs as the README's "Finalize before merge" describes, including the Why, the Goal, and What we
     learned. Update the index and glossary links, and commit on the same branch.
   - Start a subagent that is given only the paths of the feature's `README.md` and its ADRs. Ask it to say what gets
     built, why, and how the decisions fit together, and to list gaps, contradictions, and anything it had to guess.
   - Show the user the subagent's report, and fix what they agree with.
   - Ask whether the design gets its own `docs:` PR or goes in the feature's PR, as the README's "Branches" describes.

10. **Change or archive** when asked, or when step 1 finds a feature due:
    - **Change:** follow the README's "Changing a merged design".
    - **Archive:** work on an `adr-archive/<feature>` branch, as in step 3. Follow the README's "Archiving".
      - Note the last commit on `main` that has the full ADRs, for the permalink.
      - Search the repo for links into the feature's folder (docs, code comments, other ADRs). Links should already
        point to the feature's `README.md`. Fix any that point at a single ADR.
      - Move anything still in force to its long-term home before deleting a file.
      - Open a PR, so the user reviews the summary before the detail leaves the tree.

## Notes

- If the interview shows the request is really a bug fix or a fully specified change, say so and stop.
- If the feature is large enough for public discussion with users, suggest an RFC in `rfc/` first. ADRs record the
  decisions either way.
- ADRs are for people. They never point to `AGENTS.md` or `CLAUDE.md`.
