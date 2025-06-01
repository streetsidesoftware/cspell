import assert from 'node:assert';

import { describe, expect, test } from 'vitest';

import { createTextFile, TextFile } from '../TextFile.js';
import { unindent } from '../util/unindent.js';
import { CSpellConfigFileYaml, parseCSpellConfigFileYaml } from './CSpellConfigFileYaml.js';

const oc = <T>(obj: T) => expect.objectContaining(obj);

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

    test('getValue', () => {
        const config = exampleConfig();
        expect(config.getValue('words')).toEqual(['banana', 'apple', 'cabbage', 'date', 'eggplant']);
        expect(config.getNode('words')?.getValue?.(1)).toEqual('apple');
        expect(config.getValue('languageSettings')).toBeUndefined();
        expect(config.getValue('language')).toEqual('en');
    });

    test('setValue', () => {
        const config = exampleConfig();
        const nWords = config.getNode('words');
        assert(nWords, 'Expected words node to exist');
        nWords.setValue(1, 'Apple');
        expect(config.getValue('words')).toEqual(['banana', 'Apple', 'cabbage', 'date', 'eggplant']);
        expect(config.serialize()).toEqual(example().replace('apple', 'Apple'));
    });

    test('getNode', () => {
        const example = unindent`\
            # Top Comment Block
            name: cspell.config.yaml
            version: '0.2' # file version
            language: en # the locale to use.
            # Before object
            # Comment for words
            words:
                # This is a comment
                - banana # Inline 0
                # Before 1
                - apple # Inline 1
                # Before 2
                - cabbage
                - date

                # Section two
                - eggplant # Inline "eggplant"

            # After object
        `;

        const config = parseCSpellConfigFileYaml(asTextFile(example));
        expect(config.getNode('words')).toEqual(oc({ comment: undefined, commentBefore: ' This is a comment' }));
        expect(config.getNode('version')).toEqual(oc({ comment: ' file version', commentBefore: undefined }));
        expect(config.getNode('language')).toEqual(oc({ comment: ' the locale to use.', commentBefore: undefined }));
        expect(config.getNode('words')?.getNode(0)).toEqual(oc({ comment: ' Inline 0', commentBefore: undefined }));
        expect(config.getNode('words')?.getNode(1)).toEqual(oc({ comment: ' Inline 1', commentBefore: ' Before 1' }));
        expect(config.getNode('words')?.getNode(2)).toEqual(oc({ comment: undefined, commentBefore: ' Before 2' }));
        expect(config.getNode('words')?.getNode(4)).toEqual(
            oc({ comment: ' Inline "eggplant"', commentBefore: ' Section two' }),
        );
    });
});

function exampleConfig() {
    return parseCSpellConfigFileYaml(asTextFile(example()));
}

function example() {
    return unindent`\
        # Top Comment Block
        name: cspell.config.yaml
        version: '0.2' # file version
        language: en # the locale to use.
        # Before object
        # Comment for words
        words:
            # This is a comment
            - banana # Inline "b"
            # Before 1
            - apple # Inline "a"
            # Before 2
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
