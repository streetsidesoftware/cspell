import { CASE_INSENSITIVE_PREFIX, COMPOUND_FIX, FORBID_PREFIX } from '../constants.js';
import { memorizeLastCall } from '../utils/memorizeLastCall.js';
import { mergeDefaults } from '../utils/mergeDefaults.js';
import type { CompoundModes } from './CompoundModes.js';
import type { FindOptions, PartialFindOptions } from './FindOptions.js';
import type { FindFullNodeResult } from './FindTypes.js';
import type { FindFullResult, FindResult, ITrieNode, ITrieNodeRoot } from './ITrieNode.js';

type Root = ITrieNodeRoot;

const defaultLegacyMinCompoundLength = 3;

const _defaultFindOptions: FindOptions = {
    matchCase: false,
    compoundMode: 'compound',
    forbidPrefix: FORBID_PREFIX,
    compoundFix: COMPOUND_FIX,
    caseInsensitivePrefix: CASE_INSENSITIVE_PREFIX,
    legacyMinCompoundLength: defaultLegacyMinCompoundLength,
};

const arrayCompoundModes: CompoundModes[] = ['none', 'compound', 'legacy'];
const knownCompoundModes = new Map<CompoundModes, CompoundModes>(arrayCompoundModes.map((a) => [a, a]));

/**
 *
 * @param root Trie root node. root.c contains the compound root and forbidden root.
 * @param word A pre normalized word use `normalizeWord` or `normalizeWordToLowercase`
 * @param options
 */
export function findWord(root: Root, word: string, options?: PartialFindOptions): FindFullResult {
    return _findWord(root, word, createFindOptions(options));
}

/**
 *
 * @param root Trie root node. root.c contains the compound root and forbidden root.
 * @param word A pre normalized word use `normalizeWord` or `normalizeWordToLowercase`
 * @param options
 */
export function findWordNode(root: Root, word: string, options?: PartialFindOptions): FindFullNodeResult {
    return _findWordNode(root, word, createFindOptions(options));
}

/**
 *
 * @param root Trie root node. root.c contains the compound root and forbidden root.
 * @param word A pre normalized word use `normalizeWord` or `normalizeWordToLowercase`
 * @param options
 */
function _findWord(root: Root, word: string, options: FindOptions): FindFullResult {
    if (root.find) {
        const found = root.find(word, options.matchCase);
        if (found) return found as FindFullResult;
    }
    const { node: _, ...result } = _findWordNode(root, word, options);
    return result;
}

/**
 *
 * @param root Trie root node. root.c contains the compound root and forbidden root.
 * @param word A pre normalized word use `normalizeWord` or `normalizeWordToLowercase`
 * @param options
 */
function _findWordNode(root: Root, word: string, options: FindOptions): FindFullNodeResult {
    const trieInfo = root.info;
    const compoundMode = knownCompoundModes.get(options.compoundMode) || _defaultFindOptions.compoundMode;
    const compoundPrefix = options.compoundMode === 'compound' ? trieInfo.compoundCharacter ?? options.compoundFix : '';
    const ignoreCasePrefix = options.matchCase
        ? ''
        : trieInfo.stripCaseAndAccentsPrefix ?? options.caseInsensitivePrefix;

    function __findCompound(): FindFullNodeResult {
        const f = findCompoundWord(root, word, compoundPrefix, ignoreCasePrefix);
        const result: FindFullNodeResult = { ...f };
        if (f.found !== false && f.compoundUsed) {
            // If case was ignored when searching for the word, then check the forbidden
            // in the ignore case forbidden list.
            const r = !f.caseMatched ? walk(root, options.caseInsensitivePrefix) : root;
            result.forbidden = isForbiddenWord(r, word, options.forbidPrefix);
        }
        return result;
    }

    function __findExact(): FindFullNodeResult {
        const n = walk(root, word);
        const isFound = isEndOfWordNode(n);
        const result: FindFullNodeResult = {
            found: isFound && word,
            compoundUsed: false,
            forbidden: isForbiddenWord(root, word, options.forbidPrefix),
            node: n,
            caseMatched: true,
        };
        return result;
    }

    switch (compoundMode) {
        case 'none': {
            return options.matchCase ? __findExact() : __findCompound();
        }
        case 'compound': {
            return __findCompound();
        }
        case 'legacy': {
            return findLegacyCompound(root, word, options);
        }
    }
}

