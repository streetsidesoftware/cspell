import * as LangId from './LanguageIds';

describe('Validate LanguageIds', () => {
    test.each`
        ext         | expected
        ${'ts'}     | ${['typescript']}
        ${'.tex'}   | ${['latex']}
        ${'.jpg'}   | ${['image']}
        ${'.jsonc'} | ${['json', 'jsonc']}
        ${'tex'}    | ${['latex']}
        ${'hs'}     | ${['haskell']}
    `('getLanguagesForExt $ext', ({ ext, expected }) => {
        expect(LangId.getLanguagesForExt(ext)).toEqual(expected);
    });

    test.each`
        filename                             | expected
        ${'code.ts'}                         | ${['typescript']}
        ${'base.r'}                          | ${['r']}
        ${'base.R'}                          | ${['r']}
        ${'doc.tex'}                         | ${['latex']}
        ${'image.jpg'}                       | ${['image']}
        ${'workspace.code-workspace'}        | ${['jsonc']}
        ${'.cspellcache'}                    | ${['cache_files']}
        ${'Gemfile'}                         | ${['ruby']}
        ${'path/Gemfile'}                    | ${[]}
        ${'my-cert.pem'}                     | ${['pem']}
        ${'my-private-cert.private-key.pem'} | ${['pem', 'pem-private-key']}
    `('getLanguagesForBasename $filename', ({ filename, expected }) => {
        expect(LangId.getLanguagesForBasename(filename)).toEqual(expected);
    });

    test('that all extensions start with a .', () => {
        for (const def of LangId.languageExtensionDefinitions) {
            const extsWithoutPeriod = def.extensions.filter((ext) => ext[0] !== '.');
            expect(extsWithoutPeriod).toEqual([]);
        }
    });

    test.each`
        ext        | expected
        ${'.md'}   | ${false}
        ${'.exe'}  | ${true}
        ${'.obj'}  | ${true}
        ${'.dll'}  | ${true}
        ${'.gif'}  | ${true}
        ${'.jpeg'} | ${true}
        ${'.jpg'}  | ${true}
        ${'.txt'}  | ${false}
        ${'md'}    | ${false}
        ${'exe'}   | ${true}
        ${'obj'}   | ${true}
        ${'dll'}   | ${true}
        ${'gif'}   | ${true}
        ${'txt'}   | ${false}
    `('isBinaryExt $ext => $expected', ({ ext, expected }) => {
        expect(LangId.isBinaryExt(ext)).toBe(expected);
    });

    test.each`
        ext        | expected
        ${'.md'}   | ${false}
        ${'.exe'}  | ${true}
        ${'.obj'}  | ${true}
        ${'.dll'}  | ${true}
        ${'.gif'}  | ${true}
        ${'.jpeg'} | ${true}
        ${'.jpg'}  | ${true}
        ${'.txt'}  | ${false}
        ${'md'}    | ${false}
        ${'exe'}   | ${true}
        ${'obj'}   | ${true}
        ${'dll'}   | ${true}
        ${'gif'}   | ${true}
        ${'txt'}   | ${false}
        ${'pdf'}   | ${true}
        ${'lock'}  | ${true}
    `('isGeneratedExt $ext => $expected', ({ ext, expected }) => {
        expect(LangId.isGeneratedExt(ext)).toBe(expected);
    });

    test.each`
        filename          | expected
        ${'README.md'}    | ${false}
        ${'run.exe'}      | ${true}
        ${'lib.obj'}      | ${true}
        ${'lib.dll'}      | ${true}
        ${'lib.o'}        | ${true}
        ${'image.gif'}    | ${true}
        ${'picture.jpeg'} | ${true}
        ${'picture.jpg'}  | ${true}
        ${'doc.txt'}      | ${false}
        ${'lock'}         | ${false}
        ${'Gemfile'}      | ${false}
        ${'.cspellcache'} | ${true}
    `('isGeneratedExt $filename => $expected', ({ filename, expected }) => {
        expect(LangId.isGeneratedFile(filename)).toBe(expected);
    });

    test.each`
        filename          | expected
        ${'README.md'}    | ${false}
        ${'run.exe'}      | ${true}
        ${'lib.obj'}      | ${true}
        ${'lib.dll'}      | ${true}
        ${'lib.o'}        | ${true}
        ${'image.gif'}    | ${true}
        ${'picture.jpeg'} | ${true}
        ${'picture.jpg'}  | ${true}
        ${'doc.txt'}      | ${false}
        ${'lock'}         | ${false}
        ${'Gemfile'}      | ${false}
        ${'.cspellcache'} | ${false}
    `('isGeneratedExt $filename => $expected', ({ filename, expected }) => {
        expect(LangId.isBinaryFile(filename)).toBe(expected);
    });
});
