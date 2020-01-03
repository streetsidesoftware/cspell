import { TrieNode, FLAG_WORD } from './TrieNode';
import { mergeDefaults, normalizeWord, normalizeWordToLowercase } from './util';
import { FORBID_PREFIX, COMPOUND_FIX, CASE_INSENSITIVE_PREFIX } from './constants';


export type CompoundModes = 'none' | 'compound';

export interface FindOptions {
    matchCase: boolean;
    compoundMode: CompoundModes;
    forbidPrefix: string;
    compoundFix: string;
    caseInsensitivePrefix: string;
}

export type PartialFindOptions = Partial<FindOptions> | undefined;

export interface FindResult {
    found: string | false;
    forbidden: boolean;
    compoundUsed: boolean;
}

const _defaultFindOptions: FindOptions = {
    matchCase: false,
    compoundMode: 'compound',
    forbidPrefix: FORBID_PREFIX,
    compoundFix: COMPOUND_FIX,
    caseInsensitivePrefix: CASE_INSENSITIVE_PREFIX,
};

const arrayCompoundModes: CompoundModes[] = ['none', 'compound'];
const knownCompoundModes = new Map<CompoundModes, CompoundModes>(arrayCompoundModes.map(a => [a, a]));

export function findWord(root: TrieNode, word: string, options?: PartialFindOptions): FindResult {
    const _options = mergeDefaults(options, _defaultFindOptions);
    const compoundMode = knownCompoundModes.get(_options.compoundMode) || _defaultFindOptions.compoundMode;
    word = _options.matchCase ? normalizeWord(word) : normalizeWordToLowercase(word);

    function findCompound(r: TrieNode): FindResult {
        const f = _findCompound(r, word, _options.compoundFix);
        let forbidden = false;
        if (f.found !== false && f.compoundUsed) {
            forbidden = _findExact(root.c?.get(_options.forbidPrefix), word);
        }
        const result: FindResult = { ...f, forbidden };
        return result;
    }

    function findExact(r: TrieNode): FindResult {
        const isFound = _findExact(r, word);
        let forbidden = false;
        if (!isFound) {
            forbidden = _findExact(root.c?.get(_options.forbidPrefix), word);
        }
        const result: FindResult = { found: (isFound || forbidden) && word, compoundUsed: false, forbidden };
        return result;
    }

    const r = _options.matchCase ? root : root.c?.get(_options.caseInsensitivePrefix) || root;
    if (compoundMode === 'none') {
        return  findExact(r);
    }
    return findCompound(r);
}

interface FindCompoundChain {
    n: TrieNode | undefined;
    usedCompound: boolean;
}

function _findCompound(root: TrieNode | undefined, word: string, compoundFix: string): FindResult {
    // Approach - do a depth first search for the matching word.
    const stack: FindCompoundChain[] = [{ n: root, usedCompound: true }];
    const compoundRoot = root?.c?.get(compoundFix);
    const w = word;
    let compoundUsed = false;
    let i = 0;
    while (true) {
        const s = stack[i];
        const h = w[i++];
        const c = s.n?.c?.get(h);
        if (c && i < word.length) {
            // Go deeper.
            stack[i] = { n: c, usedCompound: false };
        } else if (!c || !c.f) {
            // We did not find the word backup and take the first unused compound branch
            while (--i > 0 && (stack[i].usedCompound || !stack[i].n?.c?.has(compoundFix))) {}
            if (i > 0) {
                compoundUsed = true;
                const s = stack[i];
                s.n = compoundRoot;
                s.usedCompound = true;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    const found = (i && i === word.length) && word || false;
    const result: FindResult = { found, compoundUsed, forbidden: false };
    return result;
}


function _findExact(root: TrieNode | undefined, word: string): boolean {
    const w = word;
    let n: TrieNode | undefined = root;
    let i = 0;
    while (n && i < word.length) {
        const h = w[i++];
        n = n.c?.get(h);
    }

    return (i === word.length) && (n?.f || 0) === FLAG_WORD;
}
