import type { PartialWithUndefined } from '../types.ts';
import { assert } from '../utils/assert.ts';

export interface TrieInfo {
    compoundCharacter: string;
    stripCaseAndAccentsPrefix: string;
    forbiddenWordPrefix: string;
    suggestionPrefix: string;
}

export interface TrieCharacteristics {
    hasForbiddenWords: boolean;
    hasCompoundWords: boolean;
    hasNonStrictWords: boolean;
    hasPreferredSuggestions: boolean;
}

export interface TrieDef {
    readonly info: Readonly<Partial<TrieInfo>>;
    readonly characteristics: Readonly<Partial<TrieCharacteristics>>;
}

export type PartialTrieInfo = PartialWithUndefined<TrieInfo> | undefined;
export type PartialTrieInfoRO = Readonly<PartialWithUndefined<TrieInfo>> | undefined;
export type TrieCharacteristicsRO = Readonly<TrieCharacteristics>;

export type TrieCharacteristicsChars = {
    [K in keyof TrieCharacteristics]: string;
};

export const defaultTrieInfoSettings = {
    forbiddenWordPrefix: '!',
    stripCaseAndAccentsPrefix: '~',
    compoundCharacter: '+',
    suggestionPrefix: ':',
} as const;

type DefaultTrieInfoSettings = typeof defaultTrieInfoSettings;

type RevMapDefaultTrieInfoSettings = {
    [K in keyof DefaultTrieInfoSettings as DefaultTrieInfoSettings[K]]: K;
};

export const revMapDefaultTrieInfoSettings: RevMapDefaultTrieInfoSettings = {
    '!': 'forbiddenWordPrefix',
    '~': 'stripCaseAndAccentsPrefix',
    '+': 'compoundCharacter',
    ':': 'suggestionPrefix',
} as const;

export const defaultTrieCharacteristics = {
    hasForbiddenWords: '!',
    hasNonStrictWords: '~',
    hasCompoundWords: '+',
    hasPreferredSuggestions: ':',
} as const;

const mapInfoToCharacteristics = {
    compoundCharacter: 'hasCompoundWords',
    stripCaseAndAccentsPrefix: 'hasNonStrictWords',
    forbiddenWordPrefix: 'hasForbiddenWords',
    suggestionPrefix: 'hasPreferredSuggestions',
} as const;

const mapCharacteristicToInfo = {
    hasCompoundWords: 'compoundCharacter',
    hasNonStrictWords: 'stripCaseAndAccentsPrefix',
    hasForbiddenWords: 'forbiddenWordPrefix',
    hasPreferredSuggestions: 'suggestionPrefix',
} as const;

type DefaultTrieCharacteristics = typeof defaultTrieCharacteristics;

type RevMapDefaultTrieCharacteristics = {
    [K in keyof DefaultTrieCharacteristics as DefaultTrieCharacteristics[K]]: K;
};

const keysTrieCharacteristics = Object.keys(defaultTrieCharacteristics) as (keyof TrieCharacteristics)[];
const keysTrieInfo = Object.keys(defaultTrieInfoSettings) as (keyof TrieInfo)[];

export const revMapDefaultTrieCharacteristics: RevMapDefaultTrieCharacteristics = {
    '!': 'hasForbiddenWords',
    '+': 'hasCompoundWords',
    '~': 'hasNonStrictWords',
    ':': 'hasPreferredSuggestions',
} as const;

export type TrieInfoFlags = string;
export type TrieCharacteristicsFlags = string;

export function parseTrieInfoFlags(info: TrieInfoFlags): Partial<TrieInfo> {
    const trieInfo: Partial<TrieInfo> = {};
    for (let i = 0; i < info.length; i += 2) {
        const k = info[i];
        const c = info[i + 1];
        if (!charInRevMapDefaultTrieInfoSettings(k) || !c) continue;
        const key = revMapDefaultTrieInfoSettings[k];
        trieInfo[key] = c;
    }
    return trieInfo;
}

export function normalizeTrieInfo(info?: PartialTrieInfo, defaultInfo: TrieInfo = defaultTrieInfoSettings): TrieInfo {
    return {
        compoundCharacter: info?.compoundCharacter || defaultInfo.compoundCharacter,
        stripCaseAndAccentsPrefix: info?.stripCaseAndAccentsPrefix || defaultInfo.stripCaseAndAccentsPrefix,
        forbiddenWordPrefix: info?.forbiddenWordPrefix || defaultInfo.forbiddenWordPrefix,
        suggestionPrefix: info?.suggestionPrefix || defaultInfo.suggestionPrefix,
    };
}

/**
 * Extract the TrieInfo a source PartialTrieInfo
 * @param info - The source PartialTrieInfo
 * @returns a new object with only the defined TrieInfo properties.
 */
export function extractTrieInfo(info: PartialTrieInfo): Partial<TrieInfo> {
    return partialInfoToInfo(info);
}

export function cvtTrieInfoToFlags(info: Partial<TrieInfo>): TrieInfoFlags {
    let flags = '';
    for (const k of keysTrieInfo) {
        const c = info[k];
        if (!c) continue;
        assert(c.length === 1, `Expected single character for trie info ${k}, got '${c}'`);
        const flagChar = defaultTrieInfoSettings[k];
        flags += flagChar + c;
    }
    return flags;
}

function charInRevMapDefaultTrieInfoSettings(c: string): c is keyof RevMapDefaultTrieInfoSettings {
    return c in revMapDefaultTrieInfoSettings;
}

export function parseTrieCharacteristics(chars: TrieCharacteristicsFlags): Partial<TrieCharacteristics> {
    const characteristics: Partial<TrieCharacteristics> = {};
    for (const c of chars) {
        if (!charInRevMapDefaultTrieCharacteristics(c)) continue;
        const key = revMapDefaultTrieCharacteristics[c];
        characteristics[key] = true;
    }
    return characteristics;
}

