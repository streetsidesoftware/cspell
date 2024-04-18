import assert from 'node:assert';

import { lint } from 'cspell';

async function checkFile(fileGlob: string) {
    const result = await lint([fileGlob], {});
    return result;
}

export async function run() {
    const fileGlob = process.argv[2];
    assert(fileGlob, 'File to check expected.');

    console.log(`Start: ${new Date().toISOString()}`);
    console.log('Spell check file: %s', fileGlob);
    console.log('%s', process.cwd());
    const result = await checkFile(fileGlob);
    console.log('%o', result);
    assert(result.files === 1);
    assert(result.issues === 0);
    assert(result.errors === 0);
    console.log(`End: ${new Date().toISOString()}`);
}
