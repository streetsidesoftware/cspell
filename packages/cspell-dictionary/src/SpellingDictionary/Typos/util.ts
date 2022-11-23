import { opConcatMap, opFilter, pipe } from '@cspell/cspell-pipe/sync';
import { TypoEntry, TyposDef, TyposDefKey, TyposDefValue } from './typos';

/**
 * Append an entry to a TyposDef.
 * @param def - modified in place
 * @param entry- entry to add.
 * @returns def
 */
export function appendToDef(def: TyposDef, entry: TypoEntry | undefined): TyposDef {
    if (!entry) return def;
    if (typeof entry === 'string') {
        def[entry] = null;
        return def;
    }
    if (Array.isArray(entry)) {
        const [key, ...sugs] = entry.map((s) => s.trim());
        if (!key) return def;
        const s = sugs.map((s) => s.trim()).filter((s) => !!s);
        def[key] = !s.length ? null : s.length === 1 ? s[0] : s;
        return def;
    }

    Object.assign(def, entry);
    return def;
}

export function createTyposDef(entries?: Iterable<[TyposDefKey, TyposDefValue]>): TyposDef {
    const def: TyposDef = Object.create(null);

    if (!entries) return def;

    for (const [key, value] of entries) {
        def[key] = value;
    }

    return def;
}

/**
 * Extract all suggestions.
 * @param typosDef - the def
 * @returns the set of suggestions.
 */
export function extractAllSuggestions(typosDef: TyposDef): Set<string> {
    const allSugs = pipe(
        Object.values(typosDef),
        opFilter(isDefined),
        opConcatMap((v) => (Array.isArray(v) ? v : [v]))
    );
    return new Set(allSugs);
}

/**
 * Extract all words that have been explicitly ignore because they contains the `ignorePrefix`.
 * @param typosDef - the def
 * @param ignorePrefix - prefix
 * @returns set of ignored words with the prefix removed.
 */
export function extractIgnoreValues(typosDef: TyposDef, ignorePrefix: string): Set<string> {
    const pfxLen = ignorePrefix.length;
    return new Set(
        Object.keys(typosDef)
            .filter((k) => k.startsWith(ignorePrefix))
            .map((k) => k.slice(pfxLen))
    );
}

function isDefined<T>(v: T | undefined | null): v is T {
    return v !== undefined && v !== null;
}
