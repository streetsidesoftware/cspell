import { Trie } from 'cspell-trie-lib';

import { compareResults } from './helpers';
import * as suggest from './suggest';

describe('Validate Suggest', () => {
    test('suggestions', () => {
        const words = [
            'apple',
            'ape',
            'able',
            'apple',
            'banana',
            'orange',
            'pear',
            'aim',
            'approach',
            'bear',
            'cattle',
            'rattle',
            'battle',
            'rattles',
            'battles',
            'tattles',
        ];
        const trie = Trie.create(words);
        // cspell:ignore aple
        const suggestions = [...suggest.suggest(trie, 'aple')].sort(compareResults);
        expect(Object.keys(suggestions)).not.toHaveLength(0);
    });
});
