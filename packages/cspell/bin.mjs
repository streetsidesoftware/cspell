#!/usr/bin/env node
import { format } from 'node:util';

import { CommanderError, program } from 'commander';

import * as app from './dist/esm/app.mjs';

app.run(program, process.argv).catch((e) => {
    if (!(e instanceof CommanderError) && !(e instanceof app.CheckFailed)) {
        const msg = format(e) + '\n';
        process.stdout.write(msg);
        // It is possible an explicit exit code was set, use it if it was.
        process.exitCode = process.exitCode || 1;
    }
    if (e instanceof app.CheckFailed) {
        process.exitCode = e.exitCode;
    }
});
