#!/usr/bin/env node

// @ts-check
import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import safeStableStringify from 'safe-stable-stringify';
import { createGenerator } from 'ts-json-schema-generator';

const importDir = new URL('.', import.meta.url);
const rootUrl = new URL('..', importDir);
const typesDirUrl = new URL('packages/cspell-types', rootUrl);
const outFile = 'cspell.schema.json';
const typesDir = fileURLToPath(typesDirUrl);

/** @type {import('ts-json-schema-generator').Config} */
const defaultConfig = {
    expose: 'export',
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
 *   --no-top-ref \
 *   --path src/CSpellSettingsDef.ts \
 *   --type CSpellSettings \
 *   --validation-keywords markdownDescription  \
 *   --validation-keywords scope \
 *   --validation-keywords deprecated \
 *   --validation-keywords deprecationMessage \
 *   -o  ./cspell.schema.json
 * ```
 */
async function run() {
    /** @type {import('ts-json-schema-generator').Config} */
    const config = {
        ...defaultConfig,
        path: path.join(typesDir, 'src/CSpellSettingsDef.ts'),
        tsconfig: path.join(typesDir, './tsconfig.json'),
        type: 'CSpellSettings',
        topRef: false,
        extraTags: ['scope', 'deprecated', 'deprecationMessage', 'since'],
        skipTypeCheck: true,
    };

    const schema = createGenerator(config).createSchema(config.type);
    // @ts-expect-error allowTrailingCommas is a new feature
    schema.allowTrailingCommas = true;
    const stringify = config.sortProps ? safeStableStringify : JSON.stringify;
    const schemaString = stringify(schema, undefined, 2)?.replaceAll('\u200B', '') || '';

    await writeFile(path.join(typesDir, outFile), schemaString);
    await writeFile(new URL(outFile, rootUrl), schemaString);
}

run();
