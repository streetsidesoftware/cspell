import { CSpellUserSettings } from '@cspell/cspell-types';
import * as Path from 'path';
import { URI } from 'vscode-uri';
import { ImportError } from './Settings/ImportError';
import {
    PartialDocument,
    spellCheckDocument,
    spellCheckFile,
    SpellCheckFileOptions,
    SpellCheckFileResult,
} from './spellCheckFile';

const samples = Path.resolve(__dirname, '../samples');
const isWindows = process.platform === 'win32';
const hasDriveLetter = /^[A-Z]:\\/;

describe('Validate Spell Checking Files', () => {
    interface TestSpellCheckFile {
        filename: string;
        settings: CSpellUserSettings;
        options: SpellCheckFileOptions;
        expected: Partial<SpellCheckFileResult>;
    }

    function oc<T>(t: T): T {
        return expect.objectContaining(t);
    }

    function err(msg: string): Error {
        return new ImportError(msg);
    }

    function eFailed(file: string): Error {
        return err(`Failed to find config file at: "${s(file)}"`);
    }

    function errNoEnt(file: string): Error {
        const message = `ENOENT: no such file or directory, open '${file}'`;
        return expect.objectContaining(new Error(message));
    }

    test.each`
        filename             | settings                    | options                                       | expected
        ${'src/not_found.c'} | ${{}}                       | ${{}}                                         | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${'src/sample.c'}    | ${{}}                       | ${{}}                                         | ${{ checked: true, issues: [], localConfigFilepath: s('.cspell.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ noConfigSearch: true }}                   | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{}}                                         | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ configFile: s('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{ configFile: s('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{ noConfigSearch: false }}                  | ${{ checked: true, localConfigFilepath: s('.cspell.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{}}                                         | ${{ document: expect.anything(), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ configFile: s('../cSpell.json') }}        | ${{ checked: false, localConfigFilepath: s('../cSpell.json'), errors: [eFailed(s('../cSpell.json'))] }}
        ${'src/not_found.c'} | ${{}}                       | ${{}}                                         | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${__filename}        | ${{}}                       | ${{}}                                         | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
    `(
        'spellCheckFile $filename $settings $options',
        async ({ filename, settings, options, expected }: TestSpellCheckFile) => {
            const r = await spellCheckFile(s(filename), options, settings);
            expect(r).toEqual(oc(expected));
        }
    );
});

