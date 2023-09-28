module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        jest: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:@cspell/recommended'],
    parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: ['@cspell'],
    root: true,
    rules: {
        '@cspell/spellchecker': [
            'warn',
            {
                debugMode: false,
                autoFix: true,
                cspell: {
                    dictionaries: ['business-terminology'],
                    dictionaryDefinitions: [
                        {
                            name: 'business-terminology',
                            path: './dictionaries/business-terminology.txt',
                        },
                    ],
                },
            },
        ],
    },
};
