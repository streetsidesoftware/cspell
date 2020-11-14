console.log(process.version);

if (process.version < 'v12') {
    throw new Error('Exports are only supported by Node 12 and above.');
}

import { assert } from 'console';
import * as cspell from 'cspell';
import * as cli from 'cspell/dist/app';

console.log('start');

/**
 * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
 */
const functions = [cspell.checkText, cspell.lint, cspell.trace, cli.run];

functions.forEach((fn) => assert(typeof fn === 'function', "typeof %o === 'function'", fn));

console.log('done');
