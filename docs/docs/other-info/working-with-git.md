---
parent: Other Info
---

# Working With Git

CSpell can be used to spell check files that have been changed as well as spell checking the commit message.

## Git Commit Hooks

### Pre-Commit

#### **`.git/hooks/pre-commit`**

```sh
#!/bin/sh

exec git diff --cached --name-only | npx cspell --no-summary --no-progress --no-must-find-files --file-list stdin
```

### Commit Message

#### **`.git/hooks/commit-msg`**

```sh
#!/bin/sh

exec npx cspell --no-summary --no-progress --language-id commit-msg $1
```
