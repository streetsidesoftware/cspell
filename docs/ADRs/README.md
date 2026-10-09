# Architecture Decision Records

An Architecture Decision Record (ADR) records one design decision: why it's needed, the choice, its consequences, and
the context and rejected approaches behind it. ADRs are for decisions where a reasonable person could have chosen
differently.

The templates for every file described here are in [`template.md`](./template.md).

## Purpose

ADRs are a tool for designing a feature well. The goal is a well-designed feature, not the ADRs. We ship working code,
not ADRs, so aim for a good design, not a perfect one.

They help us work through a design one decision at a time, and the commits keep the trail while we do. Once merged,
they show the design and what mattered in it: the goals, the choices, and the background behind them. They aren't a
contract: when building or using the feature shows a better answer, change the design.

## When to use ADRs

Use ADRs to settle a feature whose design has more than one reasonable answer, especially when the choice is hard to
undo once it ships:

- a config option's name, shape, default, or where it can be set
- a CLI command or flag
- a change to what gets flagged, or to how config files are resolved and merged
- a change to the public API of a published package
- a command that writes to users' config files or dictionaries

A bug fix or small feature rarely needs ADR files. Its design notes go in the PR, as
[Two ways to use it](#two-ways-to-use-it) describes. Skip ADRs for refactors, dependency updates, and changes whose
behavior is already fully specified.

## Designing a feature

Work from the top down: the why, then the overall shape, then only the details that could change that shape. Go back
up whenever a detail shows the shape is wrong. Stop when the remaining questions are easier to answer by writing the
code.

The files are described in [Layout](#layout).

### Two ways to use it

- **Capture for later.** A large feature, designed at a high level while the ideas are fresh, to be finished later.
  Write down enough to pick it up again: the why, the sketch, the decisions made so far, and the questions still open.
  It merges as a `docs:` PR, with the feature still `Designing`.
- **Check before building.** A small feature or fix, checked to make sure it will work as expected and to catch side
  effects. It usually needs no feature folder: the why, the sketch, and what the checks found go in the PR, in its
  Technical Details when users would care, or in a PR comment when only reviewers would. A decision that's hard to undo
  once it ships still gets a short feature folder, in the same PR.

The steps below are the same for both. Without a feature folder, each one is a few lines in the PR.

### 1. Start with why

Before any decision, write the feature's `README.md`: why it's being done, the stakeholders and how each is affected,
the goal, and what's out of scope. Every decision is weighed against these and against
[the design principles](../design-principles.md).

The Why, Stakeholders, Goal, and Out of scope are a draft until the design is final. Revise them when the design shows
a better reason, and check them again before merge.

### 2. Sketch the design

Write the shape of the solution in the Design section of the feature's `README.md`: a few lines or bullets, agreed
before any ADR.

The sketch is provisional. It shows the problem can be solved and frames the decisions, but it shouldn't limit them.
When a detail shows a better shape, change the sketch.

### 3. Settle the inflection points

Give a question time only when its answer could change the sketch, or is hard to undo once it ships (the list in
[When to use ADRs](#when-to-use-adrs)). Settle anything else quickly with a sensible default. When it isn't clear which
kind a question is, ask.

- Write an ADR for each inflection point as it's decided, and add its row to the feature's `README.md`. Keep it
  short until finalize: the goal it serves, the decision, and a line or two on what shaped it.
- Commit each ADR as it's written. The commits let us go back to an earlier point and see how an idea evolved. They
  stay in the PR, so the ADRs don't need to carry that history.
- When a question turns on facts outside the repo, such as how other tools handle it, a library's behavior, or a
  standard, research it briefly and bring back a short summary with sources. What shaped a decision goes in that ADR's
  Context.
- Keep side questions short. Note one in a line under "Open questions" in the feature's `README.md` and set it aside.
  The code usually settles it.
- Restructure whenever the ADRs stop reading as one line from the Why: merge, split, or renumber them. Links from
  outside the feature go to its `README.md`, so only the links between its own ADRs need fixing.

### 4. Let the code settle the rest

Stop designing when the remaining questions are easier to answer by writing the code. Note each one in a line under
"Open questions". When a quick experiment would answer a question faster than discussion, suggest one. When the code
shows something the design missed, update the sketch and the ADRs.

### 5. Keep the glossaries current

- A term introduced by this feature goes in the [ADR glossary](./glossary.md).
- A concept maintainers need to know across the repo goes in the main [glossary](../glossary.md).
- A term that becomes repo-wide moves from the ADR glossary to the main one.

### 6. Finalize before merge

Rewrite the feature's ADRs to state the design as it stands, filling in the sections each one needs. The timeline stays
in the PR's commits. What we learned stays: in the Context of the ADR it shaped, or in the "What we learned" section of
the feature's `README.md`.

- Check that the Why and the Goal still say why the feature is being done, and that each ADR serves a stated goal.
- Arrange the ADRs as one line from the Why, one ADR per decision that can change separately. Renumber from `0001`,
  and mark the ADRs `Accepted`.
- Settle or drop each open question in a line. One becomes an issue only when it's a real problem someone would act
  on, not a nice-to-have.
- Mark the feature `Accepted`.
- Have someone new to the design read only the feature's `README.md` and its ADRs. They should be able to say what gets
  built, why, and how the decisions fit together. Fix whatever they couldn't.

A captured design is finalized the same way, except that its open questions stay, each with what it depends on, its
ADRs stay `Proposed`, and the feature stays `Designing`. The fresh reader should be able to pick it up.

## Changing a merged design

Building or using a feature often shows a better answer. When it does, change the design, and update its ADRs in the
same PR:

- Rewrite the ADR in place to state the current decision. Move the old choice to Rejected approaches, and add what we
  learned to its Context. The earlier version stays in git history.
- Delete an ADR that no longer applies, and renumber the rest if needed. Links from outside the feature go to its
  `README.md`, so only the links between its own ADRs need fixing.
- Update the feature's index, and its "What we learned" section when the change taught something about the whole
  feature.

## Archiving

This repo doesn't keep an ever-growing history of ADRs. About three months after a feature ships, its ADRs are replaced
by a short summary. Archive a feature when it's due, or earlier when a maintainer asks.

- The [Features](#features) table records when each feature shipped. Fill in the cspell version and date when the first
  release containing it is published.
- Before deleting anything, move what is still in force to its long-term home: principles to
  [`../design-principles.md`](../design-principles.md), and rules to the relevant doc in `docs/`.
- Rewrite the feature's `README.md` as the archive summary, with a permalink to the full ADRs in git history.
- Delete the individual ADR files, and mark the feature archived in the table below.

## Layout

Each feature has its own folder, named by a short kebab-case feature slug, for example `ignore-regex-per-language`.

- `docs/ADRs/<feature>/README.md`: the feature's index. It states why the feature exists, who it affects, its goal,
  what's out of scope, and the design sketch, and lists its decisions.
- `docs/ADRs/<feature>/NNNN-<decision>.md`: one file per decision. Numbers have four digits and start at `0001` within
  each feature.

Closely related decisions can share one ADR (an option's name, type, and default). Decisions that can change separately
get separate ADRs (an option's default, and how it merges across config files).

## Status

An ADR's status:

- `Proposed`: decided during the design, not yet final.
- `Accepted`: final. Set at finalize, except in a captured design.

A feature's status, in the [Features](#features) table:

- `Designing`: the design is still being worked out, or was captured to be finished later.
- `Accepted`: the design is decided, whether or not it's built yet.
- `Archived`: shipped, and its ADRs replaced by a summary.

## Links

Link to a feature's `README.md`, never to a single ADR file. This applies to code comments, docs, glossary entries,
and other features' ADRs. A feature can then be restructured on its own, and the `README.md` survives archiving as the
summary, so the links keep working. Only ADRs of the same feature link to each other's files.

## Branches

Work on a design with a feature folder in an `adr/<feature>` branch, and on archiving in an `adr-archive/<feature>`
branch.

- A captured design merges on its own as a `docs:` PR, so it stays out of the release notes.
- When the code follows the design, they share one branch and one PR. The PR starts as a draft `docs:` PR, and becomes
  `feat:` or `fix:` once code lands, so the ADRs ship with the code.
- A check before building works on the change's own branch. Its design notes, and its feature folder if it needs one,
  go in that change's PR.

## ADRs and RFCs

This repo also has [RFCs](../../rfc/). They do different jobs:

- **An RFC** is a public proposal for a large capability, discussed with users and often linked from an issue. It
  describes the problem and a proposed direction.
- **ADRs** record the decisions made while designing and building a feature, one decision each, whether or not an RFC
  motivated it.

When a feature is designed from an RFC, its `README.md` links to the RFC.

## With Claude Code

The `feature-adr` skill runs this process as a short interview, in either of the two ways: the why, the sketch, then one
inflection point at a time. It stops when the code is the easier way to answer the rest. With a feature folder, it
commits the ADRs, opens a draft PR once the sketch is committed, and runs the fresh-reader check with a subagent at
finalize. In a check before building, it drafts the design notes for the PR. It also offers to archive features that
are due.

## Features

| Feature                                    | Description                                                       | Shipped | Status   |
| ------------------------------------------ | ----------------------------------------------------------------- | ------- | -------- |
| [glob-symlinks](./glob-symlinks/README.md) | Opt-in following of symbolic links in `cspell lint` glob searches |         | Accepted |
