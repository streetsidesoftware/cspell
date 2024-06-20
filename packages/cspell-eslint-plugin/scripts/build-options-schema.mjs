#!/usr/bin/env node

// @ts-check
import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import safeStableStringify from 'safe-stable-stringify';
import { createGenerator } from 'ts-json-schema-generator';

const importDir = new URL('.', import.meta.url);
const rootUrl = new URL('..', importDir);
const typesDirUrl = new URL('src/common', rootUrl);
const outFile = 'assets/options.schema.json';
const typesDir = fileURLToPath(typesDirUrl);

/** @type {import('ts-json-schema-generator').Config} */
const defaultConfig = {
    expose: 'none',
    topRef: true,
    jsDoc: 'extended',
    markdownDescription: true,
    sortProps: true,
    strictTuples: false,
    skipTypeCheck: false,
    encodeRefs: true,
    minify: false,
    extraTags: [],
    additionalProperties: false,
    discriminatorType: 'json-schema',
};

/**
 * Build the schema. This method replaces the old command line that was run in `packages/cspell-types`
 * ```sh
 * ts-json-schema-generator \
 *  --no-top-ref \
 *  --expose none \
 *  --validation-keywords markdownDescription  \
 *  --validation-keywords deprecated \
 *  --validation-keywords deprecationMessage \
 *  --path src/common/options.cts \
 *  --type Options \
 *  -o  ./assets/options.schema.json
 * ```
 */
async function run() {
    /** @type {import('ts-json-schema-generator').Config} */
    const config = {
        ...defaultConfig,
        path: path.join(typesDir, 'src/options.cts'),
        tsconfig: path.join(typesDir, './tsconfig.json'),
        type: 'Options',
        topRef: false,
        extraTags: ['deprecated', 'deprecationMessage'],
        skipTypeCheck: true,
    };

    const schema = createGenerator(config).createSchema(config.type);
    const stringify = config.sortProps ? safeStableStringify : JSON.stringify;
    const schemaString = stringify(schema, undefined, 2)?.replaceAll('\u200B', '');

    await writeFile(new URL(outFile, rootUrl), schemaString);
}

run();
