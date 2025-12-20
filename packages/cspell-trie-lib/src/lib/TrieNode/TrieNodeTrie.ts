import { consolidate } from '../consolidate.ts';
import type { ITrieNode, ITrieNodeRoot } from '../ITrieNode/ITrieNode.ts';
import { findNode } from '../ITrieNode/trie-util.ts';
import type { PartialTrieOptions, TrieOptions } from '../trie.ts';
import type { TrieData } from '../TrieData.ts';
import { mergeOptionalWithDefaults } from '../utils/mergeOptionalWithDefaults.ts';
import { findWordExact } from './find.ts';
import { trieRootToITrieRoot } from './trie.ts';
import { countNodes, createTrieRootFromList, iteratorTrieWords } from './trie-util.ts';
import type { TrieRoot } from './TrieNode.ts';

export class TrieNodeTrie implements TrieData {
    private _iTrieRoot: ITrieNodeRoot | undefined;
    readonly info: TrieOptions;
    private _size: number | undefined;
    readonly hasForbiddenWords: boolean;
    readonly hasCompoundWords: boolean;
    readonly hasNonStrictWords: boolean;
    readonly root: TrieRoot;

    constructor(root: TrieRoot) {
        this.root = root;
        this.info = mergeOptionalWithDefaults(root);
        this.hasForbiddenWords = !!root.c[root.forbiddenWordPrefix];
        this.hasCompoundWords = !!root.c[root.compoundCharacter];
        this.hasNonStrictWords = !!root.c[root.stripCaseAndAccentsPrefix];
    }

    wordToCharacters = (word: string): string[] => [...word];

    get iTrieRoot(): ITrieNodeRoot {
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

    get size(): number {
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
