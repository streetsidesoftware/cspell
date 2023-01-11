import { CASE_INSENSITIVE_PREFIX, COMPOUND_FIX, FORBID_PREFIX } from './constants';
import { memorizeLastCall } from './utils/memorizeLastCall';
import { mergeDefaults } from './trie-util';
import type { TrieNode, TrieRoot } from './TrieNode';
import { FLAG_WORD } from './TrieNode';
import type { PartialWithUndefined } from './types';

type Root = PartialWithUndefined<TrieRoot>;

/**
 * No compounding allowed.
 */
export type CompoundModeNone = 'none';

/**
 * Allow natural compounding in the dictionary
 * using compound prefixes
 */
export type CompoundModesCompound = 'compound';

/**
 * Allow all possible compounds -- Very slow.
 */
export type CompoundModesLegacy = 'legacy';

export type CompoundModes = CompoundModeNone | CompoundModesCompound | CompoundModesLegacy;

const defaultLegacyMinCompoundLength = 3;
export interface FindOptions {
    matchCase: boolean;
    compoundMode: CompoundModes;
    forbidPrefix: string;
    compoundFix: string;
    caseInsensitivePrefix: string;
    legacyMinCompoundLength: number;
}

export type PartialFindOptions = PartialWithUndefined<FindOptions> | undefined;

export interface FindNodeResult {
    node: TrieNode | undefined;
}

export interface FindResult {
    found: string | false;
    compoundUsed: boolean;
    caseMatched: boolean;
}

export interface FindFullResult extends FindResult {
    /**
     * Is the word explicitly forbidden.
     * - `true` - word is in the forbidden list.
     * - `false` - word is not in the forbidden list.
     * - `undefined` - unknown - was not checked.
     * */
    forbidden: boolean | undefined;
}

export interface FindFullNodeResult extends FindNodeResult, FindFullResult {}

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
    const compoundMode = knownCompoundModes.get(options.compoundMode) || _defaultFindOptions.compoundMode;
    const compoundPrefix = options.compoundMode === 'compound' ? root.compoundCharacter ?? options.compoundFix : '';
    const ignoreCasePrefix = options.matchCase ? '' : root.stripCaseAndAccentsPrefix ?? options.caseInsensitivePrefix;

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
        case 'none':
            return options.matchCase ? __findExact() : __findCompound();
        case 'compound':
            return __findCompound();
        case 'legacy':
            return findLegacyCompound(root, word, options);
    }
}

export function findLegacyCompound(root: Root, word: string, options: FindOptions): FindFullNodeResult {
    const roots: (TrieNode | undefined)[] = [root];
    if (!options.matchCase) {
        roots.push(walk(root, options.caseInsensitivePrefix));
    }
    return findLegacyCompoundNode(roots, word, options.legacyMinCompoundLength);
}

interface FindCompoundChain {
    n: Root | undefined;
    cr: TrieNode | undefined;
    compoundPrefix: string;
    caseMatched: boolean;
}

export function findCompoundNode(
    root: Root | undefined,
    word: string,
    compoundCharacter: string,
    ignoreCasePrefix: string
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
        let r: TrieNode | undefined = root;
        let i;
        for (i = 0; i < prefix.length && r; ++i) {
            r = r.c?.get(prefix[i]);
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
    let node: TrieNode | undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const s = stack[i];
        const h = w[i++];
        const n = s.cr || s.n;
        const c = n?.c?.get(h);
        if (c && i < word.length) {
            // Go deeper.
            caseMatched = s.caseMatched;
            stack[i] = { n: c, compoundPrefix, cr: undefined, caseMatched };
        } else if (!c || !c.f) {
            // Remember the first matching node for possible auto completion.
            node = node || c;

            // We did not find the word backup and take the first unused compound branch
            while (--i > 0 && (!stack[i].compoundPrefix || !stack[i].n?.c?.has(compoundCharacter))) {
                /* empty */
            }
            if (i >= 0 && stack[i].compoundPrefix) {
                compoundUsed = i > 0;
                const r = determineRoot(stack[i]);
                stack[i] = r;
                if (!r.cr) {
                    break;
                }
                if (!i && !r.caseMatched) {
                    if (w !== w.toLowerCase()) {
                        // It is not going to be found.
                        break;
                    }
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
    ignoreCasePrefix: string
): FindFullNodeResult {
    const { found, compoundUsed, node, caseMatched } = findCompoundNode(
        root,
        word,
        compoundCharacter,
        ignoreCasePrefix
    );
    // Was it a word?
    if (!node || !node.f) {
        return { found: false, compoundUsed, node, forbidden: undefined, caseMatched };
    }
    return { found, compoundUsed, node, forbidden: undefined, caseMatched };
}

export function findWordExact(root: Root | TrieNode | undefined, word: string): boolean {
    return isEndOfWordNode(walk(root, word));
}

export function isEndOfWordNode(n: TrieNode | undefined): boolean {
    return n?.f === FLAG_WORD;
}

function walk(root: Root | TrieNode | undefined, word: string): TrieNode | undefined {
    const w = word;
    let n: TrieNode | undefined = root;
    let i = 0;
    while (n && i < word.length) {
        const h = w[i++];
        n = n.c?.get(h);
    }

    return n;
}

interface FindLegacyCompoundChain {
    n: TrieNode | undefined;
    cr: TrieNode | undefined;
    usedRoots: number;
    caseMatched: boolean;
    /** Length of sub compound */
    subLength: number;
    isCompound: boolean;
}

function findLegacyCompoundNode(
    roots: (TrieNode | undefined)[],
    word: string,
    minCompoundLength: number
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
    let node: TrieNode | undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const s = stack[i];
        const h = w[i++];
        const n = s.cr || s.n;
        const c = n?.c?.get(h);
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
        } else if (!c || !c.f || (c.f && s.subLength < minCompoundLength - 1)) {
            // We did not find the word backup and take the first unused compound branch
            while (--i > 0) {
                const s = stack[i];
                if (
                    s.usedRoots < numRoots &&
                    s.n?.f &&
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

function findLegacyCompoundWord(roots: (TrieNode | undefined)[], word: string, minCompoundLength: number): FindResult {
    const { found, compoundUsed, caseMatched } = findLegacyCompoundNode(roots, word, minCompoundLength);
    return { found, compoundUsed, caseMatched };
}

export function isForbiddenWord(root: Root | TrieNode | undefined, word: string, forbiddenPrefix: string): boolean {
    return findWordExact(root?.c?.get(forbiddenPrefix), word);
}

export const createFindOptions = memorizeLastCall(_createFindOptions);

function _createFindOptions(options: PartialFindOptions | undefined): FindOptions {
    return mergeDefaults(options, _defaultFindOptions);
}

export const __testing__ = {
    findLegacyCompoundWord,
};
