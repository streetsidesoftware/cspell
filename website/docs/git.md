---
layout: default
title: Working with Git
categories: docs
parent: Docs
nav_order: 4
published: false
---

<!--- Remove published when the page is ready  --->

# Tips for Working with Git

CSpell can be used to spell check files that have been changed as well as spell checking the commit message.

# Git commit-hooks

## pre-commit

**`.git/hooks/pre-commit`**

```sh
#!/bin/sh

exec git diff --cached --name-only | npx cspell --no-summary --no-progress --no-must-find-files --file-list stdin
```

## commit-msg

**`.git/hooks/commit-msg`**

```sh
#!/bin/sh

exec npx cspell --no-summary --no-progress --language-id commit-msg $1
```
