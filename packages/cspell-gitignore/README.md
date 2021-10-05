# `cspell-gitignore`

A library to assist reading and filtering out files matching glob patterns found in `.gitignore` files.

## Install

```sh
npm install -S cspell-gitignore
```

## Usage

```ts
import { GitIgnore } from 'cspell-gitignore';

// ...

const gitIgnore = new GitIgnore();

const allFiles = glob('**');

const files = await gitIgnore.filterOutIgnored(allFiles);
```

## Logic

- For each file, search for the `.gitignore` files in the directory hierarchy.
- Ignore any files that match the globs found in the `.gitignore` files.

The `.gitignore` globs are evaluated from highest to lowest, matching the `git` behavior.

To prevent searching higher in the directory hierarchy, specify roots:

```ts
const gitIgnore = new GitIgnore([process.cwd()]);
```
