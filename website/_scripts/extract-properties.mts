import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import type { JSONSchema7, JSONSchema7Definition } from 'json-schema';
import type {
    BlockContent,
    DefinitionEntry,
    InlineContent,
    MDInlineFragment,
} from '@streetsidesoftware/markdown-toolkit';
import * as md from '@streetsidesoftware/markdown-toolkit';
import { unindent } from '@streetsidesoftware/unindent';

import { relativeToSite } from './lib/utils.mts';
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

    const frontmatter = unindent`\
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`${relativeToSite(import.meta.url)}\`
        title: Properties
        slug: properties
        toc_max_heading_level: 5
        sidebar_position: 1
        sidebar_label: Properties
        format: md
    `;

    const page = md.document(
        md.frontmatter(frontmatter),
        md.heading(1, 'CSpell Configuration'),
        schemaEntry(schema, 'Settings'),
        formatDefinitions(schema),
    );

    await fs.writeFile(generatedTargetUrl, page.toString(), 'utf8');
    console.log(`Generating config properties at ${relativeToSite(generatedTargetUrl)} - Done.`);
}

function schemaEntry(entry: JSONSchema7, name: string): BlockContent {
    if (entry.type === 'object') {
        return schemaObjectEntry(entry, name);
    }
    return formatTopLevelType(name, entry);
}

function schemaObjectEntry(schemaTypeObject: JSONSchema7, nameOfType: string): BlockContent {
    currentSectionName = nameOfType;
    const required = new Set(schemaTypeObject.required || []);

    const isRequired = (key: string) => (required.has(key) && 1) || 0;
    const entries = Object.entries(schemaTypeObject.properties || {})
        .filter(propertyIsJSONSchema7)
        .sort((a, b) => isRequired(b[0]) - isRequired(a[0]) || a[0].localeCompare(b[0]));

    return [
        md.heading(2, nameOfType),
        md.table(
            ['Field', 'Type', 'Description'],
            entries.map(([key, entry]) => formatPropertyForOverview(key, entry, nameOfType, required.has(key))),
        ),
        md.heading(3, `${nameOfType} Fields`),
        entries.map(([key, entry]) => formatPropertyToDisplay(key, entry, nameOfType, required.has(key))),
    ];
}

function linkToHeader(name: string, section?: string, text?: InlineContent): InlineContent {
    return md.link(text ?? name, `#${toId(section, name)}`);
}

function toId(nameOfParentType: string | undefined, header: string): string {
    return (nameOfParentType ? `${nameOfParentType}-${header}` : header).toLowerCase().replaceAll(/\W/g, '-');
}

function formatPropertyForOverview(
    key: string,
    entry: Definition,
    section: string,
    isRequired: boolean,
): InlineContent[] {
    const link = linkToHeader(key, section);
    return [
        isRequired ? [link, ' ', md.sup(md.emphasis('req'))] : link,
        formatEntryType(entry),
        formatEntryDescriptionShort(entry),
    ];
}

function formatPropertyToDisplay(
    key: string,
    entry: Definition,
    nameOfParentType: string,
    isRequired: boolean,
): BlockContent {
    return [
        md.hr(),
        md.heading(4, [md.inlineCode(key), ` {#${toId(nameOfParentType, key)}}`]),
        formatTypeEntryBody(entry, isRequired),
    ];
}

function formatTopLevelType(key: string, entry: JSONSchema7): BlockContent {
    currentSectionName = '';
    return [md.hr(), md.heading(2, `${key} {#${toId('', key)}}`), formatTypeEntryBody(entry, false)];
}

function formatTypeEntryBody(entry: Definition, isRequired: boolean): BlockContent {
    const entries: DefinitionEntry[] = [];

    const description = entry.markdownDescription || entry.description;
    if (description) {
        entries.push(['Description', md.parse(replaceLinks(description))]);
    }

    const type = isRequired ? ['Type', ' ', md.sub(md.sup(md.emphasis('< required >')))] : 'Type';
    entries.push([type, formatEntryType(entry)]);

    if (entry.since) {
        entries.push(['Since', entry.since]);
    }

    return md.dl(entries);
}

function formatEntryType(entry: Definition): InlineContent {
    if (entry.type === 'array' && entry.items && typeof entry.items === 'object') {
        if (!Array.isArray(entry.items)) {
            return [formatEntryType(entry.items), md.htmlEntity('ZeroWidthSpace'), md.inlineCode('[]')];
        }
        const items = entry.items.filter(entryIsJSONSchema7).map((item) => formatEntryType(item));
        return [md.inlineCode('['), joinInline(items, ', '), md.inlineCode(']')];
    }
    if (entry.enum) {
        const values = entry.enum.map((value) => md.inlineCode(JSON.stringify(value)));
        return joinInline(values, ' | ');
    }
    if (entry.type) {
        const types = Array.isArray(entry.type) ? entry.type.join(' | ') : entry.type;
        return md.inlineCode(types);
    }
    if (entry.$ref) {
        return formatReferenceType(entry.$ref);
    }
    if (entry.anyOf) {
        const types = entry.anyOf.filter(entryIsJSONSchema7).map((type) => formatEntryType(type));
        return joinInline(types, md.br());
    }
    return md.inlineCode('Unknown');
}

function joinInline(parts: InlineContent[], separator: InlineContent): InlineContent {
    return parts.flatMap((part, i) => (i ? [separator, part] : [part]));
}

function formatReferenceType(ref: string): InlineContent {
    const refType = ref.split('/').slice(-1).join('');
    return linkToHeader(refType, '', md.inlineCode(refType));
}

function formatDefinitions(schema: Definition): BlockContent {
    return Object.entries(schema.definitions || {})
        .filter(propertyIsJSONSchema7)
        .map(([key, entry]) => schemaEntry(entry, key));
}

function formatEntryDescriptionShort(entry: Definition): MDInlineFragment {
    const description = entry.markdownDescription || entry.description || '';
    const firstLine = replaceLinks(description.split('\n')[0]);
    const cell = md.parse(firstLine);
    assert(cell.kind === 'inline', `A description's first line must be inline Markdown: ${JSON.stringify(firstLine)}`);
    return cell;
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
