/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { InlineCSpellConfig } from './index.ts';

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Starter from '@cspell/dictionary-bundler-plugin/vite'
 *
 * export default defineConfig({
 *   plugins: [Starter()],
 * })
 * ```
 */
const vite = InlineCSpellConfig.vite as typeof InlineCSpellConfig.vite;
export default vite;
export { vite as 'module.exports' };
