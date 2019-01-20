import { expect } from 'chai';
import { DawgTrieBuilder } from './builder';
import { has, findNode } from './util';

describe('Validate the builder', () => {
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