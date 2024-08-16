import { readFile, writeFile } from 'node:fs/promises';

import { definitions } from '../dist/definitions.js';

const urlFile = new URL('../src/definitions.ts', import.meta.url);

/**
 * @typedef {import('../dist/types.js').FileTypeDefinition} FileTypeDefinition
 */

/**
 *
 * @param {FileTypeDefinition} a
 * @param {FileTypeDefinition} b
 */
function compare(a, b) {
    if (a.format !== b.format) {
        return !a.format || a.format === 'Text' ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
}

const fieldOrder = ['id', 'extensions', 'filenames', 'format', 'description', 'comment'];

/**
 *
 * @param {FileTypeDefinition} def
 * @returns {FileTypeDefinition}
 */
function normalizeDef(def) {
    const entries = Object.entries(def).sort(([a], [b]) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b));
    def = Object.fromEntries(entries);
    def.extensions = [...new Set(def.extensions.map((a) => (a.startsWith('.') ? a : '.' + a)).sort())];
    def.filenames = def.filenames ? [...new Set(def.filenames.sort())] : undefined;
    return def;
}

const defs = dedupe(definitions).sort(compare).map(normalizeDef);

async function updateFile() {
    const content = await readFile(urlFile, 'utf8');
    const newLines = `export const definitions: FileTypeDefinitions = ${JSON.stringify(defs)};\n`;
    const start = content.indexOf('export const definitions:');
    const end = content.indexOf('];\n', start);
    const output = content.slice(0, start) + newLines + content.slice(end + 3);
    await writeFile(urlFile, output, 'utf8');
}

/**
 *
 * @param {FileTypeDefinition[]} defs
 * @returns {FileTypeDefinition[]}
 */
function dedupe(defs) {
    /** @type {Map<string, FileTypeDefinition>} */
    const map = new Map();
    for (const def of defs) {
        const key = def.id;
        const existing = map.get(key);
        if (!existing) {
            map.set(key, def);
        } else {
            existing.extensions = [...existing.extensions, ...def.extensions];
            existing.filenames = [...(existing.filenames || []), ...(def.filenames || [])];
            if (!existing.filenames.length) {
                delete existing.filenames;
            }
            existing.format ??= def.format;
            existing.description ??= def.description;
            existing.comment ??= def.comment;
        }
    }
    return [...map.values()];
}

updateFile();
