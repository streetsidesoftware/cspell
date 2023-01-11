import * as path from 'path';
import { spellCheckDocument } from 'cspell-lib';

export async function run() {
    const app = path.relative(process.cwd(), process.argv[1]);
    const file = process.argv[2];

    console.log(`\
Example of how to spell check a document in node and get the results.

Usage ${app} <file>

`);
    if (!file) {
        console.log('Missing file.');
        process.exitCode = 1;
        return;
    }

    const results = await spellCheckDocument({ uri: path.resolve(file) }, {}, {});

    const { checked, issues, errors } = results;
    console.log('%o', { checked, issues, errors });
}
