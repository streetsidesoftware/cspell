# Contributing

These are some notes about contributing to the project.

**Note:** To add or remove words in a dictionary, visit [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts/issues).

## Continuous Integration

### Code Coverage

- https://coveralls.io/github/streetsidesoftware/cspell

### NPM

- https://www.npmjs.com/package/cspell
- https://www.npmjs.com/package/cspell-lib
- https://www.npmjs.com/package/cspell-trie-lib

## Development

Node JS version 18 or higher is required.

### Commands

| Command                   | Description                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm install`            | Installs all the dependencies for all packages                                                |
| `pnpm run build`          | To compile the typescript into javascript                                                     |
| `pnpm test`               | Runs the unit tests for all packages                                                          |
| `pnpm run check-spelling` | Checks the spelling for all sources files                                                     |
| `pnpm run coverage`       | Generates coverage information for all projects. Open `coverage/index.html` to view coverage. |
