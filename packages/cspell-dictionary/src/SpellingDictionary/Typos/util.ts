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
