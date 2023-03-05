import * as glob from 'cspell-glob';
import { resolve } from 'path';

export function run(filename: string) {
    return glob.fileOrGlobToGlob(filename, resolve('.')).glob;
}
