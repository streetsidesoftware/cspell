import { resolvePathToFixture } from '../test/TestHelper';
import { createAllowedSplitWords } from './createWordsCollection';

describe('createAllowedSplitWords', () => {
    test.each`
        files                           | expectedSize | has           | expected
        ${undefined}                    | ${0}         | ${'hello'}    | ${true}
        ${'dicts/cities.txt'}           | ${8}         | ${'New York'} | ${true}
        ${'dicts/cities.txt'}           | ${8}         | ${'hello'}    | ${false}
        ${'dicts/colors.txt'}           | ${11}        | ${'blue'}     | ${true}
        ${'dicts/colors.trie'}          | ${11}        | ${'blue'}     | ${true}
        ${'dicts/hunspell/example.dic'} | ${7}         | ${'tried'}    | ${true}
    `('createAllowedSplitWords $files $has', async ({ files, expectedSize, has, expected }) => {
        const fixFiles: string[] | undefined = Array.isArray(files) ? files : !files ? undefined : [files];
        const allowedFiles = fixFiles?.map((file) => resolvePathToFixture(file));
        const allowed = await createAllowedSplitWords(allowedFiles);
        expect(allowed.size).toBe(expectedSize);
        expect(allowed.has(has)).toBe(expected);
    });
});
