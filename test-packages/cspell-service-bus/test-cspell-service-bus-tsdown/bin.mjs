#!/usr/bin/env node

import assert from 'node:assert';

import { smokeTest } from './dist/index.js';

assert(smokeTest());
