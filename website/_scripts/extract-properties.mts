import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import { inject, createTable, padLines, relativeToSite } from './lib/utils.mts';
import { URL_REPO_ROOT_PKG, URL_SITE_DOCS } from './lib/constants.mts';

const schemaFile = new URL('cspell.schema.json', URL_REPO_ROOT_PKG);
const generatedTargetUrl = new URL('Configuration/auto_properties.md', URL_SITE_DOCS);

interface Definition extends JSONSchema7 {
    markdownDescription?: string;
    since?: string;
}

/**
 * Registry of every heading id this generator will produce, used to resolve `{@link X}`
 * references found in schema descriptions to the correct anchor - properties of the same
 * name can exist in more than one section (e.g. `ignoreRegExpList` on `Settings`,
 * `LanguageSetting`, and `OverrideSettings`), each with its own section-prefixed id.
 */
interface LinkRegistry {
    /** lowercase top-level definition name -> heading id */
    topLevel: Map<string, string>;
    /** lowercase section name -> (lowercase property name -> heading id) */
    sections: Map<string, Map<string, string>>;
}

let linkRegistry: LinkRegistry = { topLevel: new Map(), sections: new Map() };
/** The section currently being rendered, used to resolve sibling `{@link}` references. Empty outside of a section. */
let currentSectionName = '';

function buildLinkRegistry(schema: Definition): LinkRegistry {
    const topLevel = new Map<string, string>();
    const sections = new Map<string, Map<string, string>>();

    function registerTopLevel(name: string): void {
        topLevel.set(name.toLowerCase(), toId('', name));
    }

    function registerSection(name: string, properties: Record<string, JSONSchema7Definition> | undefined): void {
        const propMap = new Map<string, string>();
        for (const key of Object.keys(properties || {})) {
            propMap.set(key.toLowerCase(), toId(name, key));
        }
        sections.set(name.toLowerCase(), propMap);
    }

    registerTopLevel('Settings');
    if (schema.type === 'object') {
        registerSection('Settings', schema.properties);
    }

    for (const [key, entry] of Object.entries(schema.definitions || {})) {
        if (!entryIsJSONSchema7(entry)) continue;
        registerTopLevel(key);
        if (entry.type === 'object') {
            registerSection(key, entry.properties);
        }
    }

    return { topLevel, sections };
}

/**
 * Resolve a `{@link X}` reference to a heading id, preferring (in order): an explicit
 * `Section.property` reference, a sibling property in the current section, a property of
 * the root `Settings` section (most cross-references from `LanguageSetting`/`OverrideSettings`
 * describe the global setting), then a top-level definition. Returns `undefined` if nothing matches.
 */
function resolveLinkTarget(name: string): string | undefined {
    const dot = name.indexOf('.');
    if (dot > 0) {
        const section = name.slice(0, dot).toLowerCase();
        const prop = name.slice(dot + 1).toLowerCase();
        const sectionProps = linkRegistry.sections.get(section);
        if (sectionProps?.has(prop)) return sectionProps.get(prop);
    }

    const lower = name.toLowerCase();
    const currentSectionProps = linkRegistry.sections.get(currentSectionName.toLowerCase());
    if (currentSectionProps?.has(lower)) return currentSectionProps.get(lower);
    const settingsProps = linkRegistry.sections.get('settings');
    if (settingsProps?.has(lower)) return settingsProps.get(lower);
    if (linkRegistry.topLevel.has(lower)) return linkRegistry.topLevel.get(lower);
    return undefined;
}

/**
 * Extracts the properties from the cspell schema and writes them to a markdown file.
 */
export async function run(): Promise<void> {
    console.log(`Generating config properties at ${relativeToSite(generatedTargetUrl)}`);
    const schema = await loadSchema();
    linkRegistry = buildLinkRegistry(schema);

    const header = inject`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`${relativeToSite(import.meta.url)}\`
        title: Properties
        slug: properties
        toc_max_heading_level: 5
        sidebar_position: 1
        sidebar_label: Properties
        format: md
        ---

        # CSpell Configuration
    `;

    const sections = [header, '', schemaEntry(schema, 'Settings'), '', formatDefinitions(schema)];

    const doc = sections.join('\n').replace(/\u200B/g, ''); // remove zero width spaces

    await fs.writeFile(generatedTargetUrl, doc, 'utf8');
    console.log(`Generating config properties at ${relativeToSite(generatedTargetUrl)} - Done.`);
}

function schemaEntry(entry: JSONSchema7, name: string): string {
    if (entry.type === 'object') {
        return schemaObjectEntry(entry, name);
    }
    return formatTopLevelType(name, entry);
}

