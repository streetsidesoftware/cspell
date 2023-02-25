import type { CSpellSettingsWithSourceTrace, CSpellUserSettings } from '@cspell/cspell-types';
import * as Path from 'path';
import { posix } from 'path';

import type { Document } from './Document';
import { fileToDocument, fileToTextDocument } from './Document/resolveDocument';
import type { CSpellSettingsInternal } from './Models/CSpellSettingsInternalDef';
import { ImportError } from './Settings/Controller/ImportError';
import type { SpellCheckFileOptions, SpellCheckFileResult } from './spellCheckFile';
import { determineFinalDocumentSettings, spellCheckDocument, spellCheckFile } from './spellCheckFile';
import { extendExpect } from './test/test.matchers';
import * as Uri from './util/Uri';

const samples = Path.resolve(__dirname, '../samples');
const testFixtures = Path.resolve(__dirname, '../../../test-fixtures');
const hasDriveLetter = /^[A-Z]:\\/i;

const { toEqualCaseInsensitive: expectToEqualCaseInsensitive } = extendExpect(expect);

const oc = expect.objectContaining;
const sc = expect.stringContaining;

describe('Validate Spell Checking Files', () => {
    interface TestSpellCheckFile {
        filename: string;
        settings: CSpellUserSettings;
        options: SpellCheckFileOptions;
        expected: Partial<SpellCheckFileResult>;
    }

    test.each`
        filename             | settings                    | options                                         | expected
        ${'src/not_found.c'} | ${{}}                       | ${{}}                                           | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${'src/sample.c'}    | ${{}}                       | ${{}}                                           | ${{ checked: true, issues: [], localConfigFilepath: es('.cspell.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ noConfigSearch: true }}                     | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${'src/README.md'}   | ${{}}                       | ${{}}                                           | ${{ checked: true, issues: [], localConfigFilepath: es('.cspell.json'), errors: undefined }}
        ${__filename}        | ${{}}                       | ${{ noConfigSearch: true }}                     | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{}}                                           | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${__filename}        | ${{}}                       | ${{ configFile: rpS('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
        ${__filename}        | ${{ noConfigSearch: true }} | ${{ configFile: rpS('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{ noConfigSearch: false }}                    | ${{ checked: true, localConfigFilepath: es('.cspell.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{}}                                           | ${{ document: expect.anything(), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ configFile: rpS('../cSpell.json') }}        | ${{ checked: false, localConfigFilepath: es('../cSpell.json'), errors: [eFailed(rpS('../cSpell.json'))] }}
        ${'src/not_found.c'} | ${{}}                       | ${{}}                                           | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${__filename}        | ${{}}                       | ${{}}                                           | ${{ checked: true, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
    `(
        'spellCheckFile $filename $settings $options',
        async ({ filename, settings, options, expected }: TestSpellCheckFile) => {
            const r = sanitizeSpellCheckFileResult(await spellCheckFile(rpS(filename), options, settings));
            expect(r).toEqual(oc(expected));
        }
    );
});

