# Caching Spell Checking Results

Spell checking a large project can take a lot of time.

In most cases, the files do not change from run to run, so the results are not expected to change.

The idea is to cache the results of the previous runs and use those same results if nothing has changed.

This is also related to ignoring known issues, see [Feature: Support Known Spelling Issues · Issue #1297 · streetsidesoftware/cspell](https://github.com/streetsidesoftware/cspell/issues/1297).
