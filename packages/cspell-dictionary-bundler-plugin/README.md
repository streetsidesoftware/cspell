# @cspell/dictionary-bundler-plugin

Starter template for [unplugin](https://github.com/unjs/unplugin).

## Installation

```bash
npm i -D @cspell/dictionary-bundler-plugin
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import Starter from '@cspell/dictionary-bundler-plugin/vite';

export default defineConfig({
  plugins: [Starter()]
});
```

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import Starter from '@cspell/dictionary-bundler-plugin/rollup';

export default {
  plugins: [Starter()]
};
```

<br></details>

<details>
<summary>Rolldown / tsdown</summary><br>

```ts
// rolldown.config.ts / tsdown.config.ts
import Starter from '@cspell/dictionary-bundler-plugin/rolldown';

export default {
  plugins: [Starter()]
};
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
import { build } from 'esbuild';
import Starter from '@cspell/dictionary-bundler-plugin/esbuild';

build({
  plugins: [Starter()]
});
```

<br></details>

<details>
<summary>Webpack</summary><br>

```js
// webpack.config.js
import Starter from '@cspell/dictionary-bundler-plugin/webpack';

export default {
  /* ... */
  plugins: [Starter()]
};
```

<br></details>

<details>
<summary>Rspack</summary><br>

```ts
// rspack.config.js
import Starter from '@cspell/dictionary-bundler-plugin/rspack';

export default {
  /* ... */
  plugins: [Starter()]
};
```

<br></details>
