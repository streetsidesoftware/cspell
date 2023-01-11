#!/usr/bin/env node

const assert = require('assert');
const { gatherIssues } = require('./dist/index');

assert(gatherIssues('hello').length === 1);
