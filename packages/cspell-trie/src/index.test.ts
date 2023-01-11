import { createTriFromList, importTrie, serializeTrie, Trie } from 'cspell-trie-lib';

describe('Validate Library', () => {
    it('test', () => {
        const words = ['apple', 'banana', 'kiwi', 'mango', 'orange'];
        const w = createTriFromList(words);
        const s = serializeTrie(w);
        const t = importTrie(s);
        const tt = new Trie(t);
        expect([...tt.words()]).toEqual(words);
    });
});
