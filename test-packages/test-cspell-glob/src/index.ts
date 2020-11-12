import { assert } from 'console';
import * as glob from 'cspell-glob';

console.log('start');

/**
 * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
 */
const functions = [glob.GlobMatcher];

functions.forEach((fn) => assert(typeof fn === 'function', "typeof %o === 'function'", fn));

console.log('done');
