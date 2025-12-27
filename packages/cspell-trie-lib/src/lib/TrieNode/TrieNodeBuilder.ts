import { type BuilderCursor, insertWordsAtCursor, type TrieBuilder } from '../Builder/index.ts';
import { TrieInfoBuilder } from '../ITrieNode/TrieInfo.ts';
import type { PartialTrieOptions, TrieOptions } from '../trie.ts';
import { assert } from '../utils/assert.ts';
import { assertIsValidChar } from '../utils/isValidChar.ts';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.ts';
import { createTrieRoot } from './trie-util.ts';
import type { ChildMap, TrieNode, TrieRoot } from './TrieNode.ts';
import { TrieNodeTrie } from './TrieNodeTrie.ts';

interface LockableTrieNode extends TrieNode {
    /** locked */
    k?: true;
}

const EOW: LockableTrieNode = Object.freeze({ f: 1, k: true });

interface TrieNodeBranch extends LockableTrieNode {
    c: ChildMap;
}

const compare = new Intl.Collator().compare;

export class TrieNodeBuilder implements TrieBuilder<TrieNodeTrie> {
    #cursor: BuilderCursor | undefined;
    root: TrieRoot = createTrieRoot();
    #trieInfoBuilder: TrieInfoBuilder = new TrieInfoBuilder(this.root);
    shouldSort = false;
    suggestionPrefix: string = this.root.suggestionPrefix;

    wordToCharacters = (word: string): string[] => [...word];

    setOptions(options: Readonly<PartialTrieOptions>): Readonly<TrieOptions> {
        const opts = mergeOptionalWithDefaults(options, this.root);
        Object.assign(this.root, opts);
        return opts;
    }

    build(): TrieNodeTrie {
        return new TrieNodeTrie(this.root);
    }

    getCursor(): BuilderCursor {
        this.#cursor ??= this.createCursor();
        return this.#cursor;
    }

    private createCursor(): BuilderCursor {
        const root = this.root;
        const sug = this.suggestionPrefix;
        const nodes: LockableTrieNode[] = [root, EOW];
        const eow = EOW;

        interface StackItem {
            /** node */
            n: TrieNodeBranch;
            /** child used */
            c: string;
        }

        assert(Object.keys(root.c).length === 0, 'The Trie MUST be empty for cursors to work.');

        const stack: StackItem[] = [{ n: root, c: '' }];

        let currNode: LockableTrieNode = root;
        let depth = 0;

        const insertChar = (char: string) => {
            assertIsValidChar(char);

            if (!depth || char === sug) {
                this.#trieInfoBuilder.addWord(char);
            }

            // console.warn('i %o', char);
            if (currNode.k) {
                const s = stack[depth];
                const { k: _, c, ...copy } = currNode;
                currNode = s.n.c[s.c] = copy;
                if (c) {
                    currNode.c = Object.assign(Object.create(null), c);
                }
                nodes.push(currNode);
            }
            const c = currNode.c || Object.create(null);
            currNode.c = c;
            const n = currNode as TrieNodeBranch;
            const next = (c[char] = c[char] || {});
            nodes.push(next);
            ++depth;
            const s = stack[depth];
            if (s) {
                s.n = n;
                s.c = char;
            } else {
                stack.push({ n, c: char });
            }
            currNode = next;
        };

        const markEOW = () => {
            // console.warn('$');
            if (!currNode.c) {
                // no children, set the parent to point to the common EOW.
                const s = stack[depth];
                s.n.c[s.c] = eow;
                if (nodes[nodes.length - 1] === currNode) {
                    nodes.pop();
                }
                currNode = eow;
            } else {
                currNode.f = 1;
            }
        };

        const reference = (nodeId: number) => {
            const s = stack[depth];
            s.n.c[s.c] = nodes[nodeId];
            nodes.pop();
        };

        const backStep = (num: number) => {
            if (!num) return;
            // console.warn('<< %o', num);
            assert(num <= depth && num > 0);
            depth -= num;
            currNode = stack[depth + 1].n;
        };

        const c: BuilderCursor = {
            insertChar,
            markEOW,
            reference,
            backStep,
        };

        return c;
    }

    sortChildren(node: TrieNodeBranch): void {
        const entries = Object.entries(node.c).sort((a, b) => compare(a[0], b[0]));
        node.c = Object.fromEntries(entries);
        for (const c of Object.values(node.c)) {
            if (c.c) {
                this.sortChildren(c as TrieNodeBranch);
            }
        }
    }

    sortNodes(): void {
        if (this.shouldSort) {
            this.sortChildren(this.root);
        }
    }
}

export function buildTrieNodeTrieFromWords(words: Iterable<string>): TrieNodeTrie {
    const builder = new TrieNodeBuilder();
    insertWordsAtCursor(builder.getCursor(), words);
    return builder.build();
}
