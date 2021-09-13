const path = require('path');

module.exports = {
    version: '0.2',
    id: 'cspell-project-config',
    name: 'cspell Project Config',
    language: 'en',
    maxNumberOfProblems: 1000,
    ignorePaths: [
        '*.snap',
        'node_modules',
        'package-lock.json',
        'coverage/**',
        'dist/**',
        'package.json',
        '.cspell.json',
        '.vscode/**',
    ],
    ignoreWords: [],
    reporters: [[path.join(__dirname, './dist/index'), { outFile: './temp/out.json' }]],
};