describe('Validate Spell Checking Documents', () => {
    interface TestSpellCheckFile {
        uri: string;
        text: string | undefined;
        settings: CSpellUserSettings;
        options: SpellCheckFileOptions;
        expected: Partial<SpellCheckFileResult>;
    }

    function oc<T>(t: T): T {
        return expect.objectContaining(t);
    }

    function err(msg: string): Error {
        return new ImportError(msg);
    }

    function eFailed(file: string): Error {
        return err(`Failed to find config file at: "${s(file)}"`);
    }

    function errNoEnt(file: string): Error {
        const message = `ENOENT: no such file or directory, open '${file}'`;
        return expect.objectContaining(new Error(message));
    }

    function f(file: string): string {
        return URI.file(s(file)).toString();
    }

    function d(uri: string, text?: string): PartialDocument {
        return text === undefined ? { uri } : { uri, text };
    }

    type ArrayType<T> = T extends (infer R)[] ? R : never;

    type Issue = ArrayType<SpellCheckFileResult['issues']>;

    function i(...words: string[]): Partial<Issue>[] {
        return words.map((text) => ({ text })).map((i) => expect.objectContaining(i));
    }

    // cspell:ignore texxt
    test.each`
        uri                     | text            | settings                       | options                                       | expected
        ${f('src/not_found.c')} | ${''}           | ${{}}                          | ${{}}                                         | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${f('src/sample.c')}    | ${''}           | ${{}}                          | ${{}}                                         | ${{ checked: true, issues: [], localConfigFilepath: s('.cspell.json'), errors: undefined }}
        ${f('src/sample.c')}    | ${''}           | ${{}}                          | ${{ noConfigSearch: true }}                   | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${f('src/sample.c')}    | ${''}           | ${{ noConfigSearch: true }}    | ${{}}                                         | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${f('src/sample.c')}    | ${''}           | ${{}}                          | ${{ configFile: s('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
        ${f('src/sample.c')}    | ${''}           | ${{ noConfigSearch: true }}    | ${{ configFile: s('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
        ${f('src/sample.c')}    | ${''}           | ${{ noConfigSearch: true }}    | ${{ noConfigSearch: false }}                  | ${{ checked: true, localConfigFilepath: s('.cspell.json'), errors: undefined }}
        ${f('src/sample.c')}    | ${''}           | ${{}}                          | ${{}}                                         | ${{ document: oc(d(f('src/sample.c'))), errors: undefined }}
        ${f('src/sample.c')}    | ${''}           | ${{}}                          | ${{ configFile: s('../cSpell.json') }}        | ${{ checked: false, localConfigFilepath: s('../cSpell.json'), errors: [eFailed(s('../cSpell.json'))] }}
        ${f('src/not_found.c')} | ${''}           | ${{}}                          | ${{}}                                         | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${f(__filename)}        | ${''}           | ${{}}                          | ${{}}                                         | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
        ${'stdin:///'}          | ${'some text'}  | ${{ languageId: 'plaintext' }} | ${{}}                                         | ${{ checked: true, issues: [], localConfigFilepath: undefined, errors: undefined }}
        ${'stdin:///'}          | ${'some text'}  | ${{ languageId: 'plaintext' }} | ${{}}                                         | ${{ document: oc(d('stdin:///')) }}
        ${'stdin:///'}          | ${'some texxt'} | ${{ languageId: 'plaintext' }} | ${{}}                                         | ${{ checked: true, issues: i('texxt'), localConfigFilepath: undefined, errors: undefined }}
        ${'stdin:///'}          | ${''}           | ${{ languageId: 'plaintext' }} | ${{}}                                         | ${{ checked: false, issues: [], localConfigFilepath: undefined, errors: [err('Unsupported schema: "stdin", open "stdin:/"')] }}
    `(
        'spellCheckFile $uri $settings $options',
        async ({ uri, text, settings, options, expected }: TestSpellCheckFile) => {
            const r = await spellCheckDocument(d(uri, text || undefined), options, settings);
            expect(r).toEqual(oc(expected));
        }
    );
});

describe('Validate Uri assumptions', () => {
    interface UriComponents {
        scheme: string;
        authority: string;
        path: string;
        query: string;
        fragment: string;
        fsPath?: string;
    }

    type PartialUri = Partial<UriComponents>;

    function u(filename: string): string {
        return URI.file(fixDriveLetter(filename)).toString();
    }

    function schema(scheme: string): PartialUri {
        return { scheme };
    }

    function authority(authority: string): PartialUri {
        return { authority };
    }

    function path(path: string): PartialUri {
        return { path };
    }

    function m(...parts: PartialUri[]): PartialUri {
        const u: PartialUri = {};
        for (const p of parts) {
            Object.assign(u, p);
        }
        return u;
    }

    function normalizePath(p: string): string {
        return fixDriveLetter(p).replace(/\\/g, '/');
    }

    interface UriTestCase {
        uri: string;
        expected: PartialUri;
    }

    test.each`
        uri                                                      | expected                                                                                  | comment
        ${u(__filename)}                                         | ${m(schema('file'), path(normalizePath(__filename)))}                                     | ${''}
        ${'stdin:///'}                                           | ${m(schema('stdin'), path('/'), authority(''))}                                           | ${''}
        ${'https://github.com/streetsidesoftware/cspell/issues'} | ${m(schema('https'), authority('github.com'), path('/streetsidesoftware/cspell/issues'))} | ${''}
        ${'C:\\home\\project\\file.js'}                          | ${m(schema('C'), path('\\home\\project\\file.js'))}                                       | ${'Windows path by "accident"'}
    `('URI assumptions uri: "$uri" $comment -- $expected', ({ uri, expected }: UriTestCase) => {
        const u = URI.parse(uri);
        expect(u).toEqual(expect.objectContaining(expected));
    });
});

function fixDriveLetter(p: string): string {
    if (!hasDriveLetter.test(p)) return p;
    return p[0].toLowerCase() + p.slice(1);
}

function s(file: string) {
    const p = Path.resolve(samples, file);
    // Force lowercase drive letter if windows
    return isWindows ? fixDriveLetter(p) : p;
}
