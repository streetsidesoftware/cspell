import { removeAccents } from './text';

export function* mapperNormalizeNFC(words: Iterable<string>): Iterable<string> {
    for (const word of words) {
        yield word.normalize('NFC');
    }
}

export function* mapperRemoveCaseAndAccents(words: Iterable<string>): Iterable<string> {
    for (const word of words) {
        const lc = word.toLowerCase();
        yield lc;
        const woAccents = removeAccents(lc);
        if (lc !== woAccents) yield woAccents;
    }
}
