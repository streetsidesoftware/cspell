#!/usr/bin/env node
/* eslint-disable node/shebang */

const assert = require('assert');
const { gatherIssues } = require('./dist/index.cjs');

assert(gatherIssues('hello').length === 1);
