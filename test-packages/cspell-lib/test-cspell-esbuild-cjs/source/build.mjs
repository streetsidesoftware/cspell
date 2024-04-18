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
        platform: 'node',
        outfile: '../bin/dist/index.cjs',
    });
}

buildAll();
