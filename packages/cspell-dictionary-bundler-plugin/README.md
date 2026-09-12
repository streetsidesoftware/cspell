# @cspell/dictionary-bundler-plugin

A [unplugin](https://github.com/unjs/unplugin)-based bundler plugin that embeds CSpell configuration files,
along with any custom dictionaries they reference, directly into your bundle.

It matches imports of `cspell.json`, `cspell.config.yaml`, `cspell-ext.json`, and similar CSpell config files,
resolves their `dictionaryDefinitions`, and replaces the import with the fully resolved settings object --
with each dictionary file embedded as base64 data. This makes it possible to ship a CSpell configuration
(including custom dictionaries) to environments that don't have file-system access, such as a browser or a
web worker. Dictionaries can optionally be converted to the faster-loading BTrie format and/or gzip-compressed
as part of the bundling step.

Works with Vite, Rollup, Rolldown/tsdown, esbuild, Webpack, Rspack, and Farm.

## Installation

```bash
npm i -D @cspell/dictionary-bundler-plugin
```

## Usage

Import a CSpell config file like any other module, and the plugin replaces it at build time with the resolved
settings, including dictionary contents:

```ts
// my-config.ts
import cspellConfig from './cspell.json';

export const config = cspellConfig;
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import InlineCSpellConfig from '@cspell/dictionary-bundler-plugin/vite';

export default defineConfig({
  plugins: [InlineCSpellConfig()]
});
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import InlineCSpellConfig from '@cspell/dictionary-bundler-plugin/rollup';

export default {
  plugins: [InlineCSpellConfig()]
};
```

<br></details>

<details>
<summary>Rolldown / tsdown</summary><br>

```ts
// rolldown.config.ts / tsdown.config.ts
import InlineCSpellConfig from '@cspell/dictionary-bundler-plugin/rolldown';

export default {
  plugins: [InlineCSpellConfig()]
};
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
import { build } from 'esbuild';
import InlineCSpellConfig from '@cspell/dictionary-bundler-plugin/esbuild';

build({
  plugins: [InlineCSpellConfig()]
});
```

<br></details>

<details>
<summary>Webpack</summary><br>

```js
// webpack.config.js
import InlineCSpellConfig from '@cspell/dictionary-bundler-plugin/webpack';

export default {
  /* ... */
  plugins: [InlineCSpellConfig()]
};
```

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
import InlineCSpellConfig from '@cspell/dictionary-bundler-plugin/rspack';

export default {
  /* ... */
  plugins: [InlineCSpellConfig()]
};
```

<br></details>

<details>
<summary>Farm</summary><br>

```ts
// farm.config.js
import InlineCSpellConfig from '@cspell/dictionary-bundler-plugin/farm';

export default {
  /* ... */
  plugins: [InlineCSpellConfig()]
};
```

<br></details>

## Options

```ts
interface Options {
  /** Files to include. Defaults to matching cspell config files, e.g. `cspell.json`, `cspell.config.yaml`. */
  include?: FilterPattern;
  /** Files to exclude. */
  exclude?: FilterPattern;
  /** Plugin build stage. */
  enforce?: 'pre' | 'post';
  /**
   * Convert dictionaries to the BTrie format, which significantly reduces load time at the cost of a larger
   * output file.
   * @default true
   */
  convertToBTrie?: boolean;
  /**
   * The minimum dictionary size (in bytes) before it is converted to BTrie format.
   * @default 200
   */
  minConvertSize?: number;
  /** Compress inlined dictionary data using gzip. */
  compress?: boolean;
  /** Enable debug logging. */
  debug?: boolean;
}
```
