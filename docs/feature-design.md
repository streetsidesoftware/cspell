# Designing a feature

A design helps you think a feature through before and while you build it. It holds decisions and their reasons: why the
feature is needed, who it affects, and what was chosen. It's for whoever builds the feature, for the people who review
it, and for anyone who later wonders why it's shaped the way it is.

A design doesn't describe how the code behaves. The code, tests, and docs are the source of truth, and most readers
assume a design is out of date. It isn't a contract either: when building or using a feature shows a better answer,
change the design.

## When to write one

It's never required. Write one when you want to think before building, or when a reviewer suggests it. It's worth it
when a feature has more than one reasonable answer, especially when the choice is hard to undo once it ships:

- a config option's name, shape, default, or where it can be set
- a CLI command or flag
- a change to what gets flagged, or to how config files are resolved and merged
- a change to the public API of a published package
- a command that writes to users' config files or dictionaries

Skip it for bug fixes, refactors, dependency updates, and changes whose behavior is already fully specified.

## Where it lives

Each feature gets a folder, `docs/designs/<feature>/`, named by a short kebab-case slug, such as
`ignore-regex-per-language`:

- `README.md` is the design: the why, the overview, and the parts.
- `working-notes.md` holds the details, the checklist, and the open questions while the feature is designed and
  built. See [Working notes](#working-notes).
- When a part of the design can be read on its own, it gets its own file, named by a slug, such as `merging.md`. The
  `README.md` links to it.

Add a line for the feature to the list in [`docs/designs/README.md`](./designs/README.md) in the same PR.

Edit the files in place as the design changes. Git history keeps the earlier versions, so the files don't have to.

Open a draft PR once the design has its first commit, and push each decision as it's settled. Reviewers read the design
in the PR as it grows, not in pieces in a chat or an issue.

A small feature can ship its design and code together in one PR, and the code decides the PR's type. When a design is
worth reviewing before it's built, merge it on its own with a `docs:` PR, so it stays out of the release notes. A
feature built over several PRs updates its design and working notes in each one. See
[Pull requests](./pull-requests.md).

## The design

```markdown
# <Feature>

## Why

<The problem, who has it, and what they can't do today. A few lines.>

## Overview

<The approach and the whole shape: what a user writes (the config or the command line) and what cspell does. The main
parts. Each decision the approach rests on, with its reason. After the parts are done, the whole-feature answers, such
as how it's released.>

## <Part>

<One section per part of the overview: the decisions that are hard to undo or could change the overview, each with its
reason.>
```

- Add anything else the reader needs to understand the why, such as who it affects, under Why.
- Record what's out of scope only when a reader would otherwise assume the feature covers it.
- Keep a name only when users see it and it's part of the decision, such as a config option, a CLI flag, or an export
  of a published package. Other names go in the working notes.
- Add an example when it makes a decision clearer. An example that is the decision, such as a config shape or a command
  line, changes only when the decision does. An example of behavior or output goes stale as the code changes, so add
  one only when it explains a decision, and don't keep it in step with the code.
- Say when a choice is only for now, such as "could be added later". Otherwise a later reader takes it as a lasting
  rule.
- Define a new term where it's first used. If it's used across the repo, add it to the [glossary](./glossary.md) in the
  same PR.

## Working notes

The working notes hold what the design leaves out while the feature is designed and built:

- details tied to the code, such as function, type, and property names, and where things live;
- the small defaults and edge cases settled along the way;
- a checklist of what's left to design and build;
- open questions: side questions, deferred points, and details parked until their part comes up;
- findings and research that aren't decisions.

Anyone who works on the feature, a person or a coding agent, reads them to pick up where the last one stopped, and
updates them as they go. Keep them short and current. Git history keeps what changed.

Detail goes here, not in the design. That keeps the design to its decisions, so later changes to the code don't touch
it.

```markdown
# <Feature>: working notes

Working notes for [the design](./README.md). They aren't kept current once the feature is finished. The code is the
source of truth.

## To do

- [ ] <What's left to design or build, one item per line.>

## Open questions

- <A side question, a deferred point, or a detail parked until its part comes up, in one line.>

## Details

<Names, where things live, internal steps, and findings, grouped by part.>
```

When the feature is finished, stop updating them. Leave them as they are, or delete them if nothing in them helps
anymore.

## Keep security details out

The design, the working notes, PRs, and commits are public as soon as they're pushed. Never write anything in them that
could help an attacker, whether against this repo or against people who use cspell:

- secrets, tokens, or credentials;
- a vulnerability that isn't fixed and released, or how to trigger one;
- a way to make cspell load or run code from a source the user didn't choose to trust;
- a weakness in the CI workflows, the release process, or the repo's settings.

An open checklist item can give one away as easily as a paragraph. Report and discuss a vulnerability privately, as
[`SECURITY.md`](../SECURITY.md) describes.

## How to design

A design works at two levels:

- **The overview:** the approach, and the whole shape of the feature.
- **The details:** how each part works.

A part is a piece of the feature that can be designed on its own, such as a config option, a CLI flag, or how a setting
merges across config files. The overview names the parts.

Each level has two phases:

- **Explore:** discuss the problem and the options, research what you don't know, and try things. Nothing is decided
  yet.
- **Decide:** choose, and write the choice down with its reason.

Finish the overview before starting on the details. A detail decided while the overview is still moving often has to
be decided again. A design that dives into details early gets lost in them. Until the overview is agreed, names and
shapes in an example are placeholders. A detail question is parked in the working notes' Open questions, and comes
back with its part.

### 1. Get to the why

A feature usually starts as a problem to solve, or as a solution ("we need an option"). Ask "why?" until you reach the
reason: who is affected, and what goes wrong for them today. Look at the issue and the code first, so the why rests on
facts. Then settle why now, what success looks like, and what's out of scope. Fill in what the issue and the code show,
and ask about the rest.

### 2. Explore approaches

Find the approaches that could solve the why, usually two or three. For each, sketch what a user writes (the config or
the command line), and what cspell does. Compare them against the overview questions in the
[design questions](./design-questions.md), which include the [design principles](./design-principles.md). Research what
you don't know. Write the approaches under Overview while you explore.

### 3. Decide the overview

Choose an approach, and write the Overview in place of the approaches explored: the shape in a few lines, the main
parts, and each decision the approach rests on, with its reason.

### 4. Agree on the whole overview

Read the whole overview as one piece, with whoever reviews the design. It's ready when these are all settled:

- the approach;
- what users see;
- the parts;
- the decisions the approach rests on.

The details start only once it's agreed.

### 5. Work through each part

Take the parts one at a time, and for each, explore before deciding:

- **Explore:** what the part has to handle, what cspell's config resolution, the CLI, and the published packages allow,
  and what's unclear. Pick up its parked details.
- **Decide:** work through the detail questions in the [design questions](./design-questions.md). Spend time on a
  detail when it's hard to undo once it ships, or could change the overview. Settle the rest with sensible defaults,
  and write them in the working notes, where a reviewer can check them at a glance.

### 6. Go back up when a detail challenges the overview

When a detail shows the overview is wrong, stop working on the details. Change the overview: explore again as in step
2 if the approach itself is in question, then decide as in step 3. Agree on it again as in step 4. Then go back over the
details already decided that depend on what changed.

### 7. Settle the whole-feature questions

After the last part, or before you stop designing to build, work through the whole-feature questions in the
[design questions](./design-questions.md) once, such as how the feature is released and which docs change. Write the
answers in the Overview. They don't reopen it, unless one shows the approach is wrong: then go back up as in step 6.

### 8. Let the code settle the rest

When a question is easier to answer by building or trying something, stop designing and build. Keep the checklist in
the working notes current as you go. Update the design when the code shows a decision was wrong. An edge case found
while building goes in the working notes.

## When the feature is finished

Finish the design in the PR that finishes the feature. This removes the working notes from the design, not the reasons.

- Add a `tl;dr` at the top: the choices that matter, in short, plain sentences.
- Add a line saying that the code and docs are the source of truth.
- Keep each decision with its reason.
- Keep an idea that wasn't chosen only when it's a real lesson that would save the next person from repeating it, and
  write it in the decision's text. A list of rejected ideas reads as a firm ruling, and can stop a later improvement.
- Move what only restates the code, such as function names and internal steps, to the working notes.
- Settle or drop each open question in the working notes. Open an issue only for a real problem someone would act on.
- Finish each other file in the folder the same way, and delete one that no longer adds anything.
- Have someone new to the feature read only the design, without the code. They should be able to say what was decided,
  why, and how the decisions fit together.

If the design set a rule that holds beyond this feature, add it to the [design principles](./design-principles.md) or
the doc under `docs/` where it applies. When it could affect other designs, do that in its own `docs:` PR.

After that, the working notes stop being updated, and nothing is left to do.

## Changing a design later

Update a design only when the design changes: a decision, or the reason for it. Don't update it because the code
changed. A fix for an edge case changes the code and its tests, not the design.

- Rewrite the decision in place. Say what showed the old choice was wrong, if that would save the next person from
  repeating it.
- When the overview changes, check the details that depend on it.
- Delete a part that no longer applies. Git history keeps it.

## Designs and RFCs

[RFCs](../rfc/) are public proposals for large capabilities, discussed with users. They describe a problem and a
direction. A design works out how to build a feature, whether or not an RFC motivated it. A design based on an RFC
links to it under Why.

## With Claude Code

The `feature-design` skill runs this as an interview. It can also check a small change for side effects before it's
built.
