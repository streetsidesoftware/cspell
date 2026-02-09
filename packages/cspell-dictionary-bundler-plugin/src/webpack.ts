/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import { InlineCSpellConfig } from './index.ts';

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
const webpack = InlineCSpellConfig.webpack as typeof InlineCSpellConfig.webpack;
export default webpack;
export { webpack as 'module.exports' };
