"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const suggest = require("./suggest");
const cspell_trie_1 = require("cspell-trie");
const helpers_1 = require("./helpers");
describe('Validate Suggest', () => {
    it('test suggestions', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear',
            'cattle', 'rattle', 'battle',
            'rattles', 'battles', 'tattles',
        ];
        const trie = cspell_trie_1.Trie.create(words);
        const suggestions = [...suggest.suggest(trie, 'aple')].sort(helpers_1.compareResults);
        chai_1.expect(suggestions).to.not.be.empty;
    });
});
//# sourceMappingURL=suggest.test.js.map