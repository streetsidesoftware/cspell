import assert from 'assert';
import { TypoEntry, TyposDef, TyposDefValue } from './typos';
import { appendToDef, createTyposDef } from './util';

function assertString(v: unknown): v is string {
    assert(typeof v === 'string', 'A string was expected.');
    return true;
}

const suggestionsSeparator = /[,]/;
const typoSuggestionsSeparator = /:|->/;
const typoEntrySeparator = /[\n;]/;
const inlineComment = /#.*/gm;

export function createTyposDefFromEntries(entries: Iterable<TypoEntry>): TyposDef {
    const def: TyposDef = Object.create(null);

    for (const entry of entries) {
        appendToDef(def, entry);
    }

    return def;
}

function normalize(s: string): string {
    return s.normalize();
}

function trimAndFilter(lines: readonly string[]): string[] {
    return lines
        .map((s) => s.trim())
        .filter((s) => !!s)
        .map(normalize);
}

function cleanSugs(rawSugs: readonly string[]): TyposDefValue {
    const sugs = trimAndFilter(rawSugs);
    return sugs.length === 1 ? sugs[0] : sugs.length ? sugs : null;
}

function splitSuggestionsValue(value: string): TyposDefValue {
    return cleanSugs(value.split(suggestionsSeparator));
}

export function sanitizeIntoTypoDef(dirtyDef: TyposDef | Record<string, unknown> | unknown): TyposDef | undefined {
    if (!dirtyDef || typeof dirtyDef !== 'object') return undefined;

    const def = createTyposDef();

    for (const [rawKey, value] of Object.entries(dirtyDef)) {
        const key = normalize(rawKey.trim());
        if (!key) continue;
        if (typeof value === 'string') {
            def[key] = splitSuggestionsValue(value);
            continue;
        }
        if (Array.isArray(value)) {
            const sugs = cleanSugs(value.filter(assertString));
            def[key] = sugs;
            continue;
        }
        assert(value === null || value === undefined, 'Unexpected suggestion type.');
        def[key] = null;
    }

    return def;
}

/**
 * Used to process entries found in a `cspell.json` file.
 * @param entries - entries to process
 * @returns a TyposDef
 */
export function processEntriesToTyposDef(entries: Iterable<TypoEntry> | TyposDef | Record<string, unknown>): TyposDef {
    const def = isIterable(entries) ? reduceToTyposDef(entries) : entries;
    const result = sanitizeIntoTypoDef(def);
    assert(result);
    return result;
}

function reduceToTyposDef(entries: Iterable<TypoEntry>): TyposDef {
    const def = createTyposDef();
    for (const entry of entries) {
        appendToDef(def, parseTyposLine(entry));
    }
    return def;
}

/**
 * Tries to parse an entry.
 * @param line - any valid TypoEntry.
 * @returns a valid TypoEntry
 */
export function parseTyposLine(line: TypoEntry): TypoEntry | undefined {
    if (!line) return undefined;
    if (typeof line === 'string') {
        const def = createTyposDef();
        for (const subEntry of splitIntoLines(line)) {
            const [left, right] = splitEntry(subEntry);
            const typo = left.trim();
            if (!right) return typo;
            const sugs = splitSuggestionsValue(right);
            def[typo] = sugs;
        }
        return def;
    }
    if (Array.isArray(line)) {
        const [key, ...sugs] = line.filter(assertString).map((s) => s.trim());
        if (!key) return undefined;
        return [key, ...sugs];
    }
    return sanitizeIntoTypoDef(line);
}

function splitIntoLines(content: string): string[] {
    return trimAndFilter(normalize(content).split(typoEntrySeparator));
}

function splitEntry(line: string): readonly [string, string | undefined] {
    return line.split(typoSuggestionsSeparator, 2) as [string, string];
}

export function parseTyposFile(content: string): TyposDef {
    const lines = splitIntoLines(content.replace(inlineComment, ''));
    return reduceToTyposDef(lines);
}

function isIterable<T>(v: Iterable<T> | object): v is Iterable<T> {
    return Symbol.iterator in v;
}
