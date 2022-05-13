---
layout: default
title: Overrides
categories: configuration
parent: Configuration
nav_order: 11
---

<!--- Remove published when the page is ready  --->

# Overrides

Overrides are useful for forcing configuration on a per file basis.

Example:

```javascript
    "overrides": [
        // Force `*.hrr` and `*.crr` files to be treated as `cpp` files:
        {
            "filename": "**/{*.hrr,*.crr}",
            "languageId": "cpp"
        },
        // Force `*.txt` to use the Dutch dictionary (Dutch dictionary needs to be installed separately):
        {
            "language": "nl",
            "filename": "**/dutch/**/*.txt"
        }
    ]
```

<!---
    These are at the bottom because the VSCode Marketplace leaves a bit space at the top

    cSpell:disableCompoundWords
    cSpell:ignore  compoundwords stringlength errornumber
    cSpell:ignore jsja goededag alek wheerd behaviour tsmerge QQQQQ ncode
    cSpell:includeRegExp Everything
    cSpell:ignore hte variabele alinea
    cSpell:ignore mkdirp githubusercontent streetsidesoftware vsmarketplacebadge visualstudio
    cSpell:words Verdana
    cSpell:ignore ieeees beees treeees
    cSpell:ignore amet
-->

<!---
You can use the [editor on GitHub](https://github.com/streetsidesoftware/cspell/edit/main/docs/index.md) to maintain and preview the content for your website in Markdown files.
--->
