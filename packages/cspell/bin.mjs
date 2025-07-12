#!/usr/bin/env node
import { format } from 'node:util';

import { CommanderError, program } from 'commander';

import { ApplicationError, CheckFailed, run } from './dist/esm/app.js';

run(program, process.argv).catch((e) => {
    if (!(e instanceof CommanderError) && !(e instanceof CheckFailed)) {
        const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
        const msg = !verbose && e instanceof ApplicationError ? e.message : format(e);
        process.stdout.write(msg + '\n');
        // It is possible an explicit exit code was set, use it if it was.
        process.exitCode = process.exitCode || 1;
    }
    if (e instanceof CheckFailed) {
        process.exitCode = e.exitCode;
    }
});
