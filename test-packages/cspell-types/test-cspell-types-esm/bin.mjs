#!/usr/bin/env node

import assert from 'node:assert';

import { gatherIssues } from './dist/index.js';

assert(gatherIssues('hello').length === 1);
