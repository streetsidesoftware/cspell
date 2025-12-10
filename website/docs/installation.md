---
title: 'Installing CSpell'
categories: docs
# parent: Docs
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Project

### Node

CSpell requires Node.js version `>=18.0`.

> **Check the node version**
>
> ```sh
> node -v
> ```
>
> Ensure that you are meeting the requirements.

The below commands install CSpell.

```sh npm2yarn
npm install -g cspell@latest
```

#### Usage

- ```sh
  cspell .
  ```
- ```sh
  npx cspell .
  ```
- ```sh
  yarn cspell .
  ```

#### Resources

- [Downloading and installing Node.js and npm - npm Docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Download - Node.js](https://nodejs.org/en/download/)
- [Releases - Node.js](https://nodejs.org/en/about/releases/)

## CI

### Github

The Github action will automatically configure a Github reporter which will result in issues being created as annotations on the source code making them visible in pr's etc.

#### Usage

Example `spellcheck.yaml`

```yaml
name: 'Check spelling'
on: # rebuild any PRs and main branch changes
  pull_request:
  push:

jobs:
  spellcheck: # run the action
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          persist-credentials: false
      - uses: streetsidesoftware/cspell-action@v8
```

# See Also

- [Getting Started](./getting-started)
