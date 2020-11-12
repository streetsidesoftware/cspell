import { assert } from 'console';
import * as io from 'cspell-io';

/**
 * The main goal here is to make sure it compiles. The unit tests are validation that it compiled as expected.
 */
const functions = [io.asyncIterableToArray, io.lineReaderAsync, io.readFile];

functions.forEach((fn) => assert(typeof fn === 'function', "typeof %o === 'function'", fn));
