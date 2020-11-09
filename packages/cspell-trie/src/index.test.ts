import * as lib from './index';
import { Trie } from 'cspell-trie-lib';

describe('Validate Library', () => {
    it('test', () => {
        const words = ['apple', 'banana', 'kiwi', 'mango', 'orange'];
        const w = lib.createTriFromList(words);
        const s = lib.serializeTrie(w);
        const t = lib.importTrie(s);
        const tt = new Trie(t);
        expect([...tt.words()]).toEqual(words);
    });
});
