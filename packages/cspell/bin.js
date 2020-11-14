#!/usr/bin/env node

'use strict';

const app = require('./dist/app');
const program = require('commander');

function reject(e) {
    if (!(e instanceof program.CommanderError) && !(e instanceof app.CheckFailed)) {
        console.log(e);
    }
    process.exit(1);
}

try {
    app.run(program, process.argv).catch(reject);
} catch (e) {
    reject(e);
}
