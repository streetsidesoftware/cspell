/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    extends: ['./.eslintrc.js', 'plugin:@cspell/debug'],
};

module.exports = config;
