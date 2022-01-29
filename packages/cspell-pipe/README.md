# `@cspell/cspell-pipe`

A library to assist with working with Iterables and AsyncIterables

## Install

```sh
npm install -S @cspell/cspell-pipe
```

## Usage

```ts
import { GitIgnore, findRepoRoot } from 'cspell-gitignore';

// ...

const cwd = process.cwd();
const root = (await findRepoRoot(cwd)) || cwd;
const gitIgnore = new GitIgnore([root]);

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

# `cspell-gitignore` CLI

`cspell-gitignore` provides a simple cli for debugging .gitignore issues.

In most cases it should provide the same output as `git check-ignore`.

## Usage

```text
Usage cspell-gitignore [options] <files>

Check files against .gitignore
Compare against git check-ignore -v -n <files>

Options:
  -r, --root   Add a root to prevent searching for .gitignore files above the root if the file is under the root.
               This option can be used multiple times to add multiple roots. The default root is the current
               repository root determined by the `.git` directory.

Example:
  cspell-gitignore README.md
  cspell-gitignore -r . node_modules

```

## Example:

```sh
$ cspell-gitignore -r . node_modules
.gitignore:58:node_modules/       node_modules
```
