// @ts-check
import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import { inject, createTable, padLines } from './lib/utils.mts';

const schemaFile = new URL('../../cspell.schema.json', import.meta.url);
const schemaFileOut = new URL('../docs/Configuration/auto_properties.md', import.meta.url);

/**
 * @import { JSONSchema7, JSONSchema7Definition, JSONSchema7Object, JSONSchema7Array, JSONSchema7Type } from 'json-schema';
 */

/**
 * @typedef {JSONSchema7 & { markdownDescription?: string, since?: string }} Definition
 */

/**
 * Extracts the properties from the cspell schema and writes them to a markdown file.
 */
async function run() {
    const schema = await loadSchema();

    const header = inject`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`_scripts/extract-properties.js\`
        title: Properties
        slug: properties
        toc_max_heading_level: 5
        format: md
        ---

        # CSpell Configuration
    `;

    const sections = [header, '', schemaEntry(schema, 'Settings'), '', formatDefinitions(schema)];

    const doc = sections.join('\n').replace(/\u200B/g, ''); // remove zero width spaces

    await fs.writeFile(schemaFileOut, doc, 'utf8');
}

/**
 *
 * @param {JSONSchema7} entry
 * @param {string} name
 * @returns {string}
 */
function schemaEntry(entry, name) {
    if (entry.type === 'object') {
        return schemaObjectEntry(entry, name);
    }
    return formatTopLevelType(name, entry);
}

/**
 *
 * @param {JSONSchema7} schemaTypeObject
 * @param {string} nameOfType
 * @returns {string}
 */
function schemaObjectEntry(schemaTypeObject, nameOfType) {
    const properties = schemaTypeObject.properties || {};
    const required = new Set(schemaTypeObject.required || []);
    // console.error('Object Type %s\n%o', 'Properties:', properties);
    /** @type {string[]} */
    const lines = [];

    if (nameOfType) {
        lines.push(`## ${nameOfType}\n`);
    }

    const isRequired = (key) => (required.has(key) && 1) || 0;
    const entries = Object.entries(properties).sort(
        (a, b) => isRequired(b[0]) - isRequired(a[0]) || a[0].localeCompare(b[0]),
    );

    // Object Fields as a table
    lines.push(
        createTable(
            ['Field', 'Type', 'Description'],
            entries
                .map(([key, entry]) =>
                    entryIsJSONSchema7(entry)
                        ? formatPropertyForOverview(key, entry, nameOfType, required.has(key))
                        : [],
                )
                .filter((e) => e.length > 0),
        ),
    );

    // Add Object Fields Expanded.

    lines.push(`\n\n### ${nameOfType} Fields`);

    for (const [key, entry] of entries) {
        if (!entryIsJSONSchema7(entry)) continue;
        lines.push(formatPropertyToDisplay(key, entry, nameOfType, required.has(key)));
    }

    return lines.join('\n');
}

/**
 * @param {string} name - name of heading
 * @param {string} [section] - the containing entry name
 * @param {string} [text] - optional text to show in the link
 * @returns {string}
 */
function linkToHeader(name, section, text) {
    text = text || name;
    const id = toId(section, name);
    return `[${text}](#${id})`;
}

/**
 * @param {string | undefined} nameOfParentType
 * @param {string} header
 */
function toId(nameOfParentType, header) {
    return (nameOfParentType ? `${nameOfParentType}-${header}` : header).toLowerCase().replaceAll(/\W/g, '-');
}

/**
 *
 * @param {string} key
 * @param {Definition} entry
 * @param {string} section
 * @param {boolean} isRequired
 * @returns {[string, string, string]}
 */
function formatPropertyForOverview(key, entry, section, isRequired) {
    const req = isRequired ? ' <sup>_req_</sup>' : '';
    return [linkToHeader(key, section) + req, formatEntryType(entry), formatEntryDescriptionShort(entry)];
}

/**
 *
 * @param {string} key
 * @param {Definition} entry
 * @param {string} nameOfParentType
 * @param {boolean} isRequired
 * @returns {string}
 */
function formatPropertyToDisplay(key, entry, nameOfParentType, isRequired) {
    return inject`

        ---

        #### \`${key}\` {#${toId(nameOfParentType, key)}}

        ${formatTypeEntryBody(entry, isRequired)}
    `;
}

/**
 *
 * @param {string} key
 * @param {*} entry
 * @returns {string}
 */
function formatTopLevelType(key, entry) {
    return inject`

        ---

        ## ${key} {#${toId('', key)}}

        ${formatTypeEntryBody(entry, undefined)}
    `;
}

/**
 *
 * @param {Definition} entry
 * @param {boolean | undefined} isRequired
 * @returns {string}
 */
