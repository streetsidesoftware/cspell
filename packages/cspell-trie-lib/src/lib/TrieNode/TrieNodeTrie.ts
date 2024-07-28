import { consolidate } from '../consolidate.js';
import type { ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.js';
import { findNode } from '../ITrieNode/trie-util.js';
import type { PartialTrieOptions, TrieOptions } from '../trie.js';
import type { TrieData } from '../TrieData.js';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.js';
import { findWordExact } from './find.js';
import { trieRootToITrieRoot } from './trie.js';
import { countNodes, createTrieRootFromList, iteratorTrieWords } from './trie-util.js';
import type { TrieRoot } from './TrieNode.js';

export class TrieNodeTrie implements TrieData {
    private _iTrieRoot: ITrieNodeRoot | undefined;
    readonly info: TrieOptions;
    private _size: number | undefined;
    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;

    constructor(readonly root: TrieRoot) {
        this.info = mergeOptionalWithDefaults(root);
        this.hasForbiddenWords = !!root.c[root.forbiddenWordPrefix];
        this.hasCompoundWords = !!root.c[root.compoundCharacter];
        this.hasNonStrictWords = !!root.c[root.stripCaseAndAccentsPrefix];
    }

    wordToCharacters = (word: string): string[] => [...word];

    get iTrieRoot() {
        return this._iTrieRoot || (this._iTrieRoot = trieRootToITrieRoot(this.root));
    }

    getRoot(): ITrieNodeRoot {
        return this.iTrieRoot;
    }

    getNode(prefix: string): ITrieNode | undefined {
        return findNode(this.getRoot(), prefix);
    }

    words(): Iterable<string> {
        return iteratorTrieWords(this.root);
    }

    has(word: string): boolean {
        return findWordExact(this.root, word);
    }

    isForbiddenWord(word: string): boolean {
        return findWordExact(this.root.c[this.root.forbiddenWordPrefix], word);
    }

    get size() {
        return (this._size ??= countNodes(this.root));
    }

    static createFromWords(words: Iterable<string>, options?: PartialTrieOptions): TrieNodeTrie {
        const root = createTrieRootFromList(words, options);
        return new TrieNodeTrie(root);
    }

    static createFromWordsAndConsolidate(words: Iterable<string>, options?: PartialTrieOptions): TrieNodeTrie {
        const root = createTrieRootFromList(words, options);
        return new TrieNodeTrie(consolidate(root));
    }
}
