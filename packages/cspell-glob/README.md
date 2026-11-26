# `cspell-glob`

A simple library for checking filenames against a set of glob rules. It attempts to emulate the `.gitignore` rules.

## Purpose

The purpose behind this library is a bit different than the other glob matchers.
The goal here is to see if a file name matches a glob, not to find files that match globs.
This library doesn't do any file i/o. It uses [micromatch](https://github.com/micromatch/micromatch#readme) under the hood for the actual matching.

## Usage

```ts
import { GlobMatcher } from 'cspell-glob';

// Patterns behave like the contents of a `.gitignore` file.
const patterns = ['*.test.js', '!important.test.js'];

const matcher = new GlobMatcher(patterns, process.cwd());

matcher.match('src/app.test.js'); // true -- matches `*.test.js`
matcher.match('src/important.test.js'); // false -- excluded by the negated pattern
matcher.match('src/app.js'); // false -- does not match any pattern
```

By default, `GlobMatcher` runs in `exclude` mode (like `.gitignore`). Use `include` mode when searching for
files to check, where patterns must be more explicit to match:

```ts
const matcher = new GlobMatcher(['src/**/*.ts'], { root: process.cwd(), mode: 'include' });

matcher.match('src/app.ts'); // true
matcher.match('node_modules/lib/index.ts'); // false
```

<!--- @@inject: ../../static/footer.md --->

<br/>

---

<p align="center">
Brought to you by <a href="https://streetsidesoftware.com" title="Street Side Software">
<img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software
</a>
</p>

<!--- @@inject-end: ../../static/footer.md --->
