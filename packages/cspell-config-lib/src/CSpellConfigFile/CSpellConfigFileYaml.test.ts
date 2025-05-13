import { describe, expect, test } from 'vitest';

import { createTextFile, TextFile } from '../TextFile.js';
import { unindent } from '../util/unindent.js';
import { CSpellConfigFileYaml, parseCSpellConfigFileYaml } from './CSpellConfigFileYaml.js';

describe('CSpellConfigFileYaml', () => {
    test('parseCSpellConfigFileYaml identity', () => {
        const cfg = parseCSpellConfigFileYaml(asTextFile(example()));
        expect(cfg.serialize()).toEqual(example());
    });

    test('parseCSpellConfigFileYaml parse error', () => {
        expect(() => parseCSpellConfigFileYaml(asTextFile('invalid yaml'))).toThrowError();
    });

    test('parseCSpellConfigFileYaml add words', () => {
        const example = unindent`\
            # Top Comment Block
            # Before object
            words:
                # This is a comment
                - banana # Inline "b"
                - apple # Inline "a"
                - cabbage
                - date

                # Section two
                - eggplant # Inline "eggplant"

            # After object
        `;
        const expected = unindent`\
            # Top Comment Block
            # Before object
            words:
                # This is a comment
                - apple # Inline "a"
                - banana # Inline "b"
                - cabbage
                - date

                # Section two
                - broccoli
                - carrot
                - eggplant # Inline "eggplant"
                - fig

            # After object
        `;
        const cfg = parseCSpellConfigFileYaml(asTextFile(example));
        const words = ['fig', 'carrot', 'broccoli', 'fig'];
        cfg.addWords(words);
        expect(cfg.serialize()).toEqual(expected);
    });

    test('parseCSpellConfigFileYaml add words', () => {
        const example = unindent`\
            words:
                # This is a comment
                - banana # Inline "b"
                - apple # Inline "a"
                - cabbage
                - date
                - orange
                # before eggplant
                - eggplant # Inline "eggplant"

            # After object
        `;
        const expected = unindent`\
            words:
                # This is a comment
                - apple # Inline "a"
                - banana # Inline "b"
                - broccoli
                - cabbage
                - carrot
                - date
                # before eggplant
                - eggplant # Inline "eggplant"
                - fig
                - orange

            # After object
        `;
        const cfg = CSpellConfigFileYaml.parse(asTextFile(example));
        const words = ['fig', 'carrot', 'broccoli', 'fig'];
        cfg.addWords(words);
        expect(cfg.serialize()).toEqual(expected);
    });

    test('parseCSpellConfigFileYaml add words 2', () => {
        const example = unindent`\
            ---
            # file version
            version: '0.2'
            words:
                - angle # with comment
                # Before "before"
                - before
                - cache # cache comment
                - zebra # zebra comment
        `;
        const expected = unindent`\
            ---
            # file version
            version: '0.2'
            words:
                - after
                - angle # with comment
                - apple
                # Before "before"
                - before
                - cache # cache comment
                - zebra # zebra comment
        `;
        const cfg = parseCSpellConfigFileYaml(asTextFile(example));
        const words = ['apple', 'cache', 'after'];
        cfg.addWords(words);
        expect(cfg.serialize()).toEqual(expected);
    });

    test('parseCSpellConfigFileYaml add words headers', () => {
        const example = unindent`\
            words:
                # Group 1
                - z
                - b
                - a

                # Group 2
                - zebra # zebra comment
                - angle # with comment
                # Before "before"
                - before
                - cache # cache comment

                # Group 3

                # before Dog
                - dog
                - cat
                - bat # bat comment
                # before ape
                - ape
        `;
        const expected = unindent`\
            words:
                # Group 1
                - a
                - b
                - z

                # Group 2
                - angle # with comment
                # Before "before"
                - before
                - cache # cache comment
                - zebra # zebra comment

                # Group 3

                - after
                # before ape
                - ape
                - apple
                - bat # bat comment
                - cat
                # before Dog
                - dog
        `;
        const cfg = parseCSpellConfigFileYaml(asTextFile(example));
        const words = ['apple', 'cache', 'after'];
        cfg.addWords(words);
        expect(cfg.serialize()).toEqual(expected);
    });

    test('parseCSpellConfigFileYaml add words headers', () => {
        const example = unindent`\
            words:
                # Group 1
                - one

                # Group 2
                - two

                # Group 3

                # before Dog
                - dog
                - cat
                - bat # bat comment
                # before ape
                - ape
        `;
        const expected = unindent`\
            words:
                # Group 1
                - one

                # Group 2
                - two

                # Group 3

                # before ape
                - ape
                - apple
                - bat # bat comment
                - cache
                - cat
                # before Dog
                - dog
        `;
        const cfg = parseCSpellConfigFileYaml(asTextFile(example));
        const words = ['apple', 'cache'];
        cfg.addWords(words);
        expect(cfg.serialize()).toEqual(expected);
    });

    test('parseCSpellConfigFileYaml add words headers', () => {
        const example = unindent`\
            words:
                # Group 1
                - one

                # Group 2
                - two

                # Group 3
                - group3
                # before Dog
                - dog
                - cat
                - bat # bat comment
                # before ape
                - ape
        `;
        const expected = unindent`\
            words:
                # Group 1
                - one

                # Group 2
                - two

                # Group 3

                # before ape
                - ape
                - apple
                - bat # bat comment
                - cache
                - cat
                # before Dog
                - dog
                - group3
        `;
        const cfg = parseCSpellConfigFileYaml(asTextFile(example));
        const words = ['apple', 'cache'];
        cfg.addWords(words);
        expect(cfg.serialize()).toEqual(expected);
    });
});

function example() {
    return unindent`\
        # Top Comment Block
        # Before object
        words:
            # This is a comment
            - banana # Inline "b"
            - apple # Inline "a"
            - cabbage
            - date

            # Section two
            - eggplant # Inline "eggplant"

        # After object
    `;
}

function asTextFile(content: string, url?: string | URL): TextFile {
    return createTextFile(url instanceof URL ? url : new URL('cspell.config.yaml', url || import.meta.url), content);
}
