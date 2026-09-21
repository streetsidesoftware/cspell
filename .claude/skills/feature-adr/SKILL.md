---
name: feature-adr
description: 'Design a new cspell feature (a directive, an option, a CLI flag, a behavior change) through a structured interview, recording each decision as an ADR under docs/ADRs/<feature-slug>/ and keeping docs/glossary.md in sync. Use this whenever the user wants to design, spec out, or plan a feature before writing code — proposes a new cspell configuration setting, wants to add a CLI flag, is unsure how an edge case should behave, or explicitly asks for an ADR, a design doc, or to "figure out the details" of something. Trigger even if the user doesn''t say "ADR" or "skill" by name — any request to add new behavior to this tool that has more than one reasonable interpretation is a candidate. Do not use this for pure bug fixes, refactors, or requests where the behavior is already fully specified.'
---

# Feature ADR

## Why this exists

The cheapest time to catch a bad design decision is before any code exists to
defend it. cspell's configuration system has a lot of surface area that isn't
obvious from a feature request alone — inheritance order, `overrides` vs.
`languageSettings`, CLI-flag precedence, glob interaction, dictionary loading,
schema generation. A request that sounds simple ("add a flag to skip X") usually
has two or three genuinely reasonable answers hiding in it. This skill's job is to
surface those choices explicitly, get the user to pick one deliberately, and leave
a written record of *why* — so an implementer (human or agent) can build the
feature later without re-deriving decisions or silently picking the wrong default.

This skill produces design artifacts only. Don't write implementation code as
part of it, even if the answer to a question seems obvious enough to just build.
If the user wants to jump straight to code mid-interview, that's their call to
make explicitly — don't make it for them by drifting into implementation.

## Process overview

1. Scope the feature, pick a `feature-slug`, and set up an isolated worktree
   for it.
2. Interview the user one question at a time, using cspell-specific angles to
   find the real open questions.
3. Write an ADR the moment a genuine decision lands, and commit it immediately
   — don't batch writing or committing to the end.
4. Keep `docs/glossary.md` in sync with any new terms.
5. Write the feature's index and hand off.

## Step 1: Scope the feature, pick a slug, and set up a worktree

Before asking design questions, get a one-sentence statement of what the feature
is and a `kebab-case` slug for it (e.g. `ignore-regex-per-language`). Check
whether `docs/ADRs/<feature-slug>/` already exists — if it does, this is a
continuation of earlier work, not a fresh start: read the existing ADRs and the
index `README.md` first so you don't re-ask settled questions or contradict a
prior decision without flagging it.

If `docs/ADRs/` doesn't exist yet in the repo, that's expected — create it fresh.

Do the ADR work in its own git worktree, on its own branch, so an in-progress
design discussion never sits as uncommitted or half-finished changes on
whatever branch the user happened to be on, and so it can be dropped or resumed
without disturbing other work. Check for an existing one first (continuation
case):

```bash
git worktree list
git branch --list adr/<feature-slug>
```

If neither exists, create both together:

```bash
git worktree add ../cspell-worktrees/adr-<feature-slug> -b adr/<feature-slug>
```

If the branch exists but isn't attached to a worktree (e.g. a resumed session
on a fresh checkout), attach without `-b`:

```bash
git worktree add ../cspell-worktrees/adr-<feature-slug> adr/<feature-slug>
```

Do the rest of this skill's file writes inside that worktree. This is local,
uncommitted-to-main, and reversible — no need to ask before creating it. Do not
push the branch or open a PR as part of this skill; that's a separate step the
user asks for explicitly once the design is ready.

## Step 2: Interview, one question at a time

Ask a single open question, wait for the answer, and let the answer shape the
next question — don't front-load a checklist onto the user. A wall of questions
gets shallow, rushed answers; a conversation gets considered ones.

Use `references/cspell-considerations.md` for the *categories* of question worth
probing (config surface, naming, glob interaction, dictionaries, CLI surface,
backward compatibility, cross-platform, performance, precedent). It's a checklist
for you, not a script to recite — most features only implicate two or three of
those categories. Skip the rest without asking the user to confirm they don't
apply.

Not every question needs an ADR. The bar: **did more than one reasonable answer
exist, and did the user pick one?** If the user's first instinct was the only
sane option, note it in the feature's index and move on — don't manufacture an
ADR for a non-decision. If you're weighing whether something clears that bar,
lean toward writing it down: a one-paragraph ADR that turns out unnecessary costs
little, while a real decision left unrecorded costs the next person real time.

