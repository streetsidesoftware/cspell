"use strict";
class TrieMap extends Map {
}
exports.TrieMap = TrieMap;
;
let trieNextId = 1;
/**
 *
 */
function addWordToTrie(trie, word) {
    function buildTrie(word, trieNodes = new TrieMap()) {
        const head = word.slice(0, 1);
        const tail = word.slice(1);
        const found = trieNodes.get(head);
        if (found) {
            found.c = head ? buildTrie(tail, found.c) : found.c;
        }
        else {
            const c = head ? buildTrie(tail) : undefined;
            const node = { k: trieNextId++, w: head, c };
            trieNodes.set(head, node);
        }
        return trieNodes;
    }
    const children = buildTrie(word, trie.c);
    return { c: children };
}
exports.addWordToTrie = addWordToTrie;
function wordListToTrie(words) {
    const trie = createTrie();
    for (const word of words) {
        addWordToTrie(trie, word);
    }
    return trie;
}
exports.wordListToTrie = wordListToTrie;
function wordsToTrie(words) {
    const trie = createTrie();
    return words
        .reduce(addWordToTrie, trie)
        .toPromise();
}
exports.wordsToTrie = wordsToTrie;
function createTrie() {
    return { c: new TrieMap() };
}
exports.createTrie = createTrie;
//# sourceMappingURL=Trie.js.map