describe('Validate Determine settings', () => {
    function u(filename: string): string {
        return Uri.toUri(Path.resolve(__dirname, filename)).toString();
    }

    const doc = fileToDocument;

    test.each`
        document                                                                  | settings              | expected                                       | comment
        ${doc(u('README.md'), '# README\n')}                                      | ${{}}                 | ${{ languageId: 'markdown', language: 'en' }}  | ${'from uri'}
        ${doc(u('README.md'), '# README\n \x63spell:locale fr')}                  | ${{}}                 | ${{ languageId: 'markdown', language: 'fr' }}  | ${'In doc locale'}
        ${doc('stdin:///', '# README\n', 'markdown')}                             | ${{}}                 | ${{ languageId: 'markdown', language: 'en' }}  | ${'passed with doc'}
        ${doc('stdin:///README.txt', '# README\n')}                               | ${{}}                 | ${{ languageId: 'plaintext', language: 'en' }} | ${'from stdin uri'}
        ${doc(u('README.md'), '# README\n', 'plaintext')}                         | ${{}}                 | ${{ languageId: 'plaintext', language: 'en' }} | ${'override with doc'}
        ${doc(u('README.md'), '# README\n', undefined, 'fr')}                     | ${{}}                 | ${{ languageId: 'markdown', language: 'fr' }}  | ${'passed with doc'}
        ${doc(u('README.md'), '# README\n \x63spell:locale fr', undefined, 'en')} | ${{}}                 | ${{ languageId: 'markdown', language: 'fr' }}  | ${'In doc locale wins'}
        ${doc(u('README.md'), '# README\n')}                                      | ${{ language: 'fr' }} | ${{ languageId: 'markdown', language: 'fr' }}  | ${'Language from settings'}
        ${doc(u('README.md'), '# README\n', undefined, 'en')}                     | ${{ language: 'fr' }} | ${{ languageId: 'markdown', language: 'en' }}  | ${'passed with doc'}
    `('determineFinalDocumentSettings($document, $settings) $expected $comment', ({ document, settings, expected }) => {
        const settingsResult = sanitizeSettings(determineFinalDocumentSettings(document, settings).settings, [
            'languageId',
            'language',
        ]);
        expect(settingsResult).toEqual(expect.objectContaining(expected));
    });
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

    function f(file: string): string {
        return Uri.file(rpS(file)).toString();
    }

    function d(uri: string | Document, text?: string, languageId?: string): Document {
        const doc: Document = typeof uri === 'string' ? { uri } : { ...uri };
        if (text) {
            doc.text = text;
        }
        if (languageId) {
            doc.languageId = languageId;
        }
        return doc;
    }

    type ArrayType<T> = T extends (infer R)[] ? R : never;

    type Issue = ArrayType<SpellCheckFileResult['issues']>;

    function i(...words: string[]): Partial<Issue>[] {
        return words.map((text) => ({ text })).map((i) => expect.objectContaining(i));
    }

    // cspell:ignore texxt eslintcache
    test.each`
        uri                                               | text            | settings                       | options                                         | expected
        ${f('src/not_found.c')}                           | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${f('src/sample.c')}                              | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: true, issues: [], localConfigFilepath: es('.cspell.json'), errors: undefined }}
        ${f('src/sample.c')}                              | ${''}           | ${{}}                          | ${{ noConfigSearch: true }}                     | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${f('src/sample.c')}                              | ${''}           | ${{ noConfigSearch: true }}    | ${{}}                                           | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${f('src/sample.c')}                              | ${''}           | ${{}}                          | ${{ configFile: rpS('../cspell.config.json') }} | ${{ checked: false, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
        ${f('src/sample.c')}                              | ${''}           | ${{ noConfigSearch: true }}    | ${{ configFile: rpS('../cspell.config.json') }} | ${{ checked: false, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
        ${f(__filename)}                                  | ${''}           | ${{}}                          | ${{ configFile: rpS('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
        ${f(__filename)}                                  | ${''}           | ${{ noConfigSearch: true }}    | ${{ configFile: rpS('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
        ${f('src/sample.c')}                              | ${''}           | ${{ noConfigSearch: true }}    | ${{ noConfigSearch: false }}                    | ${{ checked: true, localConfigFilepath: es('.cspell.json'), errors: undefined }}
        ${f('src/sample.c')}                              | ${''}           | ${{}}                          | ${{}}                                           | ${{ document: oc(d(f('src/sample.c'))), errors: undefined }}
        ${f('src/sample.c')}                              | ${''}           | ${{}}                          | ${{ configFile: rpS('../cSpell.json') }}        | ${{ checked: false, localConfigFilepath: es('../cSpell.json'), errors: [eFailed(rpS('../cSpell.json'))] }}
        ${f('src/not_found.c')}                           | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${f(__filename)}                                  | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: true, localConfigFilepath: es('../cspell.config.json'), errors: undefined }}
        ${'stdin:///'}                                    | ${'some text'}  | ${{ languageId: 'plaintext' }} | ${{}}                                           | ${{ checked: true, issues: [], localConfigFilepath: undefined, errors: undefined }}
        ${'stdin:///'}                                    | ${'some text'}  | ${{ languageId: 'plaintext' }} | ${{}}                                           | ${{ document: oc(d('stdin:///')) }}
        ${'stdin:///'}                                    | ${'some texxt'} | ${{ languageId: 'plaintext' }} | ${{}}                                           | ${{ checked: true, issues: i('texxt'), localConfigFilepath: undefined, errors: undefined }}
        ${'stdin:///'}                                    | ${''}           | ${{ languageId: 'plaintext' }} | ${{}}                                           | ${{ checked: false, issues: [], localConfigFilepath: undefined, errors: [err('Unsupported schema: "stdin", open "stdin:///"')] }}
        ${f('src/big_image.jpeg')}                        | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: false, errors: undefined }}
        ${f('.cspellcache')}                              | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: false, errors: undefined }}
        ${f('.eslintcache')}                              | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: false, errors: undefined }}
        ${d(f('src/big_image.txt'), undefined, 'binary')} | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: false, errors: undefined }}
        ${f('./ruby/Gemfile')}                            | ${''}           | ${{}}                          | ${{}}                                           | ${{ checked: true, errors: undefined, settingsUsed: oc({ languageId: 'ruby' }) }}
    `(
        'spellCheckFile $uri $settings $options',
        async ({ uri, text, settings, options, expected }: TestSpellCheckFile) => {
            const r = sanitizeSpellCheckFileResult(
                await spellCheckDocument(d(uri, text || undefined), options, settings),
                ['checked', 'errors', 'issues', 'localConfigFilepath', 'settingsUsed', 'document']
            );
            expect(r).toEqual(oc(expected));
        }
    );
    test.each`
        uri                                                 | text  | settings | options | expected
        ${f(tf('issues/issue-1775/hunspell/utf_info.hxx'))} | ${''} | ${{}}    | ${{}}   | ${{ checked: true, errors: undefined }}
    `(
        'spellCheckFile fixtures $uri $settings $options',
        async ({ uri, text, settings, options, expected }: TestSpellCheckFile) => {
            const r = sanitizeSpellCheckFileResult(
                await spellCheckDocument(d(uri, text || undefined), options, settings)
            );
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
    }

    type PartialUri = Partial<UriComponents>;

    function u(filename: string): string {
        return Uri.file(fixDriveLetter(filename)).toString();
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
        return posix.normalize('/' + fixDriveLetter(p).replace(/\\/g, '/'));
    }

    interface UriTestCase {
        uri: string;
        expected: PartialUri;
    }

    test.each`
        uri                                                      | expected                                                                                  | comment
        ${u(__filename)}                                         | ${{ scheme: 'file', path: normalizePath(__filename) }}                                    | ${''}
        ${'stdin:///'}                                           | ${{ scheme: 'stdin', path: '/' }}                                                         | ${''}
        ${'https://github.com/streetsidesoftware/cspell/issues'} | ${m(schema('https'), authority('github.com'), path('/streetsidesoftware/cspell/issues'))} | ${''}
        ${'C:\\home\\project\\file.js'}                          | ${m(schema('C'), path('\\home\\project\\file.js'))}                                       | ${'Windows path by "accident"'}
    `('URI assumptions uri: "$uri" $comment -- $expected', ({ uri, expected }: UriTestCase) => {
        const u = Uri.parse(uri);
        expect(u).toEqual(expect.objectContaining(expected));
    });
});

describe('fileToTextDocument', () => {
    test.each`
        file          | expected
        ${__filename} | ${sc('This bit of text')}
    `('fileToTextDocument', async ({ file, expected }) => {
        const doc = await fileToTextDocument(file);
        expect(doc.text).toEqual(expected);
    });
});

function fixDriveLetter(p: string): string {
    if (!hasDriveLetter.test(p)) return p;
    return p[0].toLowerCase() + p.slice(1);
}

/**
 * Resolve file path to samples
 * @param file - path to resolve
 * @returns the resolved path
 */
function rpS(file: string) {
    const p = Path.resolve(samples, file);
    // Force lowercase drive letter if windows
    return fixDriveLetter(p);
}

/**
 * Expect a Sample File Path
 * @param file - relative path to sample or absolute path.
 * @returns as `expect`
 */
function es(file: string) {
    return expectToEqualCaseInsensitive(rpS(file));
}

function tf(file: string) {
    return Path.resolve(testFixtures, file);
}

function err(msg: string): Error {
    return new ImportError(msg);
}

function errNoEnt(file: string): Error {
    const message = `ENOENT: no such file or directory, open '${file}'`;
    return expect.objectContaining(new Error(message));
}

function eFailed(file: string): Error {
    return oc({
        message: expectToEqualCaseInsensitive(`Failed to read config file: "${rpS(file)}"`),
    });
}

function sanitizeSpellCheckFileResult(
    spellCheckResult: SpellCheckFileResult,
    scKeys: (keyof SpellCheckFileResult)[] = ['checked', 'errors', 'issues', 'localConfigFilepath', 'document'],
    cfgKeys?: (keyof CSpellUserSettings)[]
): Partial<SpellCheckFileResult> {
    const result = filterKeys(spellCheckResult, scKeys);
    if (result.settingsUsed) {
        result.settingsUsed = sanitizeSettings(spellCheckResult.settingsUsed, cfgKeys);
    }
    if (result.document) {
        result.document = filterKeys(result.document, ['uri', 'languageId', 'locale']);
    }

    return result;
}

function sanitizeSettings(
    cs: CSpellSettingsInternal | CSpellSettingsWithSourceTrace,
    keys: (keyof CSpellUserSettings)[] = ['languageId']
): CSpellUserSettings {
    return filterKeys(cs, keys);
}

function filterKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = { ...obj };
    const r = <Record<string, unknown>>result;
    const strKeys: string[] = keys.map((a) => a.toString());
    const keep = new Set<string>(strKeys);
    for (const key of Object.keys(r)) {
        if (!keep.has(key)) {
            delete r[key];
        }
    }
    return result;
}
