import { Trie2Builder } from './trie2';
import { displayTrie2 } from './trie2Helper';

describe('Validate Trie2Builder', () => {
    it('test builder', () => {
        const builder = new Trie2Builder();
        builder
        .insert('run')
        .insert('runs')
        .insert('running')
        .insert('runner')
        .insert('rank')
        .insert('random')
        .insert('ran')
        .insert('randomly')
        .insert('ramp')
        ;
        const trie = builder.build();
        // cspell:ignore ning
        expect(displayTrie2(trie)).toBe(`
            run
            ...s
            ...ning
            ....er
            .ank
            ...dom
            ......ly
            ...
            ..mp
        `.replace(/^\s+/gm, ''));
        expect(displayTrie2(trie, true, '+')).toBe(`
            ramp
            ++n
            +++dom
            ++++++ly
            +++k
            +un
            +++ner
            ++++ing
            +++s
        `.replace(/^\s+/gm, ''));
    });
});
