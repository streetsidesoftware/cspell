# `@cspell/filetypes`

A library to help determine the type of a file.

## Install

```sh
npm install -S @cspell/filetypes
```

## Usage

```ts
import { findMatchingFileTypes } from '@cspell/filetypes';

console.log(findMatchingFileTypes('code.js')); // outputs: [ 'javascript' ]
```
