/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import { InlineCSpellConfig } from './index.ts';

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import Starter from '@cspell/dictionary-bundler-plugin/rolldown'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const rolldown = InlineCSpellConfig.rolldown as typeof InlineCSpellConfig.rolldown;
export default rolldown;
export { rolldown as 'module.exports' };
