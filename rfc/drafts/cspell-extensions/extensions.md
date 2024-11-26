# CSpell Extensions

There are two types of extensions.

1. Pure static declarative config files. Loading the config file always has the same result.
1. Dynamic Extensions - Config defined in JavaScript

## Static Extensions

At the time of this writing, [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts) has only static dictionary extensions.

These extensions are defined as `cspell-ext.json`. They tend to define static dictionaries and a few regexp patterns for include / exclude.

## Dynamic Extensions

CSpell currently supports using `default` exports from JavaScript files to get the configuration. If the `default` is a function, then it is called exactly once on load.

This method does allow some flexibility, but not much. It is possible for a `cspell.config.mjs` file to load content and return it as configuration. It works fine if the `cspell.config.mjs` file is in the users directory, but it does not make it easy to write a generic extension.

## Proposal

### Extending Imports to allow settings

**`cspell.config.yaml`**

```yaml
import:
  - ['@cspell/hunspell-ext', 'nl-nl'] # Use the Hunspell Extension to import the Dutch Hunspell dictionary.
  - ['@cspell/hunspell-ext', 'eu'] # Use the Hunspell Extension to import the Basque Hunspell dictionary.
  - '@cspell/dict-de-de' # import German dictionary.
```

- `@cspell/hunspell-ext` could be a cspell-extension that allowed importing Hunspell files directly.

### Configurations

Support the following exports:

```js
export const name = 'name of extension';
/**
 * @param {import("./types.ts").Context} context
 * @param {unknown[]} params
 * @returns {Promise<import("@cspell/cspell-types").CSpellUserSettings>}
 */
export default function getConfiguration(context, params);
```
