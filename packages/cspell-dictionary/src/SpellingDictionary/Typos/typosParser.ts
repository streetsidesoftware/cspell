import { TyposDef } from './typos';
import { opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';

type TypoNoSuggestions = string;
type TypoWithSuggestionsArray = [forbidWord: string, ...suggestions: string[]];
type TypoWithSuggestionsObj = TyposDef;
type TypoWithSuggestions = TypoWithSuggestionsArray | TypoWithSuggestionsObj;
type TypoEntry = TypoNoSuggestions | TypoWithSuggestions;

export function createTypoDef(entries: Iterable<TypoEntry>): TyposDef {
    const def: TyposDef = Object.create(null);

    function appendToDef(def: TyposDef, entry: TypoEntry) {
        if (!entry) return;
        if (typeof entry === 'string') {
            def[entry] = null;
            return;
        }
        if (Array.isArray(entry)) {
            const [key, ...sugs] = entry;
            if (!key) return;
            const s = sugs.map((s) => s.trim()).filter((s) => !!s);
            def[key] = !s.length ? null : s.length === 1 ? s[0] : s;
            return;
        }

        Object.assign(def, entry);
    }

    for (const entry of entries) {
        appendToDef(def, entry);
    }

    return def;
}

export function parseTyposLine(line: string): TypoEntry {
    const [left, right] = line.split(/:|->/, 2);
    const typo = left.trim();
    if (!right) return typo;
    const sugs = right
        .split(/[,;]/)
        .map((sug) => sug.trim())
        .filter((sug) => !!sug);
    const def: TyposDef = Object.create(null);
    def[typo] = !sugs.length ? null : sugs.length === 1 ? sugs[0] : sugs;
    return def;
}

export function parseTyposFile(content: string): TyposDef {
    const lines = content.replace(/#.*/gm, '').split('\n');

    const entries = pipe(
        lines,
        opMap((line) => line.trim()),
        opFilter((line) => !!line),
        opMap(parseTyposLine)
    );

    return createTypoDef(entries);
}
