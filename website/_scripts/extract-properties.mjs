// @ts-check
import { promises as fs } from 'node:fs';

const schemaFile = new URL('../../cspell.schema.json', import.meta.url);
const schemaFileOut = new URL('../docs/Configuration/auto_properties.md', import.meta.url);

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
    lines.push(
        createTable(
            ['Field', 'Type', 'Description'],
            Object.entries(properties).map(([key, entry]) => formatPropertyForOverview(key, entry, nameOfType)),
        ),
    );

    // Add Object Fields Expanded.

    lines.push(`\n\n### ${nameOfType} Fields`);

    for (const [key, entry] of Object.entries(properties)) {
        lines.push(formatPropertyToDisplay(key, entry, nameOfType));
    }

    return lines.join('\n');
}

/**
 * @param {string} name - name of heading
 * @param {string} [section] - the containing entry name
 * @param {string} [text] - optional text to show in the link
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

function formatPropertyForOverview(key, entry, section) {
    return [linkToHeader(key, section), formatEntryType(entry), formatEntryDescriptionShort(entry)];
}

function formatPropertyToDisplay(key, entry, nameOfParentType) {
    return inject`

        ---

        #### \`${key}\` {#${toId(nameOfParentType, key)}}

        ${formatTypeEntryBody(entry)}
    `;
}

function formatTopLevelType(key, entry) {
    return inject`

        ---

        ## ${key} {#${toId('', key)}}

        ${formatTypeEntryBody(entry)}
    `;
}

function formatTypeEntryBody(entry) {
    let dlDescription = formatEntryDescription(entry, '');
    if (dlDescription) {
        dlDescription = inject`
            <dt>Description</dt>
            <dd>

            ${dlDescription}

            </dd>
        `;
    }

    return inject`
        <dl>
        ${dlDescription}
        <dt>Type</dt>
        <dd>

        ${formatEntryType(entry)}

        </dd>
        </dl>
    `;
}

/**
 * @param {object} entry
 */
function formatEntryType(entry, addFix = '`') {
    function fix(value) {
        return addFix + value + addFix;
    }

    if (entry.type === 'array' && entry.items) {
        return formatEntryType(entry.items, '`') + '&ZeroWidthSpace;' + fix(`[]`);
    }
    if (entry.type) {
        return fix(entry.type);
    }
    if (entry.$ref) {
        return formatReferenceType(entry.$ref, fix);
    }
    if (entry.anyOf) {
        return entry.anyOf.map((entry) => formatEntryType(entry)).join('<br />');
    }
    return fix('Unknown');
}

function formatReferenceType(ref, fnFix) {
    const refType = ref.split('/').slice(-1).join('');
    return linkToHeader(refType, '', fnFix(refType));
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
        const link = (p1 && linkToHeader(p1, '')) || '';
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

/**
 * Inject values into a template string.
 * @param {TemplateStringsArray} template
 * @param  {...any} values
 * @returns
 */
function inject(template, ...values) {
    const strings = template;
    const adjValues = [];
    for (let i = 0; i < values.length; ++i) {
        const prevLines = strings[i].split('\n');
        const currLine = prevLines[prevLines.length - 1];
        const padLen = padLength(currLine);
        const padding = ' '.repeat(padLen);
        const value = `${values[i]}`;
        let pad = '';
        const valueLines = [];
        for (const line of value.split('\n')) {
            valueLines.push(pad + line);
            pad = padding;
        }
        adjValues.push(valueLines.join('\n'));
    }

    return unindent(String.raw({ raw: strings }, ...adjValues));
}

/**
 *
 * @param {string[]} headers
 * @param {string[][]} rows
 * @returns
 */
function createTable(headers, rows) {
    const colWidths = [];

    for (const row of [headers, ...rows]) {
        row.forEach((col, i) => {
            colWidths[i] = Math.max(colWidths[i] || 0, [...col].length);
        });
    }

    const rowPlaceholders = colWidths.map(() => '');
    const sep = headers.map((_, i) => '---'.padEnd(colWidths[i], '-'));
    const table = [headers, sep, ...rows];

    return table
        .map((row) => [...row, ...rowPlaceholders.slice(row.length)])
        .map((row) => row.map((col, i) => col.padEnd(colWidths[i])))
        .map((row) => `| ${row.join(' | ')} |`)
        .join('\n');
}

/**
 * Calculate the padding at the start of the string.
 * @param {string} s
 * @returns {number}
 */
function padLength(s) {
    return s.length - s.trimStart().length;
}

/**
 * Remove the left padding from a multi-line string.
 * @param {string} str
 * @returns {string}
 */
function unindent(str) {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        curPad = Math.min(curPad, padLength(line));
    }

    return lines.map((line) => line.slice(curPad)).join('\n');
}

run();