export function findLegacyCompound(root: Root, word: string, options: FindOptions): FindFullNodeResult {
    const roots: (ITrieNode | undefined)[] = [root];
    if (!options.matchCase) {
        roots.push(walk(root, options.caseInsensitivePrefix));
    }
    return findLegacyCompoundNode(roots, word, options.legacyMinCompoundLength);
}

interface FindCompoundChain {
    n: Root | ITrieNode | undefined;
    cr: ITrieNode | undefined;
    compoundPrefix: string;
    caseMatched: boolean;
}

export function findCompoundNode(
    root: Root | undefined,
    word: string,
    compoundCharacter: string,
    ignoreCasePrefix: string,
): FindFullNodeResult {
    // Approach - do a depth first search for the matching word.
    const stack: FindCompoundChain[] = [
        // { n: root, compoundPrefix: '', cr: undefined, caseMatched: true },
        { n: root, compoundPrefix: ignoreCasePrefix, cr: undefined, caseMatched: true },
    ];
    const compoundPrefix = compoundCharacter || ignoreCasePrefix;
    const possibleCompoundPrefix = ignoreCasePrefix && compoundCharacter ? ignoreCasePrefix + compoundCharacter : '';
    const w = word.normalize();

    function determineRoot(s: FindCompoundChain): FindCompoundChain {
        const prefix = s.compoundPrefix;
        let r: ITrieNode | undefined = root;
        let i;
        for (i = 0; i < prefix.length && r; ++i) {
            r = r.get(prefix[i]);
        }
        const caseMatched = s.caseMatched && prefix[0] !== ignoreCasePrefix;
        return {
            n: s.n,
            compoundPrefix: prefix === compoundPrefix ? possibleCompoundPrefix : '',
            cr: r,
            caseMatched,
        };
    }

    let compoundUsed = false;
    let caseMatched = true;
    let i = 0;
    let node: ITrieNode | undefined;

    while (true) {
        const s = stack[i];
        const h = w[i++];
        const n = s.cr || s.n;
        const c = n?.get(h);
        if (c && i < word.length) {
            // Go deeper.
            caseMatched = s.caseMatched;
            stack[i] = { n: c, compoundPrefix, cr: undefined, caseMatched };
        } else if (!c || !c.eow) {
            // Remember the first matching node for possible auto completion.
            node = node || c;

            // We did not find the word backup and take the first unused compound branch
            while (--i > 0) {
                const s = stack[i];
                if (!s.compoundPrefix || !s.n?.hasChildren()) continue;
                if (s.n.get(compoundCharacter)) break;
            }
            if (i >= 0 && stack[i].compoundPrefix) {
                compoundUsed = i > 0;
                const r = determineRoot(stack[i]);
                stack[i] = r;
                if (!r.cr) {
                    break;
                }
                if (!i && !r.caseMatched && w !== w.toLowerCase()) {
                    // It is not going to be found.
                    break;
                }
            } else {
                break;
            }
        } else {
            node = c;
            caseMatched = s.caseMatched;
            break;
        }
    }

    const found = (i && i === word.length && word) || false;
    const result: FindFullNodeResult = { found, compoundUsed, node, forbidden: undefined, caseMatched };
    return result;
}

function findCompoundWord(
    root: Root | undefined,
    word: string,
    compoundCharacter: string,
    ignoreCasePrefix: string,
): FindFullNodeResult {
    const { found, compoundUsed, node, caseMatched } = findCompoundNode(
        root,
        word,
        compoundCharacter,
        ignoreCasePrefix,
    );
    // Was it a word?
    if (!node || !node.eow) {
        // not found.
        return { found: false, compoundUsed, node, forbidden: undefined, caseMatched };
    }
    return { found, compoundUsed, node, forbidden: undefined, caseMatched };
}

