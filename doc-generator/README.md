# Document Generator

This _private_ package is to help with generating the static _type_ documentation.

It has been pulled into its own package to prevent `typedoc` from polluting `cspell-types` with its
dependencies.

There have been too many time where the build was broken when `typescript` was updated but `typedoc` didn't _"support"_ the new version. This issue has been circumvented by moving `typedoc` into this package so it can continue to use its preferred
version of `typescript`.

To Generate the docs:

```sh
npm run build-cspell-types-docs
```
