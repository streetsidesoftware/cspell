import type { CSpellUserSettings } from '@cspell/cspell-types';
import assert from 'assert';
import { promises as fs } from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { describe, expect, test } from 'vitest';

import { pathPackageFixtures, pathPackageRoot } from '../../test-util/test.locations.js';
import type { TextDocument } from '../Models/TextDocument.js';
import { createTextDocument } from '../Models/TextDocument.js';
import type { ValidationIssue } from '../Models/ValidationIssue.js';
import type { WordSuggestion } from '../suggestions.js';
import { AutoCache } from '../util/simpleCache.js';
import { toUri } from '../util/Uri.js';
import type { DocumentValidatorOptions } from './docValidator.js';
import { __testing__, DocumentValidator, shouldCheckDocument } from './docValidator.js';

const docCache = new AutoCache(_loadDoc, 100);
const fixturesDir = pathPackageFixtures;

const oc = expect.objectContaining;
const ac = expect.arrayContaining;
const sc = expect.stringContaining;

const { sanitizeSuggestion } = __testing__;

const timeout = 10000;

describe('docValidator', () => {
    test('DocumentValidator', () => {
        const doc = td(__filename, '/** This is some code */');
        const dVal = new DocumentValidator(doc, {}, {});
        expect(dVal.document).toBe(doc);
        // dVal.prepareSync();
        // expect(dVal.checkText([0, 0], '', [])).toEqual([]);
    });

    test.each`
        filename
        ${__filename}
        ${path.join(pathPackageRoot, 'package.json')}
    `('DocumentValidator prepare $filename', async ({ filename }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, {}, {});
        expect(dVal.ready).toBe(false);
        await expect(dVal.prepare()).resolves.toBeUndefined();
        expect(dVal.ready).toBe(true);
    });

    // cspell:ignore Helllo grrrr dockblock

    test.each`
        filename                                   | startText       | endText      | expected
        ${__filename}                              | ${'__filename'} | ${undefined} | ${[]}
        ${fix('sample-with-errors.ts')}            | ${"'H"}         | ${"'"}       | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'/**'}        | ${'*/'}      | ${[oc({ text: 'dockblock' })]}
        ${fix('sample-with-errors.ts')}            | ${'main'}       | ${undefined} | ${[]}
        ${fix('sample-with-cspell-directives.ts')} | ${'grrrr'}      | ${undefined} | ${[]}
        ${fixDict('remote/test.txt')}              | ${'New'}        | ${'Paris'}   | ${[]}
    `(
        'checkText async $filename "$startText"',
        async ({ filename, startText, endText, expected }) => {
            const doc = await loadDoc(filename);
            const dVal = new DocumentValidator(doc, {}, {});
            await dVal.prepare();
            const startOffset = doc.text.indexOf(startText);
            const endOffset = endText
                ? doc.text.indexOf(endText, startOffset + startText.length) + endText.length
                : startOffset + startText.length;
            assert(startOffset >= 0);
            const range = [startOffset, endOffset] as const;
            const text = doc.text.slice(startOffset, endOffset);
            expect(dVal.checkText(range, text, [])).toEqual(expected);
            expect(dVal.prepTime).toBeGreaterThan(0);
        },
        timeout
    );

    test.each`
        filename                                   | text            | configFile            | expected
        ${__filename}                              | ${'__filename'} | ${undefined}          | ${[]}
        ${fix('sample-with-errors.ts')}            | ${'Helllo'}     | ${undefined}          | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'Helllo'}     | ${fix('cspell.json')} | ${[oc({ text: 'Helllo' })]}
        ${fix('sample-with-errors.ts')}            | ${'main'}       | ${undefined}          | ${[]}
        ${fix('sample-with-cspell-directives.ts')} | ${'grrrr'}      | ${undefined}          | ${[]}
    `('checkText sync $filename "$text"', async ({ filename, text, expected, configFile }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, { configFile }, {});
        dVal.prepareSync();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        expect(dVal.checkText(range, text, [])).toEqual(expected);
        expect(dVal.prepTime).toBeGreaterThan(0);
    });

    test.each`
        filename                        | text        | expected
        ${fix('sample-with-errors.ts')} | ${'Helllo'} | ${[oc({ text: 'Helllo', suggestions: ac(['hello']) })]}
    `('checkText suggestions $filename "$text"', async ({ filename, text, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, { generateSuggestions: true }, { suggestionsTimeout: 10000 });
        dVal.prepareSync();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        const result = dVal.checkText(range, text, []);
        expect(result).toEqual(expected);
        expect(dVal.prepTime).toBeGreaterThan(0);
    });

    test.each`
        filename                        | text        | expected
        ${fix('sample-with-errors.ts')} | ${'Helllo'} | ${[oc({ text: 'Helllo', suggestions: ac(['hello']) })]}
    `('checkText Async suggestions $filename "$text"', async ({ filename, text, expected }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, { generateSuggestions: true }, { suggestionsTimeout: 10000 });
        await dVal.prepare();
        const offset = doc.text.indexOf(text);
        assert(offset >= 0);
        const range = [offset, offset + text.length] as const;
        const result = dVal.checkText(range, text, []);
        expect(result).toEqual(expected);
        expect(dVal.prepTime).toBeGreaterThan(0);
    });

    // cspell:ignore kount naame colector Reciever reciever recievers serrors dockblock
    test.each`
        filename                                   | maxDuplicateProblems | expectedIssues                                                                                                                                                                                | expectedRawIssues
        ${fix('sample-with-errors.ts')}            | ${undefined}         | ${['dockblock', 'Helllo']}                                                                                                                                                                    | ${undefined}
        ${fix('sample-with-many-errors.ts')}       | ${undefined}         | ${['reciever', 'naame', 'naame', 'naame', 'reciever', 'Reciever', 'naame', 'Reciever', 'naame', 'kount', 'Reciever', 'kount', 'colector', 'recievers', 'Reciever', 'recievers', 'recievers']} | ${undefined}
        ${fix('sample-with-many-errors.ts')}       | ${1}                 | ${['reciever', 'naame', 'Reciever', 'kount', 'colector', 'recievers']}                                                                                                                        | ${undefined}
        ${fix('parser/sample.ts')}                 | ${1}                 | ${['serrors']}                                                                                                                                                                                | ${['\\x73errors']}
        ${fix('sample-with-directives-errors.ts')} | ${1}                 | ${['disable-prev', 'ignored', 'world', 'enable-line']}                                                                                                                                        | ${undefined}
    `(
        'checkDocument $filename $maxDuplicateProblems',
        async ({ filename, maxDuplicateProblems, expectedIssues, expectedRawIssues }) => {
            const doc = await loadDoc(filename);
            const dVal = new DocumentValidator(doc, { generateSuggestions: false }, { maxDuplicateProblems });
            await dVal.prepare();
            const r = dVal.checkDocument();

            expect(r.map((issue) => issue.text)).toEqual(expectedIssues);
            expect(extractRawText(doc.text, r)).toEqual(expectedRawIssues ?? expectedIssues);
        }
    );

    function mkI(text: string, ...sug: string[]) {
        return { text, suggestionsEx: sug.map((word) => ({ word, isPreferred: true })) };
    }

    test.each`
        filename                               | expectedIssues
        ${fix('sample-with-common-errors.md')} | ${expect.arrayContaining([mkI('acceptible', 'acceptable'), mkI('accidently', 'accidentally')]) /* cspell:disable-line */}
    `('checkDocument with preferred $filename', async ({ filename, maxDuplicateProblems, expectedIssues }) => {
        const doc = await loadDoc(filename);
        const dVal = new DocumentValidator(doc, { generateSuggestions: false }, { maxDuplicateProblems });
        await dVal.prepare();
        const r = dVal.checkDocument().map(({ text, suggestionsEx }) => ({ text, suggestionsEx }));

        expect(r).toEqual(expectedIssues);
    });

    test.each`
        filename                                   | maxDuplicateProblems | expectedIssues                                                                                                                                                                                | expectedRawIssues
        ${fix('sample-with-errors.ts')}            | ${undefined}         | ${['dockblock', 'Helllo']}                                                                                                                                                                    | ${undefined}
        ${fix('sample-with-many-errors.ts')}       | ${undefined}         | ${['reciever', 'naame', 'naame', 'naame', 'reciever', 'Reciever', 'naame', 'Reciever', 'naame', 'kount', 'Reciever', 'kount', 'colector', 'recievers', 'Reciever', 'recievers', 'recievers']} | ${undefined}
        ${fix('sample-with-many-errors.ts')}       | ${1}                 | ${['reciever', 'naame', 'Reciever', 'kount', 'colector', 'recievers']}                                                                                                                        | ${undefined}
        ${fix('parser/sample.ts')}                 | ${1}                 | ${['serrors']}                                                                                                                                                                                | ${['\\x73errors']}
        ${fix('sample-with-directives-errors.ts')} | ${1}                 | ${['disable-prev', 'ignored', 'world', 'enable-line']}                                                                                                                                        | ${undefined}
    `(
        'checkDocumentAsync $filename $maxDuplicateProblems',
        async ({ filename, maxDuplicateProblems, expectedIssues, expectedRawIssues }) => {
            const doc = await loadDoc(filename);
            const dVal = new DocumentValidator(doc, { generateSuggestions: false }, { maxDuplicateProblems });
            const r = await dVal.checkDocumentAsync();

            expect(r.map((issue) => issue.text)).toEqual(expectedIssues);
            expect(extractRawText(doc.text, r)).toEqual(expectedRawIssues ?? expectedIssues);
        }
    );

    test('updateDocumentText', () => {
        // cspell:ignore foor
        const expectedIssues = [
            oc({
                text: 'foor',
                isFound: false,
                isFlagged: false,
                line: { text: 'foor\n', offset: 14, position: { character: 0, line: 3 } },
            }),
        ];
        const doc = td('files://words.txt', 'one\ntwo\nthree\nfoor\n', 'plaintext');
        const dVal = new DocumentValidator(doc, { generateSuggestions: false }, {});
        dVal.prepareSync();
        const r = dVal.checkDocument();
        expect(r).toEqual(expectedIssues);
        dVal.updateDocumentText(doc.text + '# cspell:ignore foor\n');
        expect(dVal.checkDocument()).toEqual([]);
    });

    function ws(ex: Partial<WordSuggestion>): Partial<WordSuggestion> {
        return ex;
    }

    test.each`
        sug                                                                   | expected
        ${ws({ word: 'a' })}                                                  | ${{ word: 'a' }}
        ${ws({ word: 'a', wordAdjustedToMatchCase: 'A' })}                    | ${{ word: 'a', wordAdjustedToMatchCase: 'A' }}
        ${ws({ word: 'a', isPreferred: undefined })}                          | ${{ word: 'a' }}
        ${ws({ word: 'a', isPreferred: false })}                              | ${{ word: 'a' }}
        ${ws({ word: 'a', isPreferred: true })}                               | ${{ word: 'a', isPreferred: true }}
        ${ws({ word: 'a', wordAdjustedToMatchCase: '', isPreferred: false })} | ${{ word: 'a' }}
        ${ws({ word: 'a', wordAdjustedToMatchCase: 'A', isPreferred: true })} | ${{ word: 'a', wordAdjustedToMatchCase: 'A', isPreferred: true }}
    `('sanitizeSuggestion $sug', ({ sug, expected }) => {
        expect(sanitizeSuggestion(sug)).toEqual(expected);
    });
});

