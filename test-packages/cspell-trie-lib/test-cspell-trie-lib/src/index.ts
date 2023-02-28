import { parseDictionary } from 'cspell-trie-lib';

export function createDictionary() {
    const words = `
one
two
three
`;

    return parseDictionary(words);
}

export function run() {
    const dict = createDictionary();
    return dict.has('two');
}
