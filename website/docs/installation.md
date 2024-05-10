---
title: 'Installing CSpell'
categories: docs
# parent: Docs
sidebar_position: 2
sidebar_label: Installation
---

# Installation

## Node

CSpell requires Node JS to run. Most likely it is already install.

### **Check the node version**

```sh
node -v
```

It should be greater than `14.x`.

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

- [Getting Started](./getting-started)
