import { expect } from 'chai';
import { DawgTrieBuilder } from './builder';
import { has, findNode, walk, iteratorTrieWords } from './util';
import { readTrie } from './dictionaries.test';
import { genSequence } from 'gensequence';

describe('Validate the builder', () => {
    it('test small set of words', () => {
        const words = ['run', 'runs', 'ran', 'running', 'runner'].sort();
        const builder = new DawgTrieBuilder();
        words.forEach(w => builder.addWord(w));
        expect([...walk(builder.trie).filter(r => !!r.node.f).map(r => r.text)].sort()).to.be.deep.equal(words);
    });

    it('test adding a word', () => {
        const builder = new DawgTrieBuilder();
        builder.addWord('hello');
        expect(has(builder.trie, 'hello')).to.be.true;
        const root = builder.trie;
        builder.addWord('hello');
        expect(builder.trie).to.be.equal(root);
        builder.addWord('help');
        builder.addWord('helps');
        builder.addWord('yelp');
        builder.addWord('yelps');
        expect(builder.trie).to.be.not.equal(root);
        expect(has(builder.trie, 'helps')).to.be.true;
        sampleWords().forEach(w => builder.addWord(w));
        expect(findNode(builder.trie, 'help')).to.be.equal(findNode(builder.trie, 'yelp'));
        expect([...iteratorTrieWords(builder.trie)].sort()).to.be.deep.equal(sampleWords().sort());
    });

    it('Test reading in a large dictionary', async function() {
        this.timeout(50000);
        const trie = await readTrie('cspell-dict-en_us');
        const builder = new DawgTrieBuilder();
        genSequence(trie.words()).take(5000).forEach(w => builder.addWord(w));
        expect(has(builder.trie, 'acquired')).to.be.true;
    });

    it('test tree view', () => {
        const builder = new DawgTrieBuilder();
        builder.addWord('hello');
        builder.addWord('help');
        builder.addWord('helps');
        builder.addWord('yelp');
        builder.addWord('yelps');
        const expected = `\
{ id: 23, h: cec3919a: f:- }
  "h" --> { id: 14, h: 63b33d5f: f:- }
    "e" --> { id: 13, h: bd7c98ba: f:- }
      "l" --> { id: 12, h: 48bf7399: f:- }
        "l" --> { id: 2, h: 5a761715: f:- }
          "o" --> { id: 1, h: b1bd97c4: f:- }
            "" --> { id: 0, h: 00000000: f:1 }
        "p" --> { id: 11, h: 9e362bb4: f:- }
          "" --> <0> (2)
          "s" --> <1> (2)
  "y" --> { id: 22, h: cc06c167: f:- }
    "e" --> { id: 21, h: 12c9649a: f:- }
      "l" --> { id: 20, h: e70a8fa1: f:- }
        "p" --> <11> (2)

Nodes: 11\
`;
        expect(DawgTrieBuilder.trieToString(builder.trie)).to.be.equal(expected);
    });
});


function sampleWords() {
    return [
        'hello',
        'helloing',
        'help',
        'helped',
        'helper',
        'helpers',
        'helping',
        'helps',
        'ran',
        'run',
        'runner',
        'running',
        'runs',
        'talk',
        'talked',
        'talker',
        'talkers',
        'talking',
        'talks',
        'walk',
        'walked',
        'walker',
        'walkers',
        'walking',
        'walks',
        'yelp',
        'yelped',
        'yelper',
        'yelpers',
        'yelping',
        'yelps',
    ];
}