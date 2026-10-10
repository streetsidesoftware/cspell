# Architecture Decision Records

An Architecture Decision Record (ADR) records one design decision: why it's needed, the choice, its consequences, and
the context and rejected approaches behind it. It's for decisions where a reasonable person could have chosen
differently. The templates are in [`template.md`](./template.md).

## Purpose

ADRs are a tool for designing a feature well, not the goal. We ship working code, not ADRs, so aim for a good design,
not a perfect one.

They help us work through a design one decision at a time, and the commits keep the trail while we do. Once merged,
they show the design and what mattered in it: the goals, the choices, and the background behind them. They aren't a
contract: when building or using the feature shows a better answer, change the design.

## When to use ADRs

Use ADRs for a feature whose design has more than one reasonable answer, especially when the choice is hard to undo
once it ships:

- a config option's name, shape, default, or where it can be set
- a CLI command or flag
- a change to what gets flagged, or to how config files are resolved and merged
- a change to the public API of a published package
- a command that writes to users' config files or dictionaries

A bug fix or small feature rarely needs ADR files: see [Two ways to use it](#two-ways-to-use-it). Skip ADRs for
refactors, dependency updates, and fully specified changes.

## Designing a feature

Work from the top down: the why, then the overall shape, then only the details that could change that shape. Go back
up whenever a detail shows the shape is wrong. Stop when the remaining questions are easier to answer by writing the
code. The files are described in [Layout](#layout).

### Two ways to use it

- **Capture for later.** Design a large feature at a high level while the ideas are fresh. Write down enough to pick it
  up again: the why, the sketch, the decisions so far, and the open questions. It merges as a `docs:` PR, with the
  feature still `Designing`.
- **Check before building.** Check a small feature or fix: will it work as expected, and what are its side effects? The
  why, the sketch, and the findings go in the PR: in its Technical Details when users would care, or in a PR comment
  when only reviewers would. It needs a short feature folder, in the same PR, only for a hard-to-undo decision with
  more than one reasonable option, weighed. An uncontested name or default goes in the Technical Details.

The steps are the same for both. Without a feature folder, each one is a few lines in the PR.

### 1. Start with why

Before any decision, write the feature's `README.md`: why it's being done, and the goal. Add the stakeholders and
what's out of scope when they aren't obvious. Weigh every decision against these and against
[the design principles](../design-principles.md). They're a draft until the design is final: revise them when the
design shows a better reason.

### 2. Sketch the design

Write the shape of the solution in a few lines in the README's Design section, and agree on it before any ADR. The
sketch is provisional. It frames the decisions, but shouldn't limit them: when a detail shows a better shape, change the
sketch.

### 3. Settle the inflection points

Give a question time only when its answer could change the sketch, or is hard to undo once it ships. Settle anything
else quickly with a sensible default. When it isn't clear which kind a question is, ask.

- Write a short ADR for each inflection point as it's decided, to fill in at finalize: the goal it serves, the
  decision, and a line or two on what shaped it. Add its row to the feature's `README.md`.
- Commit each ADR as it's written. The commits let us go back and see how an idea evolved, so the ADRs don't need to
  carry that history.
- When a question turns on facts outside the repo, such as how other tools do it, a library's behavior, or a standard,
  suggest researching it briefly. Bring back a short summary with sources, and put what shaped a decision in that
  ADR's Context.
- Note side questions in a line under "Open questions", and set them aside. The code usually settles them.
- Restructure whenever the ADRs stop reading as one line from the Why: merge, split, or renumber them.

### 4. Let the code settle the rest

Stop designing when the remaining questions are easier to answer in code. Note each in a line under "Open questions".
When a quick experiment would answer a question faster than discussion, suggest one. When the code shows something the
design missed, update the sketch and the ADRs.

### 5. Keep the glossaries current

- A term introduced by this feature goes in the [ADR glossary](./glossary.md).
- A concept maintainers need to know across the repo goes in the main [glossary](../glossary.md).
- A term that becomes repo-wide moves from the ADR glossary to the main one.

### 6. Finalize before merge

Rewrite the ADRs to state the design as it stands, filling in the sections each one needs. The timeline stays in the
PR's commits. What we learned stays: in the Context of the ADR it shaped, or in the feature's "What we learned".

- Check that the Why and the Goal still hold, and that each ADR serves a stated goal.
- Arrange the ADRs as one line from the Why, one per decision that can change separately. Renumber from `0001`.
- Settle or drop each open question in a line. Open an issue only for a real problem someone would act on.
- Mark the ADRs and the feature `Accepted`.
- Have someone new to the design read only the feature's `README.md` and its ADRs. They should be able to say what gets
  built, why, and how the decisions fit together. Fix whatever they couldn't.

A captured design is finalized the same way, except that its open questions stay, each with what it depends on, and
its ADRs and the feature stay `Proposed` and `Designing`. The fresh reader should be able to pick it up.

## Changing a merged design

When building or using a feature shows a better answer, change the design, and update its ADRs in the same PR:

- Rewrite the ADR in place to state the current decision. Move the old choice to Rejected approaches, and add what
  we learned to its Context.
- Delete an ADR that no longer applies, and renumber the rest if needed.
- Update the feature's index, and its "What we learned" when the change taught something about the whole feature.

## Archiving

About three months after a feature ships, its ADRs are replaced by a short summary. Archive a feature when it's due, or
earlier when a maintainer asks.

- When the first release containing a feature is published, fill in its cspell version and date in the
  [Features](#features) table.
- Before deleting anything, move what's still in force to its long-term home: principles to
  [`../design-principles.md`](../design-principles.md), and rules to the relevant doc in `docs/`.
- Rewrite the feature's `README.md` as the archive summary, with a permalink to the full ADRs in git history.
- Delete the ADR files, and mark the feature `Archived` in the table.

## Layout

Each feature has a folder named by a short kebab-case slug, for example `ignore-regex-per-language`:

- `docs/ADRs/<feature>/README.md`: the feature's index. Its why, goal, and design sketch, its stakeholders and what's
  out of scope when they aren't obvious, and its decisions.
- `docs/ADRs/<feature>/NNNN-<decision>.md`: one file per decision, numbered with four digits from `0001` within the
  feature.

Closely related decisions can share one ADR (an option's name, type, and default). Decisions that can change separately
get separate ADRs (an option's default, and how it merges across config files).

## Status

- An ADR is `Proposed` while the design is in progress, and `Accepted` once it's finalized, except in a captured
  design.
- A feature is `Designing` while its design is in progress or captured for later, `Accepted` once the design is
  decided (built or not), and `Archived` once its ADRs are replaced by a summary.

## Links

Link to a feature's `README.md`, never to a single ADR file: from code comments, docs, glossary entries, and other
features' ADRs. A feature can then be restructured on its own, and the link survives archiving. Only ADRs of the same
feature link to each other's files.

## Branches

A design with a feature folder is worked on in an `adr/<feature>` branch, and archiving in `adr-archive/<feature>`.

- A captured design merges on its own as a `docs:` PR, which stays out of the release notes.
- When the code follows the design, they share one branch and one PR. It starts as a draft `docs:` PR, and becomes
  `feat:` or `fix:` once code lands.
- A check before building uses the change's own branch. Its notes, and its feature folder if it needs one, go in
  that change's PR.

## ADRs and RFCs

[RFCs](../../rfc/) are public proposals for large capabilities, discussed with users. They describe a problem and a
direction. ADRs record the decisions made while designing a feature, whether or not an RFC motivated it. A feature
designed from an RFC links to it from its `README.md`.

## With Claude Code

The `feature-adr` skill runs this process as a short interview, in either of the two ways. It stops when the code is
the easier way to answer the rest. With a feature folder, it commits the ADRs, opens a draft PR once the sketch is
committed, and runs the fresh-reader check with a subagent at finalize. In a check before building, it drafts the
design notes for the PR.

## Features

| Feature                                    | Description                                                       | Shipped | Status   |
| ------------------------------------------ | ----------------------------------------------------------------- | ------- | -------- |
| [glob-symlinks](./glob-symlinks/README.md) | Opt-in following of symbolic links in `cspell lint` glob searches |         | Accepted |
