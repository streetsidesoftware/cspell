import { TrieNode, FLAG_WORD } from './TrieNode';
import { mergeDefaults } from './util';
import { FORBID_PREFIX, COMPOUND_FIX, CASE_INSENSITIVE_PREFIX } from './constants';

export type CompoundModes = 'none' | 'compound' | 'legacy';

export interface FindOptions {
    matchCase: boolean;
    compoundMode: CompoundModes;
    forbidPrefix: string;
    compoundFix: string;
    caseInsensitivePrefix: string;
}

export type PartialFindOptions = Partial<FindOptions> | undefined;

export interface FindNodeResult {
    node: TrieNode | undefined;
}

export interface FindResult {
    found: string | false;
    compoundUsed: boolean;
}

export interface FindFullNodeResult extends FindNodeResult, FindResult {}

export interface FindFullResult extends FindResult {
    forbidden: boolean;
}

const _defaultFindOptions: FindOptions = {
    matchCase: false,
    compoundMode: 'compound',
    forbidPrefix: FORBID_PREFIX,
    compoundFix: COMPOUND_FIX,
    caseInsensitivePrefix: CASE_INSENSITIVE_PREFIX,
};

const arrayCompoundModes: CompoundModes[] = ['none', 'compound', 'legacy'];
const knownCompoundModes = new Map<CompoundModes, CompoundModes>(arrayCompoundModes.map((a) => [a, a]));

/**
 *
 * @param root Trie root node. root.c contains the compound root and forbidden root.
 * @param word A pre normalized word use `normalizeWord` or `normalizeWordToLowercase`
 * @param options
 */
export function findWord(root: TrieNode, word: string, options?: PartialFindOptions): FindFullResult {
    const _options = mergeDefaults(options, _defaultFindOptions);
    const compoundMode = knownCompoundModes.get(_options.compoundMode) || _defaultFindOptions.compoundMode;
    // word = _options.matchCase ? normalizeWord(word) : normalizeWordToLowercase(word);

    function __findCompound(r: TrieNode): FindFullResult {
        const f = findCompoundWord(r, word, _options.compoundFix);
        let forbidden = false;
        if (f.found !== false && f.compoundUsed) {
            forbidden = isForbiddenWord(root, word, _options.forbidPrefix);
        }
        const result: FindFullResult = { ...f, forbidden };
        return result;
    }

    function __findLegacyCompound(r: TrieNode): FindFullResult {
        const f = findLegacyCompoundWord(r, word);
        const forbidden = false;
        const result: FindFullResult = { ...f, forbidden };
        return result;
    }

    function __findExact(r: TrieNode): FindFullResult {
        const isFound = findWordExact(r, word);
        let forbidden = false;
        if (!isFound) {
            forbidden = isForbiddenWord(root, word, _options.forbidPrefix);
        }
        const result: FindFullResult = {
            found: (isFound || forbidden) && word,
            compoundUsed: false,
            forbidden,
        };
        return result;
    }

    const r = _options.matchCase ? root : root.c?.get(_options.caseInsensitivePrefix) || root;
    switch (compoundMode) {
        case 'none':
            return __findExact(r);
        case 'compound':
            return __findCompound(r);
        case 'legacy':
            return __findLegacyCompound(r);
    }
}

interface FindCompoundChain {
    n: TrieNode | undefined;
    usedCompound: boolean;
}

export function findCompoundNode(
    root: TrieNode | undefined,
    word: string,
    compoundCharacter: string
): FindFullNodeResult {
    // Approach - do a depth first search for the matching word.
    const stack: FindCompoundChain[] = [{ n: root, usedCompound: true }];
    const compoundRoot = root?.c?.get(compoundCharacter);
    const w = word;
    let compoundUsed = false;
    let i = 0;
    let node: TrieNode | undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const s = stack[i];
        const h = w[i++];
        const c = s.n?.c?.get(h);
        if (c && i < word.length) {
            // Go deeper.
            stack[i] = { n: c, usedCompound: false };
        } else if (!c || !c.f) {
            // Remember the first matching node for possible auto completion.
            node = node || c;

            // We did not find the word backup and take the first unused compound branch
            while (--i > 0 && (stack[i].usedCompound || !stack[i].n?.c?.has(compoundCharacter))) {
                /* empty */
            }
            if (i > 0) {
                compoundUsed = true;
                const s = stack[i];
                s.n = compoundRoot;
                s.usedCompound = true;
            } else {
                break;
            }
        } else {
            node = c;
            break;
        }
    }

    const found = (i && i === word.length && word) || false;
    const result: FindFullNodeResult = { found, compoundUsed, node };
    return result;
}

export function findCompoundWord(root: TrieNode | undefined, word: string, compoundCharacter: string): FindResult {
    const { found, compoundUsed, node } = findCompoundNode(root, word, compoundCharacter);
    // Was it a word?
    if (!node || !node.f) {
        return { found: false, compoundUsed };
    }
    return { found, compoundUsed };
}

export function findWordExact(root: TrieNode | undefined, word: string): boolean {
    const { node } = findNodeExact(root, word);
    return (node?.f || 0) === FLAG_WORD;
}

export function findNodeExact(root: TrieNode | undefined, word: string): FindNodeResult {
    const w = word;
    let n: TrieNode | undefined = root;
    let i = 0;
    while (n && i < word.length) {
        const h = w[i++];
        n = n.c?.get(h);
    }

    return { node: n };
}

interface FindLegacyCompoundChain extends FindCompoundChain {
    /** Length of sub compound */
    subLength: number;
    isCompound: boolean;
}

export function findLegacyCompoundNode(
    root: TrieNode | undefined,
    word: string,
    minCompoundLength: number
): FindFullNodeResult {
    // Approach - do a depth first search for the matching word.
    const stack: FindLegacyCompoundChain[] = [{ n: root, usedCompound: true, subLength: 0, isCompound: false }];
    const compoundRoot = root;
    const w = word;
    let compoundUsed = false;
    let i = 0;
    let node: TrieNode | undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const s = stack[i];
        const h = w[i++];
        const c = s.n?.c?.get(h);
        if (c && i < word.length) {
            // Go deeper.
            stack[i] = {
                n: c,
                usedCompound: false,
                subLength: s.subLength + 1,
                isCompound: s.isCompound,
            };
        } else if (!c || !c.f || (c.f && s.subLength < minCompoundLength - 1)) {
            // We did not find the word backup and take the first unused compound branch
            while (--i > 0) {
                const s = stack[i];
                if (!s.usedCompound && s.n?.f && s.subLength >= minCompoundLength) {
                    break;
                }
            }
            if (i > 0) {
                compoundUsed = true;
                const s = stack[i];
                s.n = compoundRoot;
                s.usedCompound = true;
                s.subLength = 0;
                s.isCompound = true;
            } else {
                break;
            }
        } else {
            node = c;
            break;
        }
    }

    const found = (i && i === word.length && word) || false;
    const result: FindFullNodeResult = { found, compoundUsed, node };
    return result;
}

export function findLegacyCompoundWord(root: TrieNode | undefined, word: string, minCompoundLength = 3): FindResult {
    const { found, compoundUsed } = findLegacyCompoundNode(root, word, minCompoundLength);
    return { found, compoundUsed };
}

export function isForbiddenWord(root: TrieNode | undefined, word: string, forbiddenPrefix: string): boolean {
    return findWordExact(root?.c?.get(forbiddenPrefix), word);
}
