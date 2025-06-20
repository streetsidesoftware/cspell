import { resolve } from 'node:path';

import * as glob from 'cspell-glob';

export function run(filename: string): string {
    return glob.fileOrGlobToGlob(filename, resolve('.')).glob;
}
