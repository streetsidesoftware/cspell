import { type BuilderCursor, insertWordsAtCursor, type TrieBuilder } from '../Builder/index.js';
import { mergeOptionalWithDefaults } from '../index.js';
import type { PartialTrieOptions, TrieOptions } from '../trie.js';
import { defaultTrieOptions } from '../trie.js';
import { assert } from '../utils/assert.js';
import type { ChildMap, TrieNode, TrieRoot } from './TrieNode.js';
import { TrieNodeTrie } from './TrieNodeTrie.js';

interface LockableTrieNode extends TrieNode {
    /** locked */
    k?: true;
}

const EOW: LockableTrieNode = Object.freeze({ f: 1, k: true });

interface TrieNodeBranch extends LockableTrieNode {
    c: ChildMap;
}

export class TrieNodeBuilder implements TrieBuilder<TrieNodeTrie> {
    private _cursor: BuilderCursor | undefined;
    root: TrieRoot = { ...defaultTrieOptions, c: Object.create(null) };

    setOptions(options: Readonly<PartialTrieOptions>): Readonly<TrieOptions> {
        const opts = mergeOptionalWithDefaults(options, this.root);
        Object.assign(this.root, opts);
        return opts;
    }

    build(): TrieNodeTrie {
        return new TrieNodeTrie(this.root);
    }

    getCursor(): BuilderCursor {
        this._cursor ??= this.createCursor();
        return this._cursor;
    }

    private createCursor(): BuilderCursor {
        const nodes: LockableTrieNode[] = [this.root, EOW];
        const eow = EOW;

        interface StackItem {
            /** node */
            n: TrieNodeBranch;
            /** child used */
            c: string;
        }

        assert(Object.keys(this.root.c).length === 0, 'The Trie MUST be empty for cursors to work.');

        const stack: StackItem[] = [{ n: this.root, c: '' }];

        let currNode: LockableTrieNode = this.root;
        let depth = 0;

        const insertChar = (char: string) => {
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
}

export function buildTrieNodeTrieFromWords(words: Iterable<string>): TrieNodeTrie {
    const builder = new TrieNodeBuilder();
    insertWordsAtCursor(builder.getCursor(), words);
    return builder.build();
}
