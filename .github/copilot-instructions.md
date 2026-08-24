# Copilot Instructions

Project instructions live in [`AGENTS.md`](../AGENTS.md) at the repository root. Read it before
making changes — it covers setup, generated files, the release flow, and PR title conventions.

Two rules that break things if missed:

- Never "fix" spelling in `fixtures/`, `test-fixtures/`, `integration-tests/`, `examples/`, or
  snapshots. The misspellings are intentional test data.
- Never add words to `cspell-dict.txt` to make `pnpm run check-spelling` pass.
