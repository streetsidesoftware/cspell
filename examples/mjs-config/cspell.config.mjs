// @ts-check

import { defineConfig } from 'cspell';

export default defineConfig({
    words: ['mycompany'],

    overrides: [{ filename: 'src/legacy/**', unknownWords: 'report-common-typos' }],
});
