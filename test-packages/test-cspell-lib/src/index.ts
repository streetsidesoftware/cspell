import * as lib from 'cspell-lib';

/**
 * The main goal here is to make sure it compiles. The unit tests are just place holders.
 */
if (typeof lib.checkText !== 'function') {
    throw "typeof lib.checkText !== 'function'";
}
