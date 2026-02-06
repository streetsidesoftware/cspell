/**
 * This entry file is for esbuild plugin.
 *
 * @module
 */

import { Starter } from './index.ts';

/**
 * Esbuild plugin
 *
 * @example
 * ```ts
 * import { build } from 'esbuild'
 * import Starter from '@cspell/dictionary-bundler-plugin/esbuild'
 *
 * build({ plugins: [Starter()] })
```
 */
const esbuild = Starter.esbuild as typeof Starter.esbuild;
export default esbuild;
export { esbuild as 'module.exports' };