describe('shouldCheckDocument', () => {
    test.each`
        file                            | options                           | settings                                  | expected
        ${'src/code.ts'}                | ${opts()}                         | ${s()}                                    | ${true}
        ${'src/code.ts'}                | ${opts({ noConfigSearch: true })} | ${s()}                                    | ${true}
        ${'src/code.ts'}                | ${opts()}                         | ${s({ noConfigSearch: true })}            | ${true}
        ${'src/code.ts'}                | ${opts()}                         | ${s({ loadDefaultConfiguration: false })} | ${true}
        ${'src/code.ts'}                | ${opts({ noConfigSearch: true })} | ${s({ loadDefaultConfiguration: false })} | ${true}
        ${'node_modules/mod/index.js'}  | ${opts()}                         | ${s()}                                    | ${false}
        ${'node_modules/mod/index.js'}  | ${opts({ noConfigSearch: true })} | ${s()}                                    | ${true}
        ${'node_modules/mod/index.js'}  | ${opts()}                         | ${s({ noConfigSearch: true })}            | ${true}
        ${'node_modules/mod/index.js'}  | ${opts()}                         | ${s({ loadDefaultConfiguration: false })} | ${false}
        ${'node_modules/mod/index.js'}  | ${opts({ noConfigSearch: true })} | ${s({ loadDefaultConfiguration: false })} | ${true}
        ${'node_modules/mod/index.jpg'} | ${opts()}                         | ${s({ loadDefaultConfiguration: false })} | ${false}
        ${'node_modules/mod/index.jpg'} | ${opts()}                         | ${s({ loadDefaultConfiguration: true })}  | ${false}
        ${'src/code.ts'}                | ${opts({ configFile: '_nf_' })}   | ${s()}                                    | ${{ errors: [oc({ message: sc('Failed to read') })], shouldCheck: true }}
    `(
        'shouldCheckDocument file: $file options: $options settings: $settings',
        async ({ file, options, settings, expected }) => {
            const uri = toUri(pathToFileURL(file));
            if (typeof expected === 'boolean') {
                expected = { errors: [], shouldCheck: expected };
            }
            expect(await shouldCheckDocument({ uri }, options, settings)).toEqual(expected);
        }
    );
});

