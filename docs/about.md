---
layout: default
title: About
nav_order: 2
permalink: /about/
---

# About

CSpell started out as an extension for [VS Code](https://code.visualstudio.com/): [Code Spell Checker - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker).
When we started using VS Code, it did not have a spell checker. As a person that has trouble with spelling, I found this to be a great hinderance, thus the extension was born.
At the suggestion of users, `cspell` was pulled out of the extension and into its own library and command line tools.

## Goals

The goal was to have a fast spell checker that could check spelling as you type.

- Fast - check as you type
- Self-contained - a pure JS implementation - does not need external binaries or to talk to a web service.
- Compact - the size of the spell checker should not be much bigger than the comparable Hunspell dictionary.
- Configurable - much of CSpell is configured through `cspell.json` files.
- Custom Dictionaries - custom dictionaries can be easily added and used.

<!---
This is the base Jekyll theme. You can find out more info about customizing your Jekyll theme, as well as basic Jekyll usage documentation at [jekyllrb.com](https://jekyllrb.com/)

You can find the source code for Minima at GitHub:
[jekyll][jekyll-organization] /
[minima](https://github.com/jekyll/minima)

You can find the source code for Jekyll at GitHub:
[jekyll][jekyll-organization] /
[jekyll](https://github.com/jekyll/jekyll)

[jekyll-organization]: https://github.com/jekyll
--->
