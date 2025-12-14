#!/usr/bin/env node

import { version } from 'node:process';

if (version.startsWith('v20.')) {
    process.argv.push('--exclude=fixtures');
}

await import('cspell/bin.mjs');
