---
title: 'Installing CSpell'
categories: docs
# parent: Docs
nav_order: 2
---

# Installation

## Node

CSpell requires Node.js to run.

### **Check the node version**

```sh
node -v
```

CSpell requires Node.js version `>=18.0`.

### Resources:

- [Downloading and installing Node.js and npm - npm Docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [Download - Node.js](https://nodejs.org/en/download/)
- [Releases - Node.js](https://nodejs.org/en/about/releases/)

## CSpell

### **NPM Global**

```sh
npm install -g cspell@latest
```

### **NPM Package**

```sh
npm install --save-dev cspell@latest
```

### **Yarn Package**

```sh
yarn add --dev cspell@latest
```

## Running CSpell

- ```sh
  cspell "**"
  ```
- ```sh
  npx cspell "**"
  ```
- ```sh
  yarn cspell "**"
  ```

# See Also

- [Getting Started](./getting-started.md)
