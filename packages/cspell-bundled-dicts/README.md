# Cspell Bundled Dictionaries

This package contains all the dictionaries bundled with cspell.

It has been pulled into its own package to make it easier to Webpack cspell.

## Webpack

Example `webpack.config.js` modification:

```js
  externals: [
    /^@cspell\/cspell-bundled-dicts/,
  ],
```

Example: `package.json`:

```json
  "devDependencies": {
    "cspell": "^10"
  },
  "dependencies": {
    "@cspell/cspell-bundled-dicts": "^10"
  }
```

See [streetsidesoftware/cspell-action](https://github.com/streetsidesoftware/cspell-action)
