#!/usr/bin/env node
'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const app = require('./dist/app');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const program = require('commander');

function reject(e) {
    if (!(e instanceof program.CommanderError) && !(e instanceof app.CheckFailed)) {
        console.log(e);
    }
    process.exit(1);
}

try {
    app.run(program, process.argv);
} catch (e) {
    reject(e);
}
