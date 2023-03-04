import { createSpellingDictionary } from 'cspell-dictionary';

const dict = createDict(['one', 'two', 'three'], 'words');

export function run(word: string) {
    return dict.has(word);
}

export function createDict(words: string[], name: string) {
    return createSpellingDictionary(words, name, 'code');
}
