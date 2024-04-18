import assert from 'node:assert';
import { format } from 'node:util';

import * as lib from 'cspell-lib';

console.log('start');

/**
 * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
 */
const functions = [lib.asyncIterableToArray, lib.calcOverrideSettings];
functions.forEach((fn) => assert(typeof fn === 'function', format("typeof %o === 'function'", fn)));

const { issues } = await lib.spellCheckFile(__filename, {}, {});
// console.log('%o', { issues, errors });
assert(!issues.length, 'Make sure there are no issues.');

console.log('done');
