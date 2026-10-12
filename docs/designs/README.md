# Designing a feature

A design helps you think a feature through before and while you build it. It's for whoever builds the feature, for the
people who review it, and for anyone who later wants to understand it. It should be clear and descriptive: a reader
understands the feature's intent and behavior without reading the code. It isn't a replacement for the code or a record
to maintain: the code, tests, and docs are the source of truth.

## When to write one

It's never required. Write one when you want to think before building, or when a reviewer suggests it. It's worth it
when a feature makes a public choice that's hard to undo once it ships and has more than one reasonable answer:

- a config option's name, shape, default, or where it can be set
- a CLI command or flag
- a change to what gets flagged, or to how config files are resolved and merged
- a change to the public API of a published package
- a command that writes to users' config files or dictionaries

Skip it for bug fixes, refactors, dependency updates, and changes that are already fully specified.

## Where it lives

Write it on the feature's branch, so reviewers see it next to the code. Start with one file,
`docs/designs/<feature>.md`, named by a short kebab-case slug, for example `ignore-regex-per-language`.

Not every design fits in one file. When a part can be read on its own, such as a sub-feature, a large decision, or
research notes, move the design to a folder:

- `docs/designs/<feature>/README.md` keeps the why, the sketch, links to the other files, and the open questions.
- Each other file covers one topic, named by a slug, for example `merging.md`. No numbers or statuses.

Edit the files in place as the design changes. Git history keeps the earlier versions, so the files don't have to.

Usually the design and the code share one branch and one PR. Open the PR early if you want feedback before building.
It starts as a `docs:` PR and becomes `feat:` or `fix:` once the code lands. Rewrite its body for the release notes
then.

## The file

```markdown
# <Feature>

## Why

<The problem, who has it, and what they can't do today. A few lines.>

## Design

<The sketch: the shape of the solution in a few lines, with one example of what a user writes (the config or the
command line) and what cspell does. Then each choice that could change the sketch or is hard to undo, with the
alternatives turned down and why.>

## Open questions

- <A side question or deferred point, in one line.>
```

Add anything else the feature needs, such as who it affects or what's out of scope, under Why.

Define a new term in the design where it's first used. If it's used across the repo, add it to the main
[glossary](../glossary.md) in the same PR.

## How to design

Work from the top down, and stop when the code is the easier way to answer the rest.

1. **Get to the why.** A feature usually starts as a problem to solve, or as a solution ("we need an option"). Ask
   "why?" until you reach the reason: who is affected, and what goes wrong for them today. Look at the issue and the
   code first, so the why rests on facts. Then ask why now, what success looks like as something a user can do, and
   what's out of scope.
2. **Sketch the design** in a few lines, with one example: what a user writes (the config or the command line) and
   what cspell does.
3. **Work through the [design checks](./checks.md),** which include the
   [design principles](../design-principles.md). Spend time on a question when its answer could change the sketch, or
   would be hard to undo once it ships: names, defaults, merging, what gets flagged, public API. Settle anything else
   with a sensible default. When a detail shows the sketch is wrong, change the sketch.
4. **Note side questions** in a line under Open questions, and set them aside. The code usually settles them.
5. **Let the code settle the rest.** When a question is easier to answer by building or trying something, stop
   designing and build. Update the design when the code shows something the design missed.

## Before merge

Finish the design in the same PR. This removes the working notes, not the explanation:

- Add a `tl;dr` at the top: a readable summary of what the feature does and the choices that matter, in short, plain
  sentences.
- Add a line saying it describes the design when it merged, and that the code and docs are the source of truth.
- Make the Design section describe the feature as built: what a user does and sees, with examples, how it behaves in
  the cases that matter, and each choice with the alternatives turned down and why.
- Leave out what only matters for writing the code, such as function names and internal steps.
- Settle or drop each open question, and remove the section. Open an issue only for a real problem someone would act
  on.
- In a folder, the `tl;dr` and that line go in the `README.md`. Finish each other file the same way, and delete one
  that no longer adds anything.
- Have someone new to the feature read only the design, without the code. They should be able to say what the feature
  does, how it behaves, why, and why it's shaped the way it is.

If the design set a rule that holds beyond this feature, such as a new design principle, add it to
[`../design-principles.md`](../design-principles.md) or the relevant doc in `docs/`. When it could affect other
designs, do that in its own `docs:` PR.

After merge, leave it alone. It's a snapshot, not a record to keep current. When a later change makes it wrong,
the code and docs win.

## Designs and RFCs

[RFCs](../../rfc/) are public proposals for large capabilities, discussed with users. They describe a problem and a
direction. A design works out how to build a feature, whether or not an RFC motivated it. A design based on an RFC
links to it under Why.

## With Claude Code

The `feature-design` skill runs this as a short interview. It can also check a small change for side effects before
it's built.
