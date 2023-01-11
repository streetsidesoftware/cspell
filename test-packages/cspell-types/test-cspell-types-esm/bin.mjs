#!/usr/bin/env node

import assert from 'assert';
import { gatherIssues } from './dist/index.js';

assert(gatherIssues('hello').length === 1);