function formatTypeEntryBody(entry, isRequired) {
    const req = isRequired ? ' <sub><sup> _< required >_ </sup></sub>' : '';

    let dlDescription = formatEntryDescription(entry, '');
    if (dlDescription) {
        dlDescription = inject`
            <dt>Description</dt>
            <dd>

            ${dlDescription}

            </dd>
        `;
    }

    let dlSince = '';
    if (entry.since) {
        dlSince = inject`
            <dt>Since</dt>
            <dd>${entry.since}</dd>
        `;
    }

    return inject`
        <dl>
        ${dlDescription}
        <dt>Type${req}</dt>
        <dd>

        ${formatEntryType(entry)}

        </dd>
        ${dlSince}
        </dl>
    `;
}

/**
 * @param {Definition} entry
 * @returns {string}
 */
function formatEntryType(entry, addFix = '`') {
    /**
     *
     * @param {string | string[]} value
     * @returns {string}
     */
    function fix(value) {
        return addFix + value + addFix;
    }

    if (entry.type === 'array' && entry.items && typeof entry.items === 'object') {
        if (!Array.isArray(entry.items)) {
            const item = entry.items;
            return formatEntryType(item, '`') + '&ZeroWidthSpace;' + fix(`[]`);
        }
        const items = entry.items;
        return (
            fix('[') +
            items
                .filter(entryIsJSONSchema7)
                .map((item) => formatEntryType(item, '`'))
                .join(', ') +
            fix(`]`)
        );
    }
    if (entry.enum) {
        return entry.enum.map((e) => fix(JSON.stringify(e))).join(' | ');
    }
    if (entry.type) {
        return fix(entry.type);
    }
    if (entry.$ref) {
        return formatReferenceType(entry.$ref, fix);
    }
    if (entry.anyOf) {
        return entry.anyOf
            .filter(entryIsJSONSchema7)
            .map((entry) => formatEntryType(entry))
            .join('<br />');
    }
    return fix('Unknown');
}

/**
 *
 * @param {string} ref
 * @param {(fix: string) => string} fnFix
 * @returns {string}
 */
function formatReferenceType(ref, fnFix) {
    const refType = ref.split('/').slice(-1).join('');
    return linkToHeader(refType, '', fnFix(refType));
}

/**
 *
 * @param {Definition} schema
 * @returns {string}
 */
function formatDefinitions(schema) {
    return Object.entries(schema.definitions || {})
        .filter(propertyIsJSONSchema7)
        .map(([key, entry]) => {
            assert(entryIsJSONSchema7(entry), `Expected entry to be JSONSchema7: ${key}`);
            return schemaEntry(entry, key);
        })
        .join('\n\n');
}

/**
 *
 * @param {Definition} entry
 * @param {string} padding
 * @returns {string}
 */
function formatEntryDescription(entry, padding) {
    let description = entry.markdownDescription || entry.description || '';
    if (typeof description !== 'string') {
        console.error('%o', description);
        return '**`Strange Object`**';
    }

    description = replaceLinks(description);
    description = padLines(description, padding);
    return description;
}

/**
 *
 * @param {Definition} entry
 * @returns {string}
 */
function formatEntryDescriptionShort(entry) {
    const description = entry.markdownDescription || entry.description || '';
    if (typeof description !== 'string') {
        console.error('%o', description);
        return '**`Strange Object`**';
    }
    let short = description.split('\n').slice(0, 1).join('');
    short = replaceLinks(short);
    return short;
}

/**
 *
 * @returns {Promise<JSONSchema7>}
 */
async function loadSchema() {
    const schema = JSON.parse(await fs.readFile(schemaFile, 'utf8'));

    return schema;
}

const regExpMatchLink = /\{@link (.*?)\}/g;

/**
 * Replace {@link formatEntryType } with a markdown link.
 * @param {string} markdown
 * @return {string}
 */
function replaceLinks(markdown) {
    markdown = markdown.replaceAll(regExpMatchLink, (_match, p1) => {
        p1 = p1.trim();
        const link = (p1 && linkToHeader(p1, '')) || '';
        return link;
    });
    return markdown;
}

/**
 *
 * @param {[string, JSONSchema7Definition]} param0
 * @returns {param0 is [string, JSONSchema7]}
 */
function propertyIsJSONSchema7([key, entry]) {
    return typeof key === 'string' && entry && typeof entry === 'object' && !Array.isArray(entry);
}

/**
 *
 * @param {JSONSchema7Definition} entry
 * @returns {entry is JSONSchema7}
 */
function entryIsJSONSchema7(entry) {
    return entry && typeof entry === 'object';
}

run();
