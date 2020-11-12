import { assert } from 'console';
import * as cspell from 'cspell/application';
import * as cli from 'cspell/dist/app';

/**
 * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
 */
const functions = [cspell.checkText, cspell.lint, cspell.trace, cli.run];

functions.forEach((fn) => assert(typeof fn === 'function', "typeof %o === 'function'", fn));
