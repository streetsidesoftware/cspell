#!/usr/bin/env node

'use strict';

const app = require('./dist/app');
const program = require('commander');

app.run(program, process.argv).catch(() => process.exit(1));
