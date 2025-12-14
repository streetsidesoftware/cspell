const { defineConfig } = require('cspell');

module.exports = defineConfig({
    version: '0.2',
    dictionaryDefinitions: [
        {
            name: 'project-words',
            path: './project-words.txt',
            addWords: true,
        },
    ],
    dictionaries: ['project-words'],
    ignorePaths: ['node_modules', '/project-words.txt'],
});
