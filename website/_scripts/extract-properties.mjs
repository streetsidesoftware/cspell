// @ts-check
import { promises as fs } from 'node:fs';

const schemaFile = new URL('../../cspell.schema.json', import.meta.url);
const schemaFileOut = new URL('../docs/Configuration/auto_properties.md', import.meta.url);

async function run() {
    const schema = await loadSchema();

    const header = `\
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

    const sections = [removeLeftPad(header), '', schemaEntry(schema, 'Settings'), '', formatDefinitions(schema)];

    const doc = sections.join('\n').replace(/\u200B/g, ''); // remove zero width spaces

    await fs.writeFile(schemaFileOut, doc, 'utf8');
}

function schemaEntry(entry, name) {
    if (entry.type === 'object') {
        return schemaObjectEntry(entry, name);
    }
    return formatTopLevelType(name, entry);
}

function schemaObjectEntry(schemaTypeObject, nameOfType) {
    const properties = schemaTypeObject.properties || {};
    // console.error('Object Type %s\n%o', 'Properties:', properties);
    /** @type {string[]} */
    const lines = [];

    if (nameOfType) {
        lines.push(`## ${nameOfType}\n`);
    }

    // Object Fields as a table
    lines.push('| Field | Type | Description |', '| --- | --- | --- |');
    for (const [key, entry] of Object.entries(properties)) {
        lines.push(formatPropertyForOverview(key, entry, nameOfType));
    }

    // Add Object Fields Expanded.

    lines.push(`\n\n### ${nameOfType} Fields`);

    for (const [key, entry] of Object.entries(properties)) {
        lines.push(formatPropertyToDisplay(key, entry, nameOfType));
    }

    return lines.join('\n');
}

/**
 * @param {string} name - name of heading
 * @param {string} section - the containing entry name
 */
function linkToHeader(name, section) {
    const id = toId(section, name);
    return `[${name}](#${id})`;
}

function toId(nameOfParentType, header) {
    return (nameOfParentType ? `${nameOfParentType}-${header}` : header).toLowerCase().replaceAll(/\W/g, '-');
}

function formatPropertyForOverview(key, entry, section) {
    return `| ${linkToHeader(key, section)} | ${formatEntryType(entry)} | ${formatEntryDescriptionShort(entry)} | `;
}

function formatPropertyToDisplay(key, entry, nameOfParentType) {
    return removeLeftPad(`

        ---

        #### \`${key}\` {#${toId(nameOfParentType, key)}}

        ${padLines(formatTypeEntryBody(entry), '        ')}
    `);
}

function formatTopLevelType(key, entry) {
    return removeLeftPad(`

        ---

        ## ${key} {#${toId('', key)}}

        ${padLines(formatTypeEntryBody(entry), '        ')}
    `);
}

function formatTypeEntryBody(entry) {
    let dlDescription = formatEntryDescription(entry, '');
    if (dlDescription) {
        dlDescription = removeLeftPad(`
            <dt>Description</dt>
            <dd>
                ${padLines(dlDescription, '                ')}
            </dd>
        `);
    }

    return removeLeftPad(`
        <dl>
            ${padLines(dlDescription, '            ')}
            <dt>Type</dt>
            <dd>
                ${formatEntryType(entry)}
            </dd>
        </dl>
    `);
}

/**
 * @param {object} entry
 */
function formatEntryType(entry, addFix = '`') {
    function fix(value) {
        return addFix + value + addFix;
    }

    if (entry.type === 'array' && entry.items) {
        return fix(`${formatEntryType(entry.items, '')}[]`);
    }
    if (entry.type) {
        return fix(entry.type);
    }
    if (entry.$ref) {
        return fix(entry.$ref.split('/').slice(-1).join(''));
    }
    if (entry.anyOf) {
        return entry.anyOf.map((entry) => formatEntryType(entry)).join('<br />');
    }
    return fix('Unknown');
}

function formatDefinitions(schema) {
    return Object.entries(schema.definitions || {})
        .map(([key, entry]) => schemaEntry(entry, key))
        .join('\n\n');
}

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
        const link = (p1 && `[${p1}](#${p1.toLowerCase().replaceAll(/\W/g, '-')})`) || '';
        return link;
    });
    return markdown;
}

/**
 * @param {string} str - multi-line string to left pad
 * @param {string} [padding] - the padding to use
 * @param {string} [firstLinePadding] - optional padding of first line.
 */
function padLines(str, padding = '', firstLinePadding = '') {
    let pad = firstLinePadding;
    const lines = [];
    for (const line of str.split('\n')) {
        lines.push(pad + line);
        pad = padding;
    }

    return lines.join('\n');
}

function removeLeftPad(str) {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        const pad = line.length - line.trimStart().length;
        curPad = Math.min(curPad, pad);
    }

    return lines.map((line) => line.slice(curPad)).join('\n');
}

run();
