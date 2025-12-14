#!/usr/bin/env node

import { version } from 'node:process';

if (version < 'v22') {
    process.argv.push('--exclude=fixtures');
}

await import('cspell/bin.mjs');
