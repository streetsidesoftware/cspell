#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import safeStableStringify from 'safe-stable-stringify';
import type { Config } from 'ts-json-schema-generator';
import { createGenerator } from 'ts-json-schema-generator';

const importDir = new URL('.', import.meta.url);
const rootUrl = new URL('..', importDir);
const typesDirUrl = new URL('packages/cspell-types', rootUrl);
const outFile = 'cspell.schema.json';
const typesDir = fileURLToPath(typesDirUrl);

const defaultConfig: Config = {
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

function removeHiddenProperties(properties: JSONSchema7['properties']): void {
    if (!properties) return;

    for (const [key, prop] of Object.entries(properties)) {
        if (typeof prop !== 'object' || !prop) continue;
        if ('hide' in prop) {
            delete properties[key];
        }
    }
}

function removeHiddenPropertiesFromDefinitions(definitions: Record<string, JSONSchema7Definition> | undefined): void {
    if (!definitions) return;

    for (const def of Object.values(definitions)) {
        if (typeof def !== 'object' || !def) continue;
        removeHiddenProperties(def.properties);
    }
}

function removeHidden(schema: JSONSchema7): void {
    removeHiddenProperties(schema.properties);
    removeHiddenPropertiesFromDefinitions(schema.definitions);
}

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
async function run(): Promise<void> {
    const config: Config = {
        ...defaultConfig,
        path: path.join(typesDir, 'src/CSpellSettingsDef.ts'),
        tsconfig: path.join(typesDir, './tsconfig.json'),
        type: 'CSpellSettings',
        topRef: false,
        extraTags: ['scope', 'deprecated', 'deprecationMessage', 'since', 'hide'],
        skipTypeCheck: true,
    };

    const schema = createGenerator(config).createSchema(config.type) as JSONSchema7 & { allowTrailingCommas?: boolean };
    schema.allowTrailingCommas = true;
    removeHidden(schema);
    const stringify = config.sortProps ? safeStableStringify : JSON.stringify;
    const schemaString = stringify(schema, undefined, 2)?.replaceAll('\u200B', '') || '';

    await writeFile(path.join(typesDir, outFile), schemaString);
    await writeFile(new URL(outFile, rootUrl), schemaString);
}

await run();
