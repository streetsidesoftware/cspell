import { opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';
import assert from 'assert';
import { TypoEntry, TyposDef, TyposDefValue } from './typos';
import { appendToDef, createTyposDef } from './util';

function assertString(v: unknown): v is string {
    assert(typeof v === 'string', 'A string was expected.');
    return true;
}

export function createTyposDefFromEntries(entries: Iterable<TypoEntry>): TyposDef {
    const def: TyposDef = Object.create(null);

    for (const entry of entries) {
        appendToDef(def, entry);
    }

    return def;
}

function splitSuggestionsValue(value: string): TyposDefValue {
    const sugs = value
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter((s) => !!s);
    return sugs.length === 1 ? sugs[0] : sugs.length ? sugs : null;
}

export function sanitizeIntoTypoDef(dirtyDef: TyposDef | Record<string, unknown> | unknown): TyposDef | undefined {
    if (!dirtyDef || typeof dirtyDef !== 'object') return undefined;

    const def = createTyposDef();

    for (const [key, value] of Object.entries(dirtyDef)) {
        if (typeof value === 'string') {
            def[key] = splitSuggestionsValue(value);
            continue;
        }
        if (Array.isArray(value)) {
            const sugs = value
                .filter(assertString)
                .map((v) => v.trim())
                .filter((v) => !!v);
            def[key] = sugs.length === 1 ? sugs[0] : !sugs.length ? null : sugs;
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
export function processEntriesToTyposDef(entries: TyposDef | TypoEntry[] | Record<string, unknown>): TyposDef {
    const def = Array.isArray(entries) ? reduceToTyposDef(entries) : entries;
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
        const [left, right] = splitEntry(line);
        const typo = left.trim();
        if (!right) return typo;
        const sugs = splitSuggestionsValue(right);
        const def = createTyposDef();
        def[typo] = sugs;
        return def;
    }
    if (Array.isArray(line)) {
        const [key, ...sugs] = line.filter(assertString).map((s) => s.trim());
        if (!key) return undefined;
        return [key, ...sugs];
    }
    return sanitizeIntoTypoDef(line);
}

function splitEntry(line: string): [string, string | undefined] {
    return line.split(/:|->/, 2) as [string, string];
}

export function parseTyposFile(content: string): TyposDef {
    const lines = content.replace(/#.*/gm, '').split('\n');

    const entries = pipe(
        lines,
        opMap((line) => line.trim()),
        opFilter((line) => !!line)
    );

    return reduceToTyposDef(entries);
}
