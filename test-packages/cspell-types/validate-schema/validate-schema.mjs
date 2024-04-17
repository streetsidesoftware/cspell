import { promises as fs } from 'node:fs';

import Ajv from 'ajv';
import assert from 'assert';
import { findUp } from 'find-up-simple';

const fixturesUrl = new URL('fixtures/', import.meta.url);
const fixtures = ['cspell.test.json'];

const keywords = ['allowTrailingCommas', 'deprecationMessage', 'markdownDescription', 'scope'];

let errors = 0;

async function run() {
    const schemaFile = await findUp('cspell.schema.json');

    assert(schemaFile, 'Schema file: `cspell.schema.json` not found.');

    const ajv = new Ajv({ keywords });

    const schema = await readJson(schemaFile);

    const validateFn = ajv.compile(schema);

    for (const fixture of fixtures) {
        const data = await readJsonFixture(fixture);

        const valid = validateFn(data);
        if (valid) {
            console.log('%s OK', fixture);
        } else {
            errors += 1;
            console.log('%s Failed', fixture);
            console.log('Errors: %o', validateFn.errors);
        }
    }

    if (errors) {
        process.exitCode = 1;
    }
}

function readJsonFixture(file) {
    return readJson(new URL(file, fixturesUrl));
}

async function readJson(file) {
    return JSON.parse(await fs.readFile(file, 'utf8'));
}

run();
