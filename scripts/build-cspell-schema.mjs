#!/usr/bin/env node

import tsj from 'ts-json-schema-generator';
import { writeFile } from 'node:fs/promises';
import safeStableStringify from 'safe-stable-stringify';
import { fileURLToPath } from 'node:url';
import * as path from 'path';

const importDir = new URL('.', import.meta.url);
const rootUrl = new URL('..', importDir);
const typesDirUrl = new URL('packages/cspell-types', rootUrl);
const outFile = 'cspell.schema.json';
const typesDir = fileURLToPath(typesDirUrl);

const defaultConfig = {
    expose: 'export',
    topRef: true,
    jsDoc: 'extended',
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
    /** @type {import('ts-json-schema-generator/dist/src/Config').Config} */
    const config = {
        ...defaultConfig,
        path: path.join(typesDir, 'src/CSpellSettingsDef.ts'),
        tsconfig: path.join(typesDir, './tsconfig.json'),
        type: 'CSpellSettings',
        topRef: false,
        extraTags: ['markdownDescription', 'scope', 'deprecated', 'deprecationMessage'],
        skipTypeCheck: true,
    };

    const schema = tsj.createGenerator(config).createSchema(config.type);
    const stringify = config.sortProps ? safeStableStringify : JSON.stringify;
    const schemaString = stringify(schema, null, 2);

    await writeFile(path.join(typesDir, outFile), schemaString);
    await writeFile(new URL(outFile, rootUrl), schemaString);
}

run();
