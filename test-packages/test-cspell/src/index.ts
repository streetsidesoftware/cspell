import { assert } from 'console';
import { checkText, lint, trace } from 'cspell/dist/application';
import { run } from 'cspell/dist/app';

console.log('start');

/**
 * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
 */
const functions = [checkText, lint, trace, run];

functions.forEach((fn) => assert(typeof fn === 'function', "typeof %o === 'function'", fn));

console.log('done');
