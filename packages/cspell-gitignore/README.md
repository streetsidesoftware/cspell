# `cspell-gitignore`

A library to assist reading and filtering out files matching glob patterns found in `.gitignore` files.

## Install

```sh
npm install -S cspell-gitignore
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
- Stop at the root of the file's git repository, the nearest directory with a `.git` directory or file (see
  [Nested repositories](#nested-repositories)).
- Ignore any files that match the globs found in the `.gitignore` files.

The `.gitignore` globs are evaluated from highest to lowest, matching the `git` behavior.

To prevent searching higher in the directory hierarchy, specify roots:

```ts
const gitIgnore = new GitIgnore([process.cwd()]);
```

## Nested repositories

A git repository inside another one, such as a submodule, a worktree, or a cloned dependency, is handled the way
`git` handles it:

- The `.gitignore` files of the outer repository don't apply to the files in the nested one.
- When the nested repository is below one of the roots and the outer repository ignores its folder, all of it is
  ignored. A submodule listed in the outer repository's `.gitmodules` is the exception.

For example, with `.cache/` in the outer `.gitignore`, a clone in `.cache/dep/` is ignored, but a submodule in
`.cache/lib/` is not. Without roots, or with a root at or inside the nested repository, only the nested repository's own
`.gitignore` files apply.

## `cspell-gitignore` CLI

`cspell-gitignore` provides a simple cli for debugging .gitignore issues.

In most cases it should provide the same output as `git check-ignore`.

### Usage

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

### Example:

```sh
$ cspell-gitignore -r . node_modules
.gitignore:58:node_modules/       node_modules
```
