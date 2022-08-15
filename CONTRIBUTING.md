# Contributing

These are some notes about contributing.

## Continuous Integration

### Code Coverage

- https://coveralls.io/github/streetsidesoftware/cspell

### NPM

- https://www.npmjs.com/package/cspell
- https://www.npmjs.com/package/cspell-lib
- https://www.npmjs.com/package/cspell-trie
- https://www.npmjs.com/package/cspell-tools
- https://www.npmjs.com/package/cspell-glob

## Development

Node JS version 14 or higher is required.

### Commands

| Command                   | Description                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm install`            | Installs all the dependencies for all packages                                                |
| `pnpm run build`          | To compile the typescript into javascript                                                     |
| `pnpm test`               | Runs the unit tests for all packages                                                          |
| `pnpm run check-spelling` | Checks the spelling for all sources files                                                     |
| `pnpm run coverage`       | Generates coverage information for all projects. Open `coverage/index.html` to view coverage. |