export function findWordExact(root: Root | ITrieNode | undefined, word: string): boolean {
    const r = root as Root;
    if (r?.findExact) return r.findExact(word);
    return isEndOfWordNode(walk(root, word));
}

export function isEndOfWordNode(n: ITrieNode | undefined): boolean {
    return !!n?.eow;
}

function walk(root: Root | ITrieNode | undefined, word: string): ITrieNode | undefined {
    const w = [...word];
    let n: ITrieNode | undefined = root;
    let i = 0;
    while (n && i < w.length) {
        const h = w[i++];
        n = n.get(h);
    }

    return n;
}

interface FindLegacyCompoundChain {
    n: ITrieNode | undefined;
    cr: ITrieNode | undefined;
    usedRoots: number;
    caseMatched: boolean;
    /** Length of sub compound */
    subLength: number;
    isCompound: boolean;
}

function findLegacyCompoundNode(
    roots: (ITrieNode | undefined)[],
    word: string,
    minCompoundLength: number,
): FindFullNodeResult {
    const root = roots[0];
    const numRoots = roots.length;
    // Approach - do a depth first search for the matching word.
    const stack: FindLegacyCompoundChain[] = [
        { n: root, usedRoots: 1, subLength: 0, isCompound: false, cr: undefined, caseMatched: true },
    ];

    const w = word;
    const wLen = w.length;
    let compoundUsed = false;
    let caseMatched = true;
    let i = 0;
    let node: ITrieNode | undefined;

    while (true) {
        const s = stack[i];
        const h = w[i++];
        const n = s.cr || s.n;
        const c = n?.get(h);
        if (c && i < wLen) {
            // Go deeper.
            stack[i] = {
                n: c,
                usedRoots: 0,
                subLength: s.subLength + 1,
                isCompound: s.isCompound,
                cr: undefined,
                caseMatched: s.caseMatched,
            };
        } else if (!c || !c.eow || (c.eow && s.subLength < minCompoundLength - 1)) {
            // We did not find the word backup and take the first unused compound branch
            while (--i > 0) {
                const s = stack[i];
                if (
                    s.usedRoots < numRoots &&
                    s.n?.eow &&
                    (s.subLength >= minCompoundLength || !s.subLength) &&
                    wLen - i >= minCompoundLength
                ) {
                    break;
                }
            }
            if (i > 0 || stack[i].usedRoots < numRoots) {
                compoundUsed = i > 0;
                const s = stack[i];
                s.cr = roots[s.usedRoots++];
                s.subLength = 0;
                s.isCompound = compoundUsed;
                s.caseMatched = s.caseMatched && s.usedRoots <= 1;
            } else {
                break;
            }
        } else {
            node = c;
            caseMatched = s.caseMatched;
            break;
        }
    }

    function extractWord(): string | false {
        if (!word || i < word.length) return false;

        const letters: string[] = [];

        let subLen = 0;
        for (let j = 0; j < i; ++j) {
            const { subLength } = stack[j];
            if (subLength < subLen) {
                letters.push('+');
            }
            letters.push(word[j]);
            subLen = subLength;
        }
        return letters.join('');
    }

    const found = extractWord();
    const result: FindFullNodeResult = { found, compoundUsed, node, forbidden: undefined, caseMatched };
    return result;
}

function findLegacyCompoundWord(roots: (ITrieNode | undefined)[], word: string, minCompoundLength: number): FindResult {
    const { found, compoundUsed, caseMatched } = findLegacyCompoundNode(roots, word, minCompoundLength);
    return { found, compoundUsed, caseMatched };
}

export function isForbiddenWord(root: Root | ITrieNode | undefined, word: string, forbiddenPrefix: string): boolean {
    const r = root as Root | undefined;
    if (r?.isForbidden) return r.isForbidden(word);
    return findWordExact(root?.get(forbiddenPrefix), word);
}

export const createFindOptions = memorizeLastCall(_createFindOptions);

function _createFindOptions(options: PartialFindOptions | undefined): FindOptions {
    return mergeDefaults(options, _defaultFindOptions);
}

export const __testing__ = {
    findLegacyCompoundWord,
};
