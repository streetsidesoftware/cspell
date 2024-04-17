#!/usr/bin/env node

import assert from 'assert';

import { smokeTest } from './dist/index.mjs';

assert(smokeTest());
