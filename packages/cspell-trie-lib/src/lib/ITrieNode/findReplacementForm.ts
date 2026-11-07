import type { RepTrieNode } from '../utils/repMap.ts';
import type { ITrieNode, ITrieNodeId, ITrieNodeRoot } from './ITrieNode.ts';

interface Step {
    /** Next position to read in the word. */
    pos: number;
    node: ITrieNode;
    /** Length of the current compound part, stops counting at the minimum part length. */
    partLength: number;
    /** The rest of a replacement to follow before reading the word again. */
    pending: string;
    /** The text this step added to the form. */
    text: string;
    prev: Step | undefined;
}

/**
 * Search the trie for a form of the word, following each letter and each matching replacement at the same time.
 * A branch ends as soon as the trie has no match for it, so the cost does not grow with the number of forms.
 *
 * Pairs of position and node that have already failed are not searched again. The trie shares the endings of its
 * words, so many forms reach the same pair.
 *
 * @param root - the root of the trie.
 * @param word - the word to search for.
 * @param replacements - the replacements to follow.
 * @param matchCase - `false` to also search the words stored without case and accents.
 * @param legacyMinCompoundLength - use legacy compounds with parts of at least this length. `0` to use the trie's
 *   compound markers.
 * @returns the first form of the word that the trie accepts.
 */
export function findReplacementForm(
    root: ITrieNodeRoot,
    word: string,
    replacements: RepTrieNode,
    matchCase: boolean,
    legacyMinCompoundLength: number,
): string | undefined {
    const compoundCharacter = root.info.compoundCharacter ?? root.compoundFix;
    const ignoreCasePrefix = root.info.stripCaseAndAccentsPrefix ?? root.caseInsensitivePrefix;
    const ignoreCaseRoot = matchCase ? undefined : followText(root, ignoreCasePrefix);
    const isLegacy = legacyMinCompoundLength > 0;
    const minPartLength = isLegacy ? legacyMinCompoundLength : 1;
    const compoundRoots = isLegacy
        ? [ignoreCaseRoot, root]
        : [ignoreCaseRoot && followText(ignoreCaseRoot, compoundCharacter), followText(root, compoundCharacter)];
    const visited = new Map<number, Set<ITrieNodeId>>();
    const stack: Step[] = [];

    addRoot(ignoreCaseRoot, 0, '', undefined);
    addRoot(root, 0, '', undefined);

    while (stack.length) {
        const step = stack.pop() as Step;
        const { pos, node, partLength, pending } = step;
        const isEnd = pos === word.length && !pending;
        if (isEnd && node.eow && partLength >= minPartLength) return formOf(step);
        if (!pending && hasVisited(pos, partLength, node.id)) continue;

        if (!isEnd && partLength >= minPartLength && (isLegacy ? node.eow : node.has(compoundCharacter))) {
            for (const compoundRoot of compoundRoots) {
                addRoot(compoundRoot, pos, pending, step);
            }
        }

        if (pending) {
            const letter = String.fromCodePoint(pending.codePointAt(0) as number);
            addLetter(step, letter, pos, pending.slice(letter.length));
            continue;
        }
        if (isEnd) continue;

        addReplacements(step);
        const letter = String.fromCodePoint(word.codePointAt(pos) as number);
        addLetter(step, letter, pos + letter.length, '');
    }
    return undefined;

    function addRoot(node: ITrieNode | undefined, pos: number, pending: string, prev: Step | undefined): void {
        if (!node) return;
        stack.push({ pos, node, partLength: 0, pending, text: '', prev });
    }

    function addLetter(prev: Step, letter: string, pos: number, pending: string): void {
        const node = prev.node.get(letter);
        if (!node) return;
        const partLength = Math.min(prev.partLength + 1, minPartLength);
        stack.push({ pos, node, partLength, pending, text: letter, prev });
    }

    /** Added in reverse, so that the search takes them in the order of the map. */
    function addReplacements(prev: Step): void {
        const matches: { end: number; replacement: string }[] = [];
        let repNode = replacements.children?.[word[prev.pos]];
        for (let end = prev.pos + 1; repNode; ++end) {
            for (const replacement of repNode.rep || []) {
                matches.push({ end, replacement });
            }
            repNode = end < word.length ? repNode.children?.[word[end]] : undefined;
        }
        for (let i = matches.length - 1; i >= 0; --i) {
            const { end, replacement } = matches[i];
            stack.push({
                pos: end,
                node: prev.node,
                partLength: prev.partLength,
                pending: replacement,
                text: '',
                prev,
            });
        }
    }

    function hasVisited(pos: number, partLength: number, id: ITrieNodeId): boolean {
        const key = pos * (minPartLength + 1) + partLength;
        let ids = visited.get(key);
        if (!ids) {
            ids = new Set();
            visited.set(key, ids);
        }
        if (ids.has(id)) return true;
        ids.add(id);
        return false;
    }
}

function followText(node: ITrieNode | undefined, text: string): ITrieNode | undefined {
    for (const letter of text) {
        node = node?.get(letter);
    }
    return node;
}

function formOf(last: Step): string {
    const parts: string[] = [];
    for (let step: Step | undefined = last; step; step = step.prev) {
        parts.push(step.text);
    }
    return parts.reverse().join('');
}
