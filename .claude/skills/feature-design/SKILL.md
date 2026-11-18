---
name: feature-design
description: 'Design a cspell feature before and while building it, through an interview that settles the overview before the details and writes a design and working notes in a folder under docs/designs/, or check a small change for side effects before it is built. Use when the user asks to design, spec, or think through a feature, asks for a design doc, or accepts a suggestion from config-option, cli-option, or a reviewer to design first. Also use when the user asks to check a change for side effects, or to change a merged design. Never start it unprompted: when a change makes a public, hard-to-undo choice with more than one reasonable answer, suggest it in one line and let the user decide. Not for refactors, dependency updates, or fully specified changes.'
---

# feature-design

Settles a design with the user: the overview first, then the details, each explored before it's decided. The goal is a
well-designed feature; the design and the working notes are by-products. Read `docs/feature-design.md` first: it holds
the process, and this skill adds only how to run it.

Throughout:

- When the level or the phase changes, say so in a line, such as "Overview: exploring approaches" or "Details, merging:
  deciding".
- At the overview level, names and shapes in an example are placeholders. Say so, and park each detail question under
  the working notes' Open questions in a line, even a hard-to-undo one, without asking it. It comes back with its part.
- A question with only one reasonable answer, once you look at the code, isn't a decision. Note it and move on.
- Code-level detail goes in the working notes, not the design: function, type, and property names, where things live,
  internal steps, small defaults, and edge cases. Keep their checklist current.
- Never write security-sensitive detail anywhere: not in the design, the working notes, a commit, or a PR. The guide's
  "Keep security details out" lists what counts. If the work needs it, stop and tell the user.
- A remark made in passing is often a standing rule. Confirm it, and note it in the working notes' Open questions.
  Step 11 settles where it goes.

## Workflow

### 1. Pick up earlier work

- **Check** for an earlier session's work first:

  ```sh
  git worktree list
  git branch --list '*<feature>*'
  ls docs/designs/
  ```

- **Do:** if the feature's design exists, read it before anything else: its folder's `README.md`, or an older single
  file.
  - If the design has a `tl;dr`, the feature is finished. Don't resume its working notes. To change a decision, go to
    step 12.
  - Otherwise, read `working-notes.md` too. The checklist says where the work stopped. Continue from there.

### 2. Name the feature and set up a branch

Keep the design out of the user's checkout, so it never sits as uncommitted changes there.

- **Do:** propose a short kebab-case slug, such as `ignore-regex-per-language`, and use it unless the user objects. It
  names the folder and the branch.
- **Do:**
  - With no branch, create one and a worktree from an up-to-date `origin/main`. This is local and reversible, so no
    need to ask:

    ```sh
    git fetch origin main
    git worktree add -b <feature> .claude/worktrees/<feature> origin/main
    ```

  - With the branch but no worktree, attach it: the same command without `-b`.
  - When the user or the environment named a branch for this work, such as in a cloud session, use it and skip the
    worktree.
  - Open a draft PR once the design's first commit exists, and tell the user.
  - Push each decision as it's settled. Keep the PR body's status current: the level and part the design is at, with
    a link to the working notes' Open questions. Link to the design rather than copying its decisions.
  - Point the user to the design in the PR, rather than pasting long parts of it in the chat.

### 3. Get to the why

Know why the feature exists before deciding anything.

- **Do:** look up the facts first: the issue, the code, a reproduction.
- **Do:** propose the why in one or two lines, and let the user correct it. If it still reads like a solution, ask "why
  does that matter?" and redraft.
- **Do:** draft answers to the rest of `docs/design-questions.md`'s "Why and who" group from the facts: why now, who is
  affected, what success looks like, and what's out of scope. Show them in the chat together, mark the ones the facts
  don't answer, and let the user correct the rest.
- **Ask** about the marked ones, one at a time.
- **Do:** create `docs/designs/<feature>/` with `README.md` and `working-notes.md` from the guide's skeletons, with the
  Why. Add its line to `docs/designs/README.md`, commit, and push.

### 4. Explore approaches

The overview level, exploring. Discuss; don't decide yet.

- **Do:** read `docs/design-principles.md`, `docs/design-questions.md`, `docs/glossary.md`, and, for a config option
  or a CLI flag, `docs/config-and-cli.md`. Look through `docs/designs/`, `rfc/`, and closed issues for earlier
  thinking, and link a matching RFC under Why.
- **Do:** lay out the approaches, usually two or three. Sketch each one: the config or command line a user writes,
  and what cspell does. Compare them against the overview questions.
- **Do:** check facts in the code, or by running `node ./bin.mjs`. When a question turns on facts outside the repo,
  offer to research it, and bring back a short summary with sources. Findings go in the working notes.
- **Do:** write the approaches being explored under the design's Overview. Commit and push.

### 5. Decide the overview

The overview level, deciding. Start with the approach, then the decisions it rests on. Give a question time when its
answer could change the approach or would be hard to undo. For anything else, propose a default in one line.

- **Ask** each question this way:
  - One question at a time. Move on only when it's resolved.
  - Lettered options, each showing what the user would write or see: the config snippet or the command line, and what
    cspell reports. Put your recommendation first, and say why.
  - Check facts before asking, and bring the result.
  - "You decide" is an answer: propose a default, and record it.
  - The user can defer: note it under the working notes' Open questions, and come back to it before step 6.
