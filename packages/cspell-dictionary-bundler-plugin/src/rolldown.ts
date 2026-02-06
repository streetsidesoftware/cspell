/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import { Starter } from './index.ts';

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
const rolldown = Starter.rolldown as typeof Starter.rolldown;
export default rolldown;
export { rolldown as 'module.exports' };
