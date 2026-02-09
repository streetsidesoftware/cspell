/**
 * This entry file is for esbuild plugin.
 *
 * @module
 */

import { InlineCSpellConfig } from './index.ts';

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
const esbuild = InlineCSpellConfig.esbuild as typeof InlineCSpellConfig.esbuild;
export default esbuild;
export { esbuild as 'module.exports' };
