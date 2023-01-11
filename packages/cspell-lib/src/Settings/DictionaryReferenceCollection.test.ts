import type { DictionaryReference } from '../../../cspell-types/dist';
import { createDictionaryReferenceCollection } from './DictionaryReferenceCollection';

describe('DictionaryReferenceCollection', () => {
    const dicts: DictionaryReference[] = ['typescript', '!!json', '!json', '!cpp', ' custom-dict ', '! python'];

    test.each`
        name            | expected
        ${'typescript'} | ${true}
        ${'json'}       | ${true}
        ${'cpp'}        | ${false}
        ${'unknown'}    | ${undefined}
    `('createDictionaryReferenceCollection.isEnabled $name', ({ name, expected }) => {
        const collection = createDictionaryReferenceCollection(dicts);
        expect(collection.isEnabled(name)).toBe(expected);
    });

    test.each`
        name            | expected
        ${'typescript'} | ${false}
        ${'json'}       | ${false}
        ${'cpp'}        | ${true}
        ${'unknown'}    | ${undefined}
    `('createDictionaryReferenceCollection.isBlocked $name', ({ name, expected }) => {
        const collection = createDictionaryReferenceCollection(dicts);
        expect(collection.isBlocked(name)).toBe(expected);
    });

    test('createDictionaryReferenceCollection.blocked', () => {
        const collection = createDictionaryReferenceCollection(dicts);
        expect(collection.blocked()).toEqual(['cpp', 'python']);
    });

    test('createDictionaryReferenceCollection.enabled', () => {
        const collection = createDictionaryReferenceCollection(dicts);
        expect(collection.enabled()).toEqual(['typescript', 'json', 'custom-dict']);
    });
});
