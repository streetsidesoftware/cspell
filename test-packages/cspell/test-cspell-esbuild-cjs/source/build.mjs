#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';

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
