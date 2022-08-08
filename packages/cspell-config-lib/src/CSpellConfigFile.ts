import { CSpellSettings } from '@cspell/cspell-types';
import { Serializer } from './Serializer';

export interface CSpellConfigFile {
    readonly uri: string;
    readonly settings: CSpellSettings;
    serialize(): string;
    addWords(words: string[]): this;
}

export class ImplCSpellConfigFile implements CSpellConfigFile {
    constructor(readonly uri: string, readonly settings: CSpellSettings, readonly serializer: Serializer) {}

    serialize(): string {
        return this.serializer(this.settings);
    }

    addWords(words: string[]): this {
        const w = this.settings.words || [];
        this.settings.words = w;
        addUniqueWordsToListAndSort(w, words);
        return this;
    }
}

/**
 * Adds words to a list, sorts the list and makes sure it is unique.
 * @param list - list to be modified
 * @param toAdd - words to add
 */
function addUniqueWordsToListAndSort(list: string[], toAdd: string[]): void {
    list.unshift(...toAdd);
    list.sort();
    for (let i = 1; i < list.length; ++i) {
        if (list[i] === list[i - 1]) {
            list.splice(i, 1);
            --i;
        }
    }
}

export const __testing__ = {
    addUniqueWordsToListAndSort,
};
