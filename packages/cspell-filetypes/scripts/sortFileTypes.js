import { definitions } from '../dist/definitions.js';

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
    def.extensions = def.extensions.map((a) => (a.startsWith('.') ? a : '.' + a)).sort();
    def.filenames = def.filenames?.sort();
    return def;
}

const defs = [...definitions].sort(compare).map(normalizeDef);

console.log(JSON.stringify(defs));