Also watch for decisions the user makes *implicitly* by answering a different
question — e.g. if they specify a config key name, that also settles "is this
config-only or does it need a CLI flag" if they didn't mention a flag. Surface
that as an explicit question rather than assuming silence means "no."

## Step 3: Write an ADR per decision, as it lands

Naming: `docs/ADRs/<feature-slug>/NNNN-kebab-case-title.md`, numbered
sequentially starting at `0001` *within that feature's directory* (numbering
doesn't need to be unique across features).

Use `references/adr-template.md` verbatim as the structure: Status, Context,
Decision, Consequences, Alternatives considered. A few things worth getting
right:

- **Context** should be legible to someone who wasn't in the conversation — name
  the specific cspell mechanism that made this non-obvious (e.g. "`overrides` are
  applied in file order, last one wins"), not just "we discussed this."
- **Alternatives considered** is the section most tempting to skip. Skip it only
  when there really was one reasonable option — otherwise it's the part that
  saves the next person from re-litigating a choice you already made.
- Status starts as `Proposed`. Only mark `Accepted` once the user has confirmed
  the decision, not just discussed it — an interview can wander before it
  settles.
- If a later ADR in the same feature reverses an earlier one, mark the earlier
  one `Superseded by NNNN` rather than deleting it. The point of an ADR is that
  it's a record, including of decisions that changed.

Write the file as soon as a decision is confirmed, not at the end of the
interview — if the session ends early, partial progress should still be usable.

Commit right after writing or editing an ADR file, in the worktree from Step 1
— one commit per ADR change, not one big commit at the end. The point is the
same as writing the file immediately: if the discussion is interrupted, the
git history should show exactly how far the design got and in what order
decisions were made, not just a final snapshot. A short message is enough,
e.g.:

```bash
git add docs/ADRs/<feature-slug>/0002-*.md
git commit -m "docs(adr): <feature-slug> — <one-line summary of this decision>"
```

Commit `docs/glossary.md` and the index `README.md` updates the same way, as
their own commits, when you touch them — don't fold unrelated files into an
ADR commit.

## Step 4: Keep `docs/glossary.md` in sync

Check whether `docs/glossary.md` exists yet.

- **If it exists:** read it and follow its existing format exactly — heading
  level, alphabetization, whether entries link back to ADRs. Don't impose a new
  structure on an established file.
- **If it doesn't exist:** create it with this format, alphabetized by term:

  ```markdown
  # Glossary

  Terms introduced or given a specific meaning by cspell's configuration and ADRs.

  ### <Term>

  One or two sentence definition, written for someone who hasn't read the ADR.

  See: [`docs/ADRs/<feature-slug>/NNNN-...md`](ADRs/<feature-slug>/NNNN-...md)
  ```

Add an entry for any new config key, CLI flag, or concept introduced by the
feature that a reader wouldn't already understand from general cspell usage —
not for internal implementation terms that never surface to a user. If a term
already exists in the glossary but this feature changes its meaning, update the
entry in place and note the change, rather than adding a conflicting second
definition.

## Step 5: Wrap up and hand off

Write or update `docs/ADRs/<feature-slug>/README.md` as an index: the
one-sentence feature summary from Step 1, and a list of the ADRs with their
one-line titles and status. This is the file an implementer opens first.

Commit the index `README.md` too.

Before ending, tell the user explicitly:

- Where the ADRs and glossary updates live — the `adr/<feature-slug>` branch in
  the `../cspell-worktrees/adr-<feature-slug>` worktree — so they can review the
  commits, keep discussing, or merge it themselves.
- Whether anything decided here will trigger obligations from `AGENTS.md` once
  implemented — most commonly: a new/changed config option means
  `pnpm run update-schema` and a `website/docs` update; new or changed CLI output
  means snapshot updates and `pnpm run build:readme`. This skill doesn't run
  those — it's a heads-up for whoever implements the feature.
- That the feature is ready to hand off. Don't start implementing unless the
  user explicitly asks you to switch modes.

## A note on `rfc/`

This repo already has an `rfc/rfc-NNNN <title>/README.md` process for larger,
narrative feature proposals (background/problem/benefits prose, not discrete
decisions). ADRs under `docs/ADRs/` are a finer-grained, complementary artifact —
one per decision, not one per feature narrative. If the feature being designed
already has or clearly warrants a full RFC, mention that to the user rather than
silently choosing one process over the other; the two aren't mutually exclusive
(an RFC can motivate a feature, ADRs can record how it was actually decided).
