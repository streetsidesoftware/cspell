# Architecture Decision Records

An Architecture Decision Record (ADR) records one design decision: why it's needed, the choice, its consequences, and
the context and rejected approaches behind it. ADRs are for decisions where a reasonable person could have chosen
differently.

The templates for every file described here are in [`template.md`](./template.md).

## Purpose

ADRs are a tool for designing a feature well. The goal is a well-designed feature, not the ADRs.

They help us work through a design one decision at a time, and the commits keep the trail while we do. Once merged,
they show the design and what mattered in it: the goals, the choices, and the background behind them. They aren't a
contract: when building or using the feature shows a better answer, change the design.

## ADRs and RFCs

This repo also has [RFCs](../../rfc/). They do different jobs:

- **An RFC** is a public proposal for a large capability, discussed with users and often linked from an issue. It
  describes the problem and a proposed direction.
- **ADRs** record the decisions made while designing and building a feature, one decision each, whether or not an RFC
  motivated it.

When a feature is designed from an RFC, its `README.md` links to the RFC.

## When to write ADRs

Write ADRs before building a feature whose design has more than one reasonable answer, especially when the choice is
hard to undo once it ships:

- a config option's name, shape, default, or where it can be set
- a CLI command or flag
- a change to what gets flagged, or to how config files are resolved and merged
- a change to the public API of a published package
- a command that writes to users' config files or dictionaries

Skip them for bug fixes, refactors, dependency updates, and changes whose behavior is already fully specified.

## Layout

Each feature has its own folder, named by a short kebab-case feature slug, for example `ignore-regex-per-language`.

- `docs/ADRs/<feature>/README.md`: the feature's index. It states why the feature exists, who it affects, its goal,
  what's out of scope, and lists its decisions.
- `docs/ADRs/<feature>/NNNN-<decision>.md`: one file per decision. Numbers have four digits and start at `0001` within
  each feature.

Closely related decisions can share one ADR (an option's name, type, and default). Decisions that can change separately
get separate ADRs (an option's default, and how it merges across config files).

## Status

An ADR's status:

- `Proposed`: under discussion.
- `Accepted`: decided.

A feature's status, in the [Features](#features) table:

- `Designing`: the interview is still going.
- `Accepted`: the design is decided, whether or not it's built yet.
- `Archived`: shipped, and its ADRs replaced by a summary.

## Designing a feature

### 1. Start with why

Before any decision, write the feature's `README.md`: why it's being done, the stakeholders and how each is affected,
the goal, and what's out of scope. Every decision is weighed against these and against
[the design principles](../design-principles.md).

The Why, Stakeholders, Goal, and Out of scope are a draft until the design is final. Revise them when the design shows
a better reason, and check them again before merge.

### 2. Decide one thing at a time

- Write an ADR for each decision as it's made, and add its row to the feature's `README.md`.
- Commit each ADR as it's written. The commits let us go back to an earlier point and see how an idea evolved. They
  stay in the PR, so the ADRs don't need to carry that history.
- Record questions that were deferred under "Open questions" in the feature's `README.md`.
- Restructure whenever the ADRs stop reading as one line from the Why: merge, split, or renumber them. Nothing outside
  the feature links to a single ADR, so only the links between its own ADRs need fixing.

### 3. Keep the glossaries current

- A term introduced by this feature goes in the [ADR glossary](./glossary.md).
- A concept maintainers need to know across the repo goes in the main [glossary](../glossary.md).
- A term that becomes repo-wide moves from the ADR glossary to the main one.

### 4. Finalize before merge

When the design is final, rewrite the feature's ADRs to state the design as it stands. The timeline stays in the PR's
commits. What the design work showed to be important stays in the ADRs.

- Check that the Why and the Goal in the feature's `README.md` still say why the feature is being done, and that each
  ADR serves a stated goal.
- Arrange the ADRs so they read as one line from the Why, with one ADR per decision that can change separately. Delete
  any that no longer apply, merge ADRs that only refine each other, and split ADRs that hold unrelated decisions.
- Write each ADR as the current decision, without the timeline. Keep in its Context the background and what we learned
  along the way, including approaches tried before. List rejected approaches briefly.
- Put what we learned about the feature as a whole in the "What we learned" section of its `README.md`.
- Renumber from `0001`, mark everything `Accepted`, and update the index.
- Have someone new to the design read only the feature's `README.md` and its ADRs. They should be able to say what gets
  built, why, and how the decisions fit together. Fix whatever they couldn't.

## Changing a merged design

Building or using a feature often shows a better answer. When it does, change the design, and update its ADRs in the
same PR:

- Rewrite the ADR in place to state the current decision. Move the old choice to Rejected approaches, and add what we
  learned to its Context. The earlier version stays in git history.
- Delete an ADR that no longer applies, and renumber the rest if needed. Links go only to the feature's `README.md`, so
  only the links between its own ADRs need fixing.
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

## Links

Link to a feature's `README.md`, never to a single ADR file. This applies to code comments, docs, glossary entries,
and other features' ADRs. A feature can then be restructured on its own, and the `README.md` survives archiving as the
summary, so the links keep working. Only ADRs of the same feature link to each other's files.

## Branches

Work on a design in an `adr/<feature>` branch, and on archiving in an `adr-archive/<feature>` branch.

A small feature can ship its design and implementation together, with the ADRs in the feature's `feat:` or `fix:` PR.
When a design is worth reviewing before any code is written, merge it on its own with a `docs:` PR, so it stays out of
the release notes.

## With Claude Code

The `feature-adr` skill runs this process as an interview: it asks one decision at a time, writes and commits the
ADRs, keeps the glossaries current, and offers to archive features that are due. It opens a draft PR once the first
ADR is committed, and runs the fresh-reader check with a subagent when the design is finalized.

## Features

| Feature                                    | Description                                                       | Shipped | Status   |
| ------------------------------------------ | ----------------------------------------------------------------- | ------- | -------- |
| [glob-symlinks](./glob-symlinks/README.md) | Opt-in following of symbolic links in `cspell lint` glob searches |         | Accepted |
