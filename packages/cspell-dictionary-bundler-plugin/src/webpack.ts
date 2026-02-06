/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import { Starter } from './index.ts';

/**
 * Webpack plugin
 *
 * @example
 * ```js
 * // webpack.config.js
 * import Starter from '@cspell/dictionary-bundler-plugin/webpack'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const webpack = Starter.webpack as typeof Starter.webpack;
export default webpack;
export { webpack as 'module.exports' };
