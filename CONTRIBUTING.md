# Contributing

These are some notes about contributing.

## Continuous Integration

### Travis-CI

-   https://travis-ci.org/streetsidesoftware/cspell

### Appveyor

-   https://ci.appveyor.com/project/streetsidesoftware/cspell

### Code Coverage

-   https://coveralls.io/github/streetsidesoftware/cspell

### NPM

-   https://www.npmjs.com/package/cspell
-   https://www.npmjs.com/package/cspell-lib
-   https://www.npmjs.com/package/cspell-trie
-   https://www.npmjs.com/package/cspell-tools
-   https://www.npmjs.com/package/cspell-glob

## Development

Node JS version 8 or higher is required.

### Commands

| Command                  | Description                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| `npm install`            | Installs all the dependencies for all packages                                                |
| `npm run build`          | To compile the typescript into javascript                                                     |
| `npm test`               | Runs the unit tests for all packages                                                          |
| `npm run check-spelling` | Checks the spelling for all sources files                                                     |
| `npm run coverage`       | Generates coverage information for all projects. Open `coverage/index.html` to view coverage. |
| `npx lerna publish`      | To publish the packages (must have permissions)                                               |
