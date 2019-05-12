import { expect } from 'chai';
import * as suggest from './suggest';
import { Trie } from 'cspell-trie';
import { compareResults } from './helpers';

describe('Validate Suggest', () => {
    it('test suggestions', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear',
            'cattle', 'rattle', 'battle',
            'rattles', 'battles', 'tattles',
        ];
        const trie = Trie.create(words);
        // cspell:ignore aple
        const suggestions = [...suggest.suggest(trie, 'aple')].sort(compareResults);
        expect(suggestions).to.not.be.empty;
    });
});