export function extractTrieCharacteristics(src: Partial<TrieCharacteristics>): Partial<TrieCharacteristics> {
    const keys = keysTrieCharacteristics;
    const characteristics: Partial<TrieCharacteristics> = {};
    for (const key of keys) {
        if (key in src && src[key] !== undefined) {
            characteristics[key] = src[key];
        }
    }

    return characteristics;
}

export function normalizeTrieCharacteristics(
    characteristics: Partial<TrieCharacteristics>,
    defaultChar?: Partial<TrieCharacteristics>,
): TrieCharacteristics {
    return {
        hasForbiddenWords: !!(characteristics.hasForbiddenWords ?? defaultChar?.hasForbiddenWords),
        hasCompoundWords: !!(characteristics.hasCompoundWords ?? defaultChar?.hasCompoundWords),
        hasNonStrictWords: !!(characteristics.hasNonStrictWords ?? defaultChar?.hasNonStrictWords),
        hasPreferredSuggestions: !!(characteristics.hasPreferredSuggestions ?? defaultChar?.hasPreferredSuggestions),
    };
}

export function mapTrieCharacteristics(characteristics: Partial<TrieCharacteristics>, info: TrieInfo): string {
    let chars = '';
    for (const k of keysTrieCharacteristics) {
        if (characteristics[k] === true) {
            const infoKey = mapCharacteristicToInfo[k];
            const c = info[infoKey] || '';
            chars += c;
        }
    }
    return chars;
}

export function cvtTrieCharacteristicsToFlags(characteristics: Partial<TrieCharacteristics>): TrieCharacteristicsFlags {
    return mapTrieCharacteristics(characteristics, defaultTrieInfoSettings);
}

function charInRevMapDefaultTrieCharacteristics(c: string): c is keyof RevMapDefaultTrieCharacteristics {
    return c in revMapDefaultTrieCharacteristics;
}

function mapTrieCharacteristicToInfoValues(char: Partial<TrieCharacteristics>, info: TrieInfo): string[] {
    const keys: (keyof TrieInfo)[] = keysTrieCharacteristics
        .map((k) => [k, char[k]] as const)
        .filter((kvp): kvp is [keyof TrieCharacteristics, true] => kvp[1] === true)
        .map(([k]) => mapCharacteristicToInfo[k]);
    const chars = keys.map((k) => info[k]);

    return chars;
}

export class TrieInfoBuilder {
    #givenInfo: PartialTrieInfo;
    #givenCharacteristics: Partial<TrieCharacteristics>;
    #srcInfo: TrieInfo;
    #sugChar: string;
    #knownChars: Record<string, keyof TrieInfo>;
    #foundChars: Set<string>;

    constructor(info?: PartialTrieInfo, characteristics?: Partial<TrieCharacteristics>) {
        this.#givenInfo = info;
        this.#srcInfo = normalizeTrieInfo(info);
        this.#knownChars = revTrieInfo(this.#srcInfo);
        this.#sugChar = this.#srcInfo.suggestionPrefix;
        this.#givenCharacteristics = characteristics || {};
        this.#foundChars = new Set<string>(
            mapTrieCharacteristicToInfoValues(this.#givenCharacteristics, this.#srcInfo),
        );
    }

    setInfo(info: PartialTrieInfo): void {
        this.#givenInfo = info;
        this.#srcInfo = normalizeTrieInfo(info);
        this.#knownChars = revTrieInfo(this.#srcInfo);
        this.#sugChar = this.#srcInfo.suggestionPrefix;
        this.#foundChars = new Set<string>(
            mapTrieCharacteristicToInfoValues(this.#givenCharacteristics, this.#srcInfo),
        );
    }

    getActiveInfo(): Readonly<TrieInfo> {
        return this.#srcInfo;
    }

    addWord(word: string): void {
        if (word[0] in this.#knownChars) {
            this.#foundChars.add(word[0]);
        }
        if (word.includes(this.#sugChar)) {
            this.#foundChars.add(this.#sugChar);
        }
    }

    #getCharacteristics(): Partial<TrieCharacteristics> {
        const characteristics: Partial<TrieCharacteristics> = {};

        for (const char of this.#foundChars) {
            const key = this.#knownChars[char];
            if (!key) continue;
            const charToCharacteristic = mapInfoToCharacteristics[key];
            if (!charToCharacteristic) continue;
            characteristics[charToCharacteristic] = true;
        }

        return characteristics;
    }

    #getInfo(): Partial<TrieInfo> {
        const info: Partial<TrieInfo> = partialInfoToInfo(this.#givenInfo);

        for (const char of this.#foundChars) {
            const key = this.#knownChars[char];
            if (!key) continue;
            info[key] = this.#srcInfo[key];
        }

        return info;
    }

    build(): TrieDef {
        return {
            info: this.#getInfo(),
            characteristics: this.#getCharacteristics(),
        };
    }
}

function partialInfoToInfo(info: PartialTrieInfo): Partial<TrieInfo> {
    if (!info) return {};
    return Object.fromEntries(keysTrieInfo.map((k) => [k, info[k]] as const).filter(([_k, v]) => !!v));
}

function revTrieInfo(info: TrieInfo): Record<string, keyof TrieInfo> {
    const rev: Record<string, keyof TrieInfo> = {};
    for (const k of keysTrieInfo) {
        const v = info[k];
        if (typeof v !== 'string') continue;
        rev[v] = k;
    }

    return rev;
}

export interface TrieDefBase {
    readonly info: Readonly<Partial<TrieInfo>>;
    readonly characteristics: Readonly<Partial<TrieCharacteristics>>;
}
