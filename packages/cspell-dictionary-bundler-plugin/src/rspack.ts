/**
 * This entry file is for Rspack plugin.
 *
 * @module
 */

import { Starter } from './index.ts';

/**
 * Rspack plugin
 *
 * @example
 * ```js
 * // rspack.config.js
 * import Starter from '@cspell/dictionary-bundler-plugin/rspack'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const rspack = Starter.rspack as typeof Starter.rspack;
export default rspack;
export { rspack as 'module.exports' };
