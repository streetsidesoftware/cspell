import type { CSpellSettings } from '@cspell/cspell-types';

import type { ValueOf1 } from './types.js';
import type { CfgNode } from './UpdateConfig/CfgTree.js';

export type { CfgNode } from './UpdateConfig/CfgTree.js';

export interface CSpellConfigFileReference {
    readonly url: URL;
}

export interface ICSpellConfigFile {
    /**
     * The url of the config file, used to resolve imports.
     */
    readonly url: URL;
    /**
     * The settings from the config file.
     */
    readonly settings: CSpellSettings;
    /**
     * Indicate that the config file is readonly.
     */
    readonly?: boolean;
    /**
     * Indicate that the config file is virtual and not associated with a file on disk.
     */
    virtual?: boolean;
    /**
     * Indicate that the config file is remote and not associated with a file on disk.
     */
    remote?: boolean;
}

export abstract class CSpellConfigFile implements ICSpellConfigFile {
    constructor(readonly url: URL) {}

    /**
     * The settings from the config file.
     * Note: this is a copy of the settings from the config file. It should be treated as immutable.
     * For performance reasons, it might not be frozen.
     */
    abstract readonly settings: CSpellSettings;

    /**
     * Helper function to add words to the config file.
     * @param words - words to add to the config file.
     */
    abstract addWords(words: string[]): this;

    get readonly(): boolean {
        return this.settings.readonly || this.url.protocol !== 'file:';
    }

    get virtual(): boolean {
        return false;
    }

    get remote(): boolean {
        return this.url.protocol !== 'file:';
    }
}

type S = CSpellSettings;

export abstract class MutableCSpellConfigFile extends CSpellConfigFile {
    /**
     * Helper function to add words to the config file.
     * @param words - words to add to the config file.
     */
    abstract addWords(words: string[]): this;

    abstract setValue<K extends keyof S>(key: K, value: ValueOf1<S, K>): this;
    abstract getValue<K extends keyof S>(key: K): ValueOf1<S, K> | undefined;
    abstract getNode<K extends keyof S>(key: K): CfgNode<ValueOf1<S, K>> | undefined;
}

export abstract class ImplCSpellConfigFile extends CSpellConfigFile {
    constructor(
        readonly url: URL,
        readonly settings: CSpellSettings,
    ) {
        super(url);
    }

    addWords(words: string[]): this {
        if (this.readonly) throw new Error(`Config file is readonly: ${this.url.href}`);
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
    list.push(...toAdd);
    list.sort();
    for (let i = 1; i < list.length; ++i) {
        if (list[i] === list[i - 1]) {
            list.splice(i, 1);
            --i;
        }
    }
}

export function satisfiesCSpellConfigFile(obj: unknown): obj is ICSpellConfigFile {
    const r: boolean =
        obj instanceof CSpellConfigFile ||
        (!!obj &&
            typeof obj === 'object' &&
            'url' in obj &&
            obj.url instanceof URL &&
            'settings' in obj &&
            !!obj.settings &&
            typeof obj.settings === 'object');
    return r;
}

export const __testing__ = {
    addUniqueWordsToListAndSort,
};
