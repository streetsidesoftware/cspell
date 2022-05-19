---
nav_order: 3
---

# Installation

## Install Node

Since it is written in TypeScript, CSpell requires [NodeJS](https://nodejs.org/en/) to run. Many people will already have it installed. If you don't have it installed already, download and install it from the [Node.js download page](https://nodejs.org/en/download/).

### Minimum Required Version

CSpell requires a version of `node` that is >= `12.0.0`. You can check your `node` version like this:

```sh
node --version
```

## Install CSpell

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