function extractRawText(text: string, issues: ValidationIssue[]): string[] {
    return issues.map((issue) => {
        const start = issue.offset;
        const end = start + (issue.length ?? issue.text.length);
        return text.slice(start, end);
    });
}

function td(uri: string, content: string, languageId?: string, locale?: string, version = 1): TextDocument {
    return createTextDocument({ uri, content, languageId, locale, version });
}

async function _loadDoc(filename: string): Promise<TextDocument> {
    const content = await fs.readFile(filename, 'utf8');

    return createTextDocument({ uri: filename, content });
}

function loadDoc(filename: string) {
    return docCache.get(filename);
}

function fix(...fixtureFile: string[]): string {
    return path.resolve(path.join(fixturesDir, 'docValidator'), ...fixtureFile);
}

function fixDict(...fixtureFile: string[]): string {
    return fix('../dictionaries', ...fixtureFile);
}

function opts(...options: DocumentValidatorOptions[]): DocumentValidatorOptions {
    return merge({}, ...options);
}

function s(...settings: CSpellUserSettings[]): CSpellUserSettings {
    return merge({}, ...settings);
}

function merge<T extends object>(first: T, ...rest: T[]): T {
    if (!rest.length) return first;
    return { ...first, ...merge(rest[0], ...rest.slice(1)) };
}
