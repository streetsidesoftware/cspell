/**
 * This entry file is for Farm plugin.
 *
 * @module
 */

import { InlineCSpellConfig } from './index.ts';

/**
 * Farm plugin
 *
 * @example
 * ```ts
 * // farm.config.js
 * import Starter from '@cspell/dictionary-bundler-plugin/farm'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const farm = InlineCSpellConfig.farm as typeof InlineCSpellConfig.farm;
export default farm;
export { farm as 'module.exports' };
