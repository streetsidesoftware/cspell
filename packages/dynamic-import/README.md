# `@cspell/dynamic-import`

A small library to assist with dynamically loading CommonJS and ESM Modules from either CommonJS or ESM Modules.

## Install

```sh
npm install -S @cspell/dynamic-import
```

## Usage

### Example ESM Package

Example loading [chalk v5](https://www.npmjs.com/package/chalk) which is an ESM only module.

**TypeScript Common JS**

```ts
import { dynamicImport } from '@cspell/dynamic-import';

const pChalk = dynamicImport<typeof import('chalk')>('chalk', __dirname);
```

**TypeScript ESM**

```ts
import { dynamicImport } from '@cspell/dynamic-import';

const pChalk = dynamicImport<typeof import('chalk')>('chalk', import.meta.url);
```

### Example ESM files

**TypeScript Common JS**

```ts
import { dynamicImport } from '@cspell/dynamic-import';

const pIndex = dynamicImport<typeof import('../esm/index.mjs')>('../esm/index.mjs', __dirname);
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

<!--- cspell:dictionaries typescript --->
