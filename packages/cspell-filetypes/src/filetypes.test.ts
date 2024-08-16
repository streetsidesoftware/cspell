import { describe, expect, test } from 'vitest';

import { definitions } from './definitions.js';
import * as LangId from './filetypes.js';

describe('Validate LanguageIds', () => {
    test.each`
        ext         | expected
        ${'ts'}     | ${['typescript']}
        ${'.tex'}   | ${['latex']}
        ${'.jpg'}   | ${['image']}
        ${'.jsonc'} | ${['json', 'jsonc']}
        ${'tex'}    | ${['latex']}
        ${'hs'}     | ${['haskell']}
        ${'PNG'}    | ${['image']}
    `('getLanguagesForExt $ext', ({ ext, expected }) => {
        expect(LangId.getFileTypesForExt(ext)).toEqual(expected);
    });

    test.each`
        filename                             | expected
        ${'code.ts'}                         | ${['typescript']}
        ${'base.r'}                          | ${['r']}
        ${'base.R'}                          | ${['r']}
        ${'doc.tex'}                         | ${['latex']}
        ${'Dockerfile.bin'}                  | ${['dockerfile']}
        ${'aws.Dockerfile'}                  | ${['dockerfile']}
        ${'image.jpg'}                       | ${['image']}
        ${'workspace.code-workspace'}        | ${['jsonc']}
        ${'.code-workspace'}                 | ${['jsonc']}
        ${'.cspellcache'}                    | ${['cache_files']}
        ${'Gemfile'}                         | ${['ruby']}
        ${'path/Gemfile'}                    | ${['ruby']}
        ${'Cargo.lock'}                      | ${['lock', 'toml']}
        ${'.errors.log.2'}                   | ${['log']}
        ${'my-cert.pem'}                     | ${['pem']}
        ${'my-private-cert.private-key.pem'} | ${['pem', 'pem-private-key']}
        ${'Dockerfile'}                      | ${['dockerfile']}
        ${'Dockerfile.dev'}                  | ${['dockerfile']}
        ${'docker.aws.compose.yaml'}         | ${['dockercompose']}
        ${'composer.lock'}                   | ${['json', 'lock']}
        ${'code.jl'}                         | ${['julia']}
    `('getLanguagesForBasename $filename', ({ filename, expected }) => {
        expect(LangId.findMatchingFileTypes(filename)).toEqual(expected);
    });

    test('that all extensions start with a .', () => {
        for (const def of definitions) {
            const extsWithoutPeriod = def.extensions.filter((ext) => ext[0] !== '.');
            expect(extsWithoutPeriod).toEqual([]);
        }
    });

    test.each`
        ext          | expected
        ${'.md'}     | ${false}
        ${'.exe'}    | ${true}
        ${'.obj'}    | ${true}
        ${'.dll'}    | ${true}
        ${'.gif'}    | ${true}
        ${'.jpeg'}   | ${true}
        ${'.jpg'}    | ${true}
        ${'.txt'}    | ${false}
        ${'md'}      | ${false}
        ${'exe'}     | ${true}
        ${'obj'}     | ${true}
        ${'.EXE'}    | ${true}
        ${'.bin'}    | ${true}
        ${'dll'}     | ${true}
        ${'gif'}     | ${true}
        ${'txt'}     | ${false}
        ${'unknown'} | ${false}
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
        ${'.EXE'}  | ${true}
        ${'.bin'}  | ${true}
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
        ${'Cargo.lock'}   | ${true}
        ${'doc.txt'}      | ${false}
        ${'lock'}         | ${false}
        ${'Gemfile'}      | ${false}
        ${'.cspellcache'} | ${true}
    `('isGeneratedExt $filename => $expected', ({ filename, expected }) => {
        expect(LangId.isGeneratedFile(filename)).toBe(expected);
    });

    test.each`
        filename           | expected
        ${'README.md'}     | ${false}
        ${'run.exe'}       | ${true}
        ${'lib.obj'}       | ${true}
        ${'lib.dll'}       | ${true}
        ${'lib.o'}         | ${true}
        ${'image.PNG'}     | ${true}
        ${'image.JPG'}     | ${true}
        ${'image.gif'}     | ${true}
        ${'picture.jpeg'}  | ${true}
        ${'picture.jpg'}   | ${true}
        ${'doc.txt'}       | ${false}
        ${'lock'}          | ${false}
        ${'Cargo.lock'}    | ${false}
        ${'Gemfile'}       | ${false}
        ${'.cspellcache'}  | ${false}
        ${'my-video.webm'} | ${true}
        ${'my-logo.svg'}   | ${false}
    `('isBinaryFile $filename => $expected', ({ filename, expected }) => {
        expect(LangId.isBinaryFile(filename)).toBe(expected);
    });

    test.each`
        filetype        | expected
        ${'typescript'} | ${false}
        ${'gzip'}       | ${true}
        ${'unknown'}    | ${false}
    `('isBinaryFileType $filetype => $expected', ({ filetype, expected }) => {
        expect(LangId.isBinaryFileType(filetype)).toBe(expected);
    });
});

// cspell:ignore dockercompose
