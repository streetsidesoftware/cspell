import type { CSpellSettings } from '@cspell/cspell-types';

export interface CSpellConfigFileReference {
    readonly url: URL;
}

export interface ICSpellConfigFile {
    readonly url: URL;
    readonly settings: CSpellSettings;
    readonly readonly?: boolean;
}

export abstract class CSpellConfigFile implements ICSpellConfigFile {
    constructor(readonly url: URL) {}

    abstract readonly settings: CSpellSettings;
    abstract addWords(words: string[]): this;
}

export abstract class ImplCSpellConfigFile extends CSpellConfigFile {
    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
    ) {
        super(url);
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
 * Note: this method is used to try and preserve comments in the config file.
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
