#!/usr/bin/env node

import { fileURLToPath } from 'node:url';

import * as esbuild from 'esbuild';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function buildAll() {
    // Note: cjs is the only possible option at this moment.
    await esbuild.build({
        absWorkingDir: __dirname,
        entryPoints: ['src/index.ts'],
        bundle: true,
        treeShaking: true,
        packages: 'bundle',
        platform: 'node',
        target: 'esnext',
        outfile: './dist/index.cjs',
    });
    await esbuild.build({
        absWorkingDir: __dirname,
        entryPoints: ['src/index.ts'],
        bundle: true,
        treeShaking: true,
        format: 'esm',
        packages: 'bundle',
        platform: 'node',
        target: 'esnext',
        outfile: './dist/index.mjs',
    });
}

buildAll();
