#!/usr/bin/env node

import assert from 'assert';
import { sumValues } from './dist/index.mjs';

assert(sumValues([1, 2, 3]) === 6);
