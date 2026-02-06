/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { Starter } from './index.ts';

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
const vite = Starter.vite as typeof Starter.vite;
export default vite;
export { vite as 'module.exports' };