- **Do:** write the Overview as each decision is settled, with its reason, in place of the approaches explored. Keep a
  rejected approach only when it's a lesson, as the guide's "When the feature is finished" says. Commit and push.

### 6. Agree on the whole overview

The gate between the levels.

- **Stop and ask:** when the overview is complete, link to the Overview in the PR and summarize it in a few lines: the
  approach, what users see, the parts, and the decisions it rests on. Ask the user for an explicit OK.
- **Don't** start on the details before the OK, even for a detail that looks quick.
- **Do:** add the parts to the working notes' checklist.

### 7. Work through each part

The details level, one part at a time.

- **Explore:** what the part has to handle, what cspell's config resolution, the CLI, and the published packages
  allow, and what's unclear. Check facts as in step 4. Bring up the part's parked details. Discuss before offering
  options.
- **Decide:** go through the groups of detail questions in `docs/design-questions.md` that apply.
  - Ask one at a time, as in step 5, only about a detail that:
    - would be hard to undo once it ships, such as a public name, an option's shape, or a default that changes what
      gets flagged; or
    - could change the overview.
  - When you aren't sure which kind a detail is, treat it as hard to undo, and ask about it.
  - Decide the rest yourself. Write them in the working notes, and list them in the chat with a link to the PR, so the
    user can skim them and correct any.
  - The user can defer a detail until step 11.
- **Do:** write the part's section as each hard-to-undo detail is settled, with its reason. Everything else goes in the
  working notes. Commit and push. When a part can be read on its own, move it to its own file, as the guide's "Where it
  lives" says.

### 8. Go back up when a detail challenges the overview

- **Stop:** when a detail shows the overview is wrong, say so in a line, and stop working on the details.
- **Do:** if the approach itself is in question, explore again as in step 4. Settle the change to the overview as in
  step 5, and get the OK again as in step 6.
- **Do:** re-decide the details that depend on what changed, as in step 7: ask about the hard-to-undo ones, and list
  the rest.

### 9. Settle the whole-feature questions

Once, after the last part, or before stopping at step 10.

- **Decide:** go through the whole-feature questions in `docs/design-questions.md`, as in step 7: ask about the
  hard-to-undo ones, such as whether it's breaking, and decide and list the rest.
- **Do:** write the decisions in the Overview, with their reasons. Put the to-dos, such as the docs to change or a
  name still to settle, in the working notes' checklist. Commit and push. Adding them doesn't reopen the
  overview. If one shows the approach is wrong, go back up as in step 8.

### 10. Stop when the code is the easier answer

Hand the user a clear state, and leave building as a separate step.

- **Do:** bring the working notes' checklist up to date with what's left to build.
- **Do:** tell the user:
  - what was decided, and what was left open;
  - the names still to settle from step 9. Each needs a decision, or an issue saying when it must be decided;
  - where the work lives: the branch, the worktree's path, and the PR.
- **Do:** stop at the design. A quick prototype is fine when it answers a question faster. Building is a separate step,
  such as with the `config-option` or `cli-option` skill. Whoever builds keeps the working notes current, puts edge
  cases found while building there, and updates the design only when the code shows a decision was wrong.

### 11. Finish the design when the feature is finished

Turn the working design into what the guide's "When the feature is finished" describes, in the PR that finishes the
feature.

- **Stop and ask:** wait until the user says the feature is finished.
- **Do:** follow the guide's "When the feature is finished". Settle or drop each open question and parked detail with
  the user.
- **Do:** list the standing rules noted in the working notes, and let the user pick which go into
  `docs/design-principles.md` or another doc. A rule that could affect other designs gets its own `docs:` PR.
- **Check:** start a subagent that is given only the paths of the design, without the working notes, and told not to
  read the code. Ask it to say what was decided, why, and how the decisions fit together, and to list gaps,
  contradictions, and anything it had to guess. A missing decision or reason is a gap; a missing edge case isn't. If
  you can't start a subagent, write that request out in full for the user, with the paths and a note that the reader
  has no other context. Ask them to run it in a new session and paste its report back, and wait for it.
- **Stop and ask:** show the user the report, and fix what they agree with.
- **Check:** if the code is on the same branch, the PR is titled `feat:` or `fix:` and its body is written for the
  release notes, as `docs/pull-requests.md` describes.
- **Check:** `pnpm run lint-ci` and `pnpm run check-spelling` pass. Fix what they find, and run them again until they
  do.

The PR that finishes the feature is the last one to edit the working notes.

### 12. Change a merged design

Keep a merged design true when a decision changes.

- **Do:** follow the guide's "Changing a design later", on a branch set up as in step 2. A change to the overview goes
  back up as in step 8. Don't touch finished working notes.

## Check a change

For a small change, when the user asks to check it before or while building. No design, no interview, and a few minutes
of the user's time.

- State the change and its why in a sentence or two, from the conversation, the issue, and the code.
- Check it against `docs/design-questions.md`. List every side effect you find, with what it would change for users.
- Raise anything that could change the approach or is hard to undo. If a hard-to-undo choice with more than one
  reasonable answer turns up, suggest designing it, in one line.
- When users would notice the change, draft a Technical Details block for the PR, written for them as
  `docs/pull-requests.md` describes.

## Not this skill

- The request is really a bug fix, or a change that's already fully specified. Say so, and stop.
- The feature is large enough for public discussion with users. Suggest an RFC in `rfc/` first.
- Designs and working notes are for people: they never point to `AGENTS.md` or `CLAUDE.md`.
