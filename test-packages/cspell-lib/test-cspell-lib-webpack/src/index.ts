import { assert } from 'console';
// eslint-disable-next-line node/no-unpublished-import
import * as lib from 'cspell-lib';

console.log('start');

/**
 * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
 */
const functions = [lib.asyncIterableToArray, lib.calcOverrideSettings];
functions.forEach((fn) => assert(typeof fn === 'function', "typeof %o === 'function'", fn));

console.log('done');
