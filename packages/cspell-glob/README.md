# `cspell-glob`

A simple library for checking filenames against a set of glob rules. It attempts to emulate the `.gitignore` rules.

## Purpose

The purpose behind this library is a bit different than the other glob matchers.
The goal here is to see if a file name matches a glob, not to find files that match globs.
This library doesn't do any file i/o. It uses [micromatch](https://github.com/micromatch/micromatch#readme) under the hood for the actual matching.

## Usage

```
const cspellGlob = require('cspell-glob');

// TODO: DEMONSTRATE API
```

## CSpell for Enterprise

<!--- @@inject: ../../static/tidelift.md --->

Available as part of the Tidelift Subscription.

The maintainers of cspell and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source packages you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact packages you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-cspell?utm_source=npm-cspell&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

<!--- @@inject-end: ../../static/tidelift.md --->

<!--- @@inject: ../../static/footer.md --->

<br/>

---

<p align="center">
Brought to you by <a href="https://streetsidesoftware.com" title="Street Side Software">
<img width="16" alt="Street Side Software Logo" src="https://i.imgur.com/CyduuVY.png" /> Street Side Software
</a>
</p>

<!--- @@inject-end: ../../static/footer.md --->
