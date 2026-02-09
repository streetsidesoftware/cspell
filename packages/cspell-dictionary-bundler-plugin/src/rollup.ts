/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import { InlineCSpellConfig } from './index.ts';

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import Starter from '@cspell/dictionary-bundler-plugin/rollup'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const rollup = InlineCSpellConfig.rollup as typeof InlineCSpellConfig.rollup;
export default rollup;
export { rollup as 'module.exports' };
