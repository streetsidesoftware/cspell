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
            .insert('run')
            .insert('randomly')
            .insert('ran')
            .insert('ramp');
        const trie = builder.build();
        // cspell:ignore ning
        const r1 = displayTrie2(trie);
        expect(r1).toBe(
            `
            run
            ...s
            ...ning
            ....er
            .ank
            ...dom
            ......ly
            ...
            ..mp
        `.replace(/^\s+/gm, '')
        );
        const r2 = displayTrie2(trie, true, '+');
        expect(r2).toBe(
            `
            ramp
            ++n
            +++dom
            ++++++ly
            +++k
            +un
            +++ner
            ++++ing
            +++s
        `.replace(/^\s+/gm, '')
        );
    });
});
