import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from '@cspell/cspell-types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
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
    reporters: [[path.join(__dirname, './dist/esm/index.js'), { outFile: './temp/out.json' }]],
});
