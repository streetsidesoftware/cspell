---
title: 'Installing CSpell'
categories: docs
# parent: Docs
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Node

CSpell requires Node.js to run. Most likely it is already installed.

### **Check the node version**

```sh
node -v
```

It should be greater than `18.x`.

### Resources:

- [Downloading and installing Node.js and npm - npm Docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Download - Node.js](https://nodejs.org/en/download/)
- [Releases - Node.js](https://nodejs.org/en/about/releases/)

## CSpell

```sh npm2yarn
npm install -g cspell@latest
```

## Running CSpell

- ```sh
  cspell .
  ```
- ```sh
  npx cspell .
  ```
- ```sh
  yarn cspell .
  ```

# See Also

- [Getting Started](./getting-started)
