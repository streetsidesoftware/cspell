# cspell

[![GitHub Actions](https://github.com/streetsidesoftware/cspell/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/streetsidesoftware/cspell/actions)
[![Coverage Status](https://coveralls.io/repos/github/streetsidesoftware/cspell/badge.svg?branch=main)](https://coveralls.io/github/streetsidesoftware/cspell?branch=main)
[![codecov](https://codecov.io/gh/streetsidesoftware/cspell/branch/main/graph/badge.svg?token=Dr4fi2Sy08)](https://codecov.io/gh/streetsidesoftware/cspell)

`cspell` is a command line tool for spell checking code, documents, or anything else.

Please see the [online documentation](https://cspell.org/) for more info.

## Installation

First, CSpell requires [NodeJS](https://nodejs.org/en/download/) to be installed.

In a JavaScript/TypeScript project, it is recommended to install CSpell as a development dependency:

```sh
# If you use NPM
npm install --save-dev cspell

# Or, if you use Yarn
yarn add --dev cspell
```

Otherwise, you can install CSpell globally so that you can use it on the command-line from anywhere you want:

```sh
npm install --global cspell
```

For more detailed information, see the full [installation documentation](https://cspell.org/docs/installation/).

## Example Usage

Spell check every file in your repository:

```sh
npx cspell "**"
```

Spell check some specific files in your repository:

```sh
npx cspell "src/**/*.js"
```

Search through the currently installed dictionaries for a particular word:

```sh
npx cspell trace "poop"
```

Get a suggestion for a particular word:

<!-- cspell:ignore absense -->

```sh
cspell suggestions "absense"
```

For more detailed information, see the full [getting started guide](https://cspell.org/docs/getting-started/).

## Integrating CSpell into an Existing Project and Weeding Out All the False Positives

If you run CSpell on all the files of an existing project, it will probably find a bunch of false positives. So, the first step is to get rid of all the false positives. We can do that by adding some words to a custom dictionary for the project.

For more information, see the full [getting started guide](https://cspell.org/docs/getting-started/).

## Configuration File

CSpell supports a per-project configuration file. For example, this is where you would specify that the current project language is Spanish, or where you would specify a list of project-wide whitelisted words.

As an example configuration file to get started, you can create the following file at the root of your repository:

#### **`.cspell.json`** <!-- markdownlint-disable MD001 -->

```json
{
  "$schema": "https://raw.githubusercontent.com/streetsidesoftware/cspell/main/cspell.schema.json",
  "version": "0.2",
  "language": "en-US",
  "words": ["foo", "bar"]
}
```

- The `$schema` field is to get auto-complete on the properties inside of your IDE (e.g. VSCode).
- The `version` field specifies what version of the configuration format you are using. The latest version at the time of this writing is 0.2, so you should always specify that in your configuration files.
- The `language` field specifies the current natural language, which in turn determines what dictionaries that CSpell will load. The possible languages that you can choose from is based upon which dictionaries you currently have imported. By default, you can choose from "en", "en-US", and "en-GB".
- The `words` field specifies an array of project-specific words that should not be flagged as spelling errors.

CSpell has [many more configuration options](../../docs/types/cspell-types/interfaces/CSpellSettings.md) than just this! And for more information on the configuration file itself, see the full [configuration file documentation](https://cspell.org/docs/configuration-file/).
