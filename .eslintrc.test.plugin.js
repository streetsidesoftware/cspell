/**
 * @type { import("eslint").Linter.Config }
 */
const config = {
    extends: ['./.eslintrc.js', 'plugin:@cspell/recommended'],
};

module.exports = config;