function schemaObjectEntry(schemaTypeObject: JSONSchema7, nameOfType: string): string {
    currentSectionName = nameOfType;
    const properties = schemaTypeObject.properties || {};
    const required = new Set(schemaTypeObject.required || []);
    // console.error('Object Type %s\n%o', 'Properties:', properties);
    const lines: string[] = [];

    if (nameOfType) {
        lines.push(`## ${nameOfType}\n`);
    }

    const isRequired = (key: string) => (required.has(key) && 1) || 0;
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

function linkToHeader(name: string, section?: string, text?: string): string {
    text = text || name;
    const id = toId(section, name);
    return `[${text}](#${id})`;
}

function toId(nameOfParentType: string | undefined, header: string): string {
    return (nameOfParentType ? `${nameOfParentType}-${header}` : header).toLowerCase().replaceAll(/\W/g, '-');
}

function formatPropertyForOverview(
    key: string,
    entry: Definition,
    section: string,
    isRequired: boolean,
): [string, string, string] {
    const req = isRequired ? ' <sup>_req_</sup>' : '';
    return [linkToHeader(key, section) + req, formatEntryType(entry), formatEntryDescriptionShort(entry)];
}

function formatPropertyToDisplay(
    key: string,
    entry: Definition,
    nameOfParentType: string,
    isRequired: boolean,
): string {
    return inject`

        ---

        #### \`${key}\` {#${toId(nameOfParentType, key)}}

        ${formatTypeEntryBody(entry, isRequired)}
    `;
}

function formatTopLevelType(key: string, entry: JSONSchema7): string {
    currentSectionName = '';
    return inject`

        ---

        ## ${key} {#${toId('', key)}}

        ${formatTypeEntryBody(entry, undefined)}
    `;
}

function formatTypeEntryBody(entry: Definition, isRequired: boolean | undefined): string {
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

function formatEntryType(entry: Definition, addFix = '`'): string {
    function fix(value: string | string[]): string {
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

function formatReferenceType(ref: string, fnFix: (fix: string) => string): string {
    const refType = ref.split('/').slice(-1).join('');
    return linkToHeader(refType, '', fnFix(refType));
}

function formatDefinitions(schema: Definition): string {
    return Object.entries(schema.definitions || {})
        .filter(propertyIsJSONSchema7)
        .map(([key, entry]) => {
            assert(entryIsJSONSchema7(entry), `Expected entry to be JSONSchema7: ${key}`);
            return schemaEntry(entry, key);
        })
        .join('\n\n');
}

function formatEntryDescription(entry: Definition, padding: string): string {
    let description = entry.markdownDescription || entry.description || '';
    if (typeof description !== 'string') {
        console.error('%o', description);
        return '**`Strange Object`**';
    }

    description = replaceLinks(description);
    description = padLines(description, padding);
    return description;
}

function formatEntryDescriptionShort(entry: Definition): string {
    const description = entry.markdownDescription || entry.description || '';
    if (typeof description !== 'string') {
        console.error('%o', description);
        return '**`Strange Object`**';
    }
    let short = description.split('\n').slice(0, 1).join('');
    short = replaceLinks(short);
    return short;
}

async function loadSchema(): Promise<JSONSchema7> {
    const schema = JSON.parse(await fs.readFile(schemaFile, 'utf8'));

    return schema;
}

const regExpMatchLink = /\{@link (.*?)\}/g;

/**
 * Replace {@link formatEntryType } with a markdown link.
 */
function replaceLinks(markdown: string): string {
    markdown = markdown.replaceAll(regExpMatchLink, (_match, p1) => {
        p1 = p1.trim();
        if (!p1) return '';
        const id = resolveLinkTarget(p1);
        if (!id) {
            // No matching heading exists on this page (e.g. a TS-only type not represented
            // in the JSON schema) - fall back to plain text instead of a dead anchor.
            console.warn(
                `extract-properties: unable to resolve {@link ${p1}} referenced in section "${currentSectionName || '(top-level)'}"; rendering as plain text.`,
            );
            return `\`${p1}\``;
        }
        return `[${p1}](#${id})`;
    });
    return markdown;
}

function propertyIsJSONSchema7(element: [string, JSONSchema7Definition]): element is [string, JSONSchema7] {
    const [key, entry] = element;
    return typeof key === 'string' && entry && typeof entry === 'object' && !Array.isArray(entry);
}

function entryIsJSONSchema7(entry: JSONSchema7Definition): entry is JSONSchema7 {
    return entry && typeof entry === 'object';
}

if (import.meta.main) {
    run();
}